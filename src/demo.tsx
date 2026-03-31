import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { SPECIES, RARITIES, EYES, HATS, STAT_NAMES, RARITY_LABEL } from './types'
import type { Species, Eye, Hat, Rarity, PetBones } from './types'
import { renderSprite, spriteFrameCount, renderFace } from './sprites'
import { generatePet } from './generator'
import { getReaction } from './reactions'
import type { PetEvent } from './types'

// ── Colors ──────────────────────────────────────────────────────────
const RARITY_HEX: Record<Rarity, string> = {
  common: '#7c818a', uncommon: '#3fb950', rare: '#58a6ff',
  epic: '#bc8cff', legendary: '#d29922',
}
const BG = '#0d1117'
const CARD = '#161b22'
const BORDER = '#21262d'
const DIM = '#484f58'
const TEXT = '#e6edf3'

// ── Animated sprite hook ────────────────────────────────────────────
const IDLE_SEQ = [0, 0, 0, 0, 1, 0, 0, 0, -1, 0, 0, 2, 0, 0, 0]

function useAnimatedSprite(bones: PetBones) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 500)
    return () => clearInterval(id)
  }, [])

  const step = IDLE_SEQ[tick % IDLE_SEQ.length]!
  const blink = step === -1
  const frame = blink ? 0 : step % spriteFrameCount(bones.species)
  const lines = renderSprite(bones, frame)
    .map(l => blink ? l.replaceAll(bones.eye, '-') : l)
  return lines
}

// ── Sprite card ─────────────────────────────────────────────────────
function BuddyCard({ species, eye, hat, rarity, selected, onClick }: {
  species: Species; eye: Eye; hat: Hat; rarity: Rarity
  selected: boolean; onClick: () => void
}) {
  const bones: PetBones = {
    species, rarity, eye, hat,
    shiny: rarity === 'legendary',
    stats: { DEBUGGING: 50, PATIENCE: 50, CHAOS: 50, WISDOM: 50, SNARK: 50 },
  }
  const lines = useAnimatedSprite(bones)
  const color = RARITY_HEX[rarity]

  return (
    <div onClick={onClick} style={{
      background: selected ? '#1c2333' : CARD,
      border: `1px solid ${selected ? color : BORDER}`,
      borderRadius: 10,
      padding: '12px 8px 8px',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.15s',
      minWidth: 130,
      ...(selected ? { boxShadow: `0 0 12px ${color}33` } : {}),
    }}>
      <pre style={{
        margin: 0, color, lineHeight: 1.15, fontSize: 13,
        fontFamily: 'inherit',
        ...(bones.shiny ? { textShadow: `0 0 6px ${color}` } : {}),
      }}>
        {lines.join('\n')}
      </pre>
      <div style={{ marginTop: 6, fontSize: 11, color: DIM }}>{species}</div>
      <div style={{ fontSize: 10, color, opacity: 0.7 }}>{RARITY_LABEL[rarity]}</div>
    </div>
  )
}

