import type { Pet, PetEvent } from './types'
import { mulberry32, hashString } from './prng'

const R: Record<PetEvent['type'], string[]> = {
  message_sent:     ['Go get em!', 'Sent!', 'Nice one', 'Good luck~'],
  message_received: ['Ooh!', 'New message!', 'Ding!', 'Someone\'s popular~'],
  error:            ['Uh oh...', 'Yikes', 'That\'s not great', 'Hmm...'],
  thinking:         ['Thinking...', '*brain noises*', 'Hmm...', 'Processing...'],
  success:          ['Woohoo!', 'Yes!!', 'Nailed it!', 'Nice!'],
  idle:             ['...', '*blinks*', '*stretches*', '~♪~', '*yawns*', 'zzZ'],
  greeting:         ['Hi hi hi!', 'Hello!!', 'You\'re back!', 'Hey!'],
  farewell:         ['Don\'t go...', 'See you!', 'Bye bye...', 'Goodnight~'],
  custom:           ['Oh!', 'Hmm!', 'Interesting!'],
}

const SNARK: string[] = ['Whatever you say', 'Sure, Jan', '*eye roll*']
const CHAOS: string[] = ['YOLO!', 'WHEEE!', 'Let\'s break things!']
const WISDOM: string[] = ['You\'re doing great!', 'Patience is a virtue', 'Trust the process']

export function getReaction(pet: Pet, event: PetEvent): string {
  const rng = mulberry32(hashString(`${pet.name}-${event.type}-${event.timestamp ?? Date.now()}`))

  if (rng() < 0.2) {
    const top = (Object.entries(pet.stats) as [string, number][]).sort((a, b) => b[1] - a[1])[0]
    if (top && top[1] > 60) {
      const pool = top[0] === 'SNARK' ? SNARK : top[0] === 'CHAOS' ? CHAOS : top[0] === 'WISDOM' ? WISDOM : null
      if (pool) return pool[Math.floor(rng() * pool.length)]!
    }
  }

  const lines = R[event.type] ?? R.custom
  return lines[Math.floor(rng() * lines.length)]!
}
