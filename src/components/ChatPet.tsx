import React, { useEffect, useRef, useState } from 'react'
import type { Pet, PetEvent } from '../types'
import { RARITY_LABEL } from '../types'
import { generatePet } from '../generator'
import { renderSprite, spriteFrameCount, renderFace } from '../sprites'
import { getReaction } from '../reactions'

// ── Timing ───────────────────────────────────────────────────────────
const TICK = 500                  // ms per animation tick
const BUBBLE_TICKS = 16           // ~8s visible
const FADE_TICKS = 4              // last ~2s dims
const PET_MS = 2000               // heart burst duration
const IDLE_INTERVAL = 30_000      // idle quip every 30s

// Idle sequence: mostly frame 0, occasional fidget, rare blink (-1)
const IDLE_SEQ = [0, 0, 0, 0, 1, 0, 0, 0, -1, 0, 0, 2, 0, 0, 0]

// ── Props ────────────────────────────────────────────────────────────
export type ChatPetProps = {
  seed: string
  soul?: { name: string; personality: string }
  events?: PetEvent[]
  size?: 'compact' | 'full'
  theme?: 'light' | 'dark'
  className?: string
  style?: React.CSSProperties
  onPet?: (pet: Pet) => void
}

// ── Color ────────────────────────────────────────────────────────────
const RARITY_HEX: Record<string, string> = {
  common: '#9ca3af', uncommon: '#22c55e', rare: '#3b82f6',
  epic: '#a855f7', legendary: '#eab308',
}

// ── Component ────────────────────────────────────────────────────────
export function ChatPet({
  seed, soul, events = [], size = 'full',
  theme = 'dark', className, style, onPet,
}: ChatPetProps) {
  const pet = generatePet(seed, soul)
  const color = RARITY_HEX[pet.rarity] ?? '#9ca3af'

  const [tick, setTick] = useState(0)
  const [bubble, setBubble] = useState('')
  const [bubbleAge, setBubbleAge] = useState(BUBBLE_TICKS)
  const [petting, setPetting] = useState(false)
  const lastEventLen = useRef(0)
  const bubbleTimer = useRef<ReturnType<typeof setTimeout>>()
  const petTimer = useRef<ReturnType<typeof setTimeout>>()

  // Tick
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), TICK)
    return () => clearInterval(id)
  }, [])

  // Count bubble age
  useEffect(() => {
    if (bubble) setBubbleAge(a => a + 1)
  }, [tick]) // eslint-disable-line react-hooks/exhaustive-deps

  // React to new events
  useEffect(() => {
    if (events.length <= lastEventLen.current) return
    lastEventLen.current = events.length
    const ev = events[events.length - 1]!
    showBubble(getReaction(pet, ev))
  }, [events.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // Idle quips
  useEffect(() => {
    const id = setInterval(() => {
      if (bubbleAge < BUBBLE_TICKS) return // already talking
      const ev: PetEvent = { type: 'idle', timestamp: Date.now() }
      showBubble(getReaction(pet, ev))
    }, IDLE_INTERVAL)
    return () => clearInterval(id)
  }, [pet, bubbleAge]) // eslint-disable-line react-hooks/exhaustive-deps

  function showBubble(text: string) {
    setBubble(text)
    setBubbleAge(0)
    clearTimeout(bubbleTimer.current)
    bubbleTimer.current = setTimeout(() => {
      setBubble('')
      setBubbleAge(BUBBLE_TICKS)
    }, BUBBLE_TICKS * TICK)
  }

  function handlePet() {
    onPet?.(pet)
    setPetting(true)
    showBubble('\u2764\ufe0f')
    clearTimeout(petTimer.current)
    petTimer.current = setTimeout(() => setPetting(false), PET_MS)
  }

  // ── Resolve frame ──────────────────────────────────────────────────
  const speaking = bubbleAge < BUBBLE_TICKS
  const fading = speaking && bubbleAge >= BUBBLE_TICKS - FADE_TICKS
  const frameCount = spriteFrameCount(pet.species)

  let spriteFrame: number
  let blink = false
  if (speaking || petting) {
    spriteFrame = tick % frameCount
  } else {
    const step = IDLE_SEQ[tick % IDLE_SEQ.length]!
    if (step === -1) { spriteFrame = 0; blink = true }
    else spriteFrame = step % frameCount
  }

  const body = renderSprite(pet, spriteFrame)
    .map(l => blink ? l.replaceAll(pet.eye, '-') : l)

  const hearts = petting
    ? ['  \u2665   \u2665  ', ' \u2665  \u2665  \u2665 '][tick % 2]
    : null

  const lines = hearts ? [hearts, ...body] : body

  const isDark = theme === 'dark'
  const dim = isDark ? '#6b7280' : '#9ca3af'

  // ── Compact mode: one-line face ────────────────────────────────────
  if (size === 'compact') {
    const face = renderFace(pet)
    const quip = speaking
      ? (bubble.length > 24 ? bubble.slice(0, 23) + '\u2026' : bubble)
      : null
    return (
      <span
        className={className}
        style={{
          fontFamily: 'ui-monospace, "Cascadia Code", "Fira Code", Consolas, monospace',
          fontSize: 14,
          cursor: 'pointer',
          userSelect: 'none',
          ...style,
        }}
        onClick={handlePet}
        title={`${pet.name} \u2022 ${pet.species} \u2022 ${pet.rarity}`}
      >
        <span style={{ color, fontWeight: 700 }}>{face}</span>
        {' '}
        <span style={{ color: quip ? color : dim, fontStyle: 'italic', opacity: fading ? 0.4 : 1 }}>
          {quip ? `"${quip}"` : pet.name}
        </span>
      </span>
    )
  }

  // ── Full mode: ASCII sprite + bubble ───────────────────────────────
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'flex-end',
        gap: 0,
        fontFamily: 'ui-monospace, "Cascadia Code", "Fira Code", Consolas, monospace',
        fontSize: 13,
        lineHeight: 1.2,
        userSelect: 'none',
        ...style,
      }}
    >
      {/* Speech bubble */}
      {speaking && (
        <div style={{
          alignSelf: 'center',
          maxWidth: 180,
          marginRight: 4,
          opacity: fading ? 0.35 : 1,
          transition: 'opacity 0.3s',
        }}>
          <div style={{
            border: `1px solid ${color}`,
            borderRadius: 8,
            padding: '4px 8px',
            color: isDark ? '#e5e7eb' : '#1f2937',
            fontSize: 12,
            fontStyle: 'italic',
            background: isDark ? '#1f2937' : '#fff',
          }}>
            {bubble}
          </div>
          <div style={{ textAlign: 'right', paddingRight: 8, color, fontSize: 10 }}>
            {'\\'}
          </div>
        </div>
      )}

      {/* Sprite column */}
      <div
        onClick={handlePet}
        style={{ cursor: 'pointer', textAlign: 'center' }}
        title={`${pet.name} \u2022 ${RARITY_LABEL[pet.rarity]} ${pet.rarity}`}
      >
        <pre style={{
          margin: 0,
          color,
          lineHeight: 1.15,
          fontSize: 13,
          ...(pet.shiny ? { textShadow: `0 0 4px ${color}` } : {}),
        }}>
          {lines.join('\n')}
        </pre>
        <div style={{
          fontSize: 11,
          color: dim,
          fontStyle: 'italic',
          marginTop: 2,
        }}>
          {pet.name}
        </div>
      </div>
    </div>
  )
}
