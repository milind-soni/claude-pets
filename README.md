# claude-pets

All 18 hidden Tamagotchi buddies from Claude Code's source, extracted into standalone TypeScript.

![buddy explorer](https://img.shields.io/badge/species-18-blue) ![rarity](https://img.shields.io/badge/legendary_drop-1%25-gold)

## What is this?

Claude Code has a hidden `/buddy` system — a full ASCII pet companion that lives in your terminal. Your pet is deterministically generated from your user ID with gacha rarity, animated sprites, hats, stats, and reactions to your coding.

This repo extracts the entire buddy system into browsable TypeScript so you can see every pet and how it all works.

**18 species:** duck, goose, blob, cat, dragon, octopus, owl, penguin, turtle, snail, ghost, axolotl, capybara, cactus, robot, rabbit, mushroom, chonk

**Rarity:** common (60%) → uncommon (25%) → rare (10%) → epic (4%) → legendary (1%)

**Features:** 3 animation frames per pet, blink states, 6 eye styles, 8 hats (including "tinyduck"), 1% shiny chance, stat system (DEBUGGING, PATIENCE, CHAOS, WISDOM, SNARK), speech bubble reactions, petting mechanic with floating hearts

## Install

```bash
git clone https://github.com/milind-soni/claude-pets.git
cd claude-pets
npm install
```

## Run

```bash
npm run dev
```

Opens the buddy explorer at `http://localhost:5173`. Browse all 18 pets, swap eyes/hats/rarity, trigger actions, and click any sprite to pet it.

## Use as a library

```bash
npm install
```

```tsx
import { generatePet, renderSprite, renderFace, getReaction } from './src'

// Generate a pet from any seed
const pet = generatePet('your-user-id')
console.log(pet.name, pet.species, pet.rarity)

// Render ASCII sprite (frame 0, 1, or 2)
const lines = renderSprite(pet, 0)
console.log(lines.join('\n'))

// Compact one-line face
console.log(renderFace(pet)) // e.g. =·ω·=

// Get a reaction
const reaction = getReaction(pet, { type: 'success', timestamp: Date.now() })
console.log(reaction) // e.g. "Nailed it!"
```

## React component

```tsx
import { ChatPet } from './src'

<ChatPet seed="your-user-id" theme="dark" />
<ChatPet seed="your-user-id" size="compact" />
```

## How it works

- **Mulberry32 PRNG** seeded with FNV-1a hash of your user ID — fully deterministic, no rerolls
- **Rarity** affects hat access, stat floors, and shiny eligibility
- **Stats** have one peak, one dump, rest scattered — floor scales with rarity
- **Idle animation** cycles: `[0,0,0,0,1,0,0,0,-1,0,0,2,0,0,0]` — mostly rest, occasional fidget, rare blink

## Credit

Extracted from [Claude Code](https://claude.ai/code) by Anthropic. The original buddy system lives in `src/buddy/` of the Claude Code source.
