export const SPECIES = [
  'duck', 'goose', 'blob', 'cat', 'dragon', 'octopus', 'owl',
  'penguin', 'turtle', 'snail', 'ghost', 'axolotl', 'capybara',
  'cactus', 'robot', 'rabbit', 'mushroom', 'chonk',
] as const
export type Species = (typeof SPECIES)[number]

export const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const
export type Rarity = (typeof RARITIES)[number]

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 60, uncommon: 25, rare: 10, epic: 4, legendary: 1,
}

export const RARITY_LABEL: Record<Rarity, string> = {
  common: '★', uncommon: '★★', rare: '★★★',
  epic: '★★★★', legendary: '★★★★★',
}

export const EYES = ['·', '✦', '×', '◉', '@', '°'] as const
export type Eye = (typeof EYES)[number]

export const HATS = [
  'none', 'crown', 'tophat', 'propeller', 'halo', 'wizard', 'beanie', 'tinyduck',
] as const
export type Hat = (typeof HATS)[number]

export const STAT_NAMES = ['DEBUGGING', 'PATIENCE', 'CHAOS', 'WISDOM', 'SNARK'] as const
export type StatName = (typeof STAT_NAMES)[number]

export type PetBones = {
  species: Species
  rarity: Rarity
  eye: Eye
  hat: Hat
  shiny: boolean
  stats: Record<StatName, number>
}

export type PetSoul = { name: string; personality: string }
export type Pet = PetBones & PetSoul

export type PetEvent = {
  type: 'message_sent' | 'message_received' | 'error' | 'thinking' | 'success' | 'idle' | 'greeting' | 'farewell' | 'custom'
  text?: string
  timestamp?: number
}
