import { mulberry32, hashString, pick } from './prng'
import type { PetBones, Pet, PetSoul, Rarity, StatName } from './types'
import { SPECIES, RARITIES, RARITY_WEIGHTS, EYES, HATS, STAT_NAMES } from './types'

const SALT = 'friend-2026-401'

function rollRarity(rng: () => number): Rarity {
  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0)
  let roll = rng() * total
  for (const r of RARITIES) {
    roll -= RARITY_WEIGHTS[r]
    if (roll < 0) return r
  }
  return 'common'
}

const STAT_FLOOR: Record<Rarity, number> = {
  common: 5, uncommon: 15, rare: 25, epic: 35, legendary: 50,
}

function rollStats(rng: () => number, rarity: Rarity): Record<StatName, number> {
  const floor = STAT_FLOOR[rarity]
  const peak = pick(rng, STAT_NAMES)
  let dump = pick(rng, STAT_NAMES)
  while (dump === peak) dump = pick(rng, STAT_NAMES)

  const stats = {} as Record<StatName, number>
  for (const name of STAT_NAMES) {
    if (name === peak) stats[name] = Math.min(100, floor + 50 + Math.floor(rng() * 30))
    else if (name === dump) stats[name] = Math.max(1, floor - 10 + Math.floor(rng() * 15))
    else stats[name] = floor + Math.floor(rng() * 40)
  }
  return stats
}

const NAMES = [
  'Luna', 'Pixel', 'Mochi', 'Nyx', 'Boba', 'Tofu', 'Nimbus',
  'Pip', 'Cosmo', 'Ember', 'Fern', 'Glitch', 'Ink', 'Kit',
  'Mint', 'Nova', 'Pebble', 'Rune', 'Sage', 'Twig', 'Zephyr',
]

const PERSONALITIES = [
  'cheerful and easily excited',
  'sarcastic but secretly caring',
  'sleepy and philosophical',
  'chaotic and mischievous',
  'calm and wise',
  'dramatic about everything',
  'endlessly curious',
  'grumpy but loyal',
]

export function generateBones(seed: string): PetBones {
  const rng = mulberry32(hashString(seed + SALT))
  const rarity = rollRarity(rng)
  return {
    species: pick(rng, SPECIES),
    rarity,
    eye: pick(rng, EYES),
    hat: rarity === 'common' ? 'none' : pick(rng, HATS),
    shiny: rng() < 0.01,
    stats: rollStats(rng, rarity),
  }
}

export function generateSoul(seed: string): PetSoul {
  const rng = mulberry32(hashString(seed + SALT + '-soul'))
  return { name: pick(rng, NAMES), personality: pick(rng, PERSONALITIES) }
}

export function generatePet(seed: string, soul?: PetSoul): Pet {
  return { ...generateBones(seed), ...(soul ?? generateSoul(seed)) }
}