// ── Detail panel ────────────────────────────────────────────────────
function DetailPanel({ species, eye, hat, rarity }: {
  species: Species; eye: Eye; hat: Hat; rarity: Rarity
}) {
  const generated = generatePet(species)
  // Override bones with the selected species/eye/hat/rarity — don't use the PRNG-rolled species
  const pet = { ...generated, species, eye, hat, rarity, shiny: rarity === 'legendary' }
  const color = RARITY_HEX[pet.rarity]
  const [events, setEvents] = useState<PetEvent[]>([])
  const [bubble, setBubble] = useState('')
  const [petting, setPetting] = useState(false)

  const bones: PetBones = pet
  const lines = useAnimatedSprite(bones)

  function trigger(type: PetEvent['type']) {
    const ev: PetEvent = { type, timestamp: Date.now() }
    setEvents(e => [...e, ev])
    setBubble(getReaction(pet, ev))
    setTimeout(() => setBubble(''), 4000)
  }

  function handlePet() {
    setPetting(true)
    setBubble('❤️')
    setTimeout(() => { setPetting(false); setBubble('') }, 2000)
  }

  const face = renderFace(bones)

  return (
    <div style={{
      background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12,
      padding: 24, display: 'flex', gap: 32, alignItems: 'flex-start',
    }}>
      {/* Sprite + bubble */}
      <div style={{ textAlign: 'center', minWidth: 160 }}>
        {bubble && (
          <div style={{
            border: `1px solid ${color}`, borderRadius: 8,
            padding: '4px 10px', fontSize: 12, fontStyle: 'italic',
            color: TEXT, background: '#1c2333', marginBottom: 4,
          }}>
            {bubble}
          </div>
        )}
        {petting && (
          <div style={{ color: '#f85149', fontSize: 13, letterSpacing: 2 }}>
            ♥  ♥   ♥
          </div>
        )}
        <pre onClick={handlePet} style={{
          margin: 0, color, lineHeight: 1.15, fontSize: 15,
          cursor: 'pointer', fontFamily: 'inherit',
          ...(pet.shiny ? { textShadow: `0 0 8px ${color}` } : {}),
        }}>
          {lines.join('\n')}
        </pre>
        <div style={{ marginTop: 4, fontSize: 13, color: TEXT, fontWeight: 600 }}>
          {pet.name}
        </div>
        <div style={{ fontSize: 11, color: DIM, fontStyle: 'italic' }}>
          {pet.personality}
        </div>
        <div style={{ fontSize: 11, color, marginTop: 2 }}>
          {RARITY_LABEL[pet.rarity]} {pet.rarity} {pet.shiny ? '✨ shiny' : ''}
        </div>
        <div style={{ fontSize: 12, color: DIM, marginTop: 4 }}>
          face: <span style={{ color }}>{face}</span>
        </div>
      </div>

      {/* Stats + actions */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 11, color: DIM, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
          stats
        </div>
        {STAT_NAMES.map(s => {
          const val = pet.stats[s]
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: DIM, width: 72, textAlign: 'right' }}>{s}</span>
              <div style={{ flex: 1, height: 6, background: BORDER, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  width: `${val}%`, height: '100%', borderRadius: 3,
                  background: val > 70 ? color : val > 40 ? DIM : '#30363d',
                }} />
              </div>
              <span style={{ fontSize: 10, color: DIM, width: 24 }}>{val}</span>
            </div>
          )
        })}

        <div style={{
          fontSize: 11, color: DIM, textTransform: 'uppercase',
          letterSpacing: 1, marginTop: 16, marginBottom: 8,
        }}>
          actions
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['greeting', 'success', 'error', 'thinking', 'idle', 'farewell'] as const).map(t => (
            <button key={t} onClick={() => trigger(t)} style={{
              background: '#21262d', border: `1px solid ${BORDER}`, color: TEXT,
              borderRadius: 6, padding: '3px 10px', cursor: 'pointer',
              fontSize: 11, fontFamily: 'inherit',
            }}>
              {t}
            </button>
          ))}
          <button onClick={handlePet} style={{
            background: '#21262d', border: `1px solid ${BORDER}`, color: '#f85149',
            borderRadius: 6, padding: '3px 10px', cursor: 'pointer',
            fontSize: 11, fontFamily: 'inherit',
          }}>
            ♥ pet
          </button>
        </div>

        {/* All 3 frames */}
        <div style={{
          fontSize: 11, color: DIM, textTransform: 'uppercase',
          letterSpacing: 1, marginTop: 16, marginBottom: 8,
        }}>
          frames
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[0, 1, 2].map(f => (
            <div key={f} style={{ textAlign: 'center' }}>
              <pre style={{ margin: 0, color, fontSize: 11, lineHeight: 1.15, fontFamily: 'inherit' }}>
                {renderSprite(bones, f).join('\n')}
              </pre>
              <div style={{ fontSize: 9, color: DIM }}>{f === 0 ? 'idle' : f === 1 ? 'fidget' : 'special'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── App ─────────────────────────────────────────────────────────────
function Explorer() {
  const [selected, setSelected] = useState<Species>('duck')
  const [eye, setEye] = useState<Eye>('·')
  const [hat, setHat] = useState<Hat>('none')
  const [rarity, setRarity] = useState<Rarity>('common')

  return (
    <div style={{
      minHeight: '100vh', background: BG, color: TEXT,
      fontFamily: 'ui-monospace, "Cascadia Code", "Fira Code", Consolas, monospace',
      padding: '32px 40px',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: TEXT }}>
          buddy explorer
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: DIM }}>
          all 18 companions from claude code · click to inspect · click sprite to pet
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ fontSize: 11, color: DIM }}>
          eye{' '}
          <select value={eye} onChange={e => setEye(e.target.value as Eye)} style={{
            background: CARD, border: `1px solid ${BORDER}`, color: TEXT,
            borderRadius: 4, padding: '2px 6px', fontSize: 13, fontFamily: 'inherit',
          }}>
            {EYES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </label>
        <label style={{ fontSize: 11, color: DIM }}>
          hat{' '}
          <select value={hat} onChange={e => setHat(e.target.value as Hat)} style={{
            background: CARD, border: `1px solid ${BORDER}`, color: TEXT,
            borderRadius: 4, padding: '2px 6px', fontSize: 13, fontFamily: 'inherit',
          }}>
            {HATS.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </label>
        <label style={{ fontSize: 11, color: DIM }}>
          rarity{' '}
          <select value={rarity} onChange={e => setRarity(e.target.value as Rarity)} style={{
            background: CARD, border: `1px solid ${BORDER}`, color: TEXT,
            borderRadius: 4, padding: '2px 6px', fontSize: 13, fontFamily: 'inherit',
          }}>
            {RARITIES.map(r => (
              <option key={r} value={r}>{RARITY_LABEL[r]} {r}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: 10,
        marginBottom: 28,
      }}>
        {SPECIES.map(s => (
          <BuddyCard
            key={s} species={s} eye={eye} hat={hat} rarity={rarity}
            selected={s === selected} onClick={() => setSelected(s)}
          />
        ))}
      </div>

      {/* Detail */}
      <DetailPanel key={`${selected}-${eye}-${hat}-${rarity}`} species={selected} eye={eye} hat={hat} rarity={rarity} />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<Explorer />)
