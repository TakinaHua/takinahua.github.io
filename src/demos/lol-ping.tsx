import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import './lol-ping.css'

const directions = [
  { label: 'On my way', icon: '→', color: '#82e0d1' },
  { label: 'Assist', icon: '+', color: '#91d5ff' },
  { label: 'Danger', icon: '!', color: '#ff9299' },
  { label: 'Missing', icon: '?', color: '#ffe49b' },
  { label: 'Vision', icon: '◇', color: '#d3b2ff' },
  { label: 'Retreat', icon: '←', color: '#ffba85' },
  { label: 'Push', icon: '↑', color: '#a6eac5' },
  { label: 'Hold', icon: '■', color: '#b7c6f3' },
]

const deadZone = 24
const step = Math.PI / 4

type Point = { x: number; y: number }
type Gesture = { pointerId: number; start: Point; center: Point }
type Ping = { id: number; point: Point; direction: number }

function pointInArena(event: PointerEvent<HTMLDivElement>): Point {
  const field = event.currentTarget
  const bounds = field.getBoundingClientRect()
  return { x: event.clientX - bounds.left - field.clientLeft, y: event.clientY - bounds.top - field.clientTop }
}

function selectedDirection(start: Point, point: Point) {
  const x = point.x - start.x
  const y = point.y - start.y
  if (Math.hypot(x, y) < deadZone) return null
  return (Math.round(Math.atan2(-y, x) / step) + directions.length) % directions.length
}

export function Demo() {
  const arena = useRef<HTMLDivElement>(null)
  const active = useRef<Gesture | null>(null)
  const audio = useRef<AudioContext | null>(null)
  const [gesture, setGesture] = useState<Gesture | null>(null)
  const [selection, setSelection] = useState<number | null>(null)
  const [ping, setPing] = useState<Ping | null>(null)
  const [message, setMessage] = useState('')
  const [sound, setSound] = useState(false)

  function emitPing(direction: number, point: Point) {
    setPing(previous => ({ id: (previous?.id ?? 0) + 1, point, direction }))
    setMessage(directions[direction].label + ' ping placed.')
    if (!sound) return

    const context = audio.current ??= new AudioContext()
    void context.resume().then(() => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const time = context.currentTime
      oscillator.frequency.setValueAtTime(420 + direction * 45, time)
      gain.gain.setValueAtTime(0.09, time)
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.24)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start(time)
      oscillator.stop(time + 0.24)
    }).catch(() => setSound(false))
  }

  function begin(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || active.current) return
    const start = pointInArena(event)
    const clamp = (value: number, size: number) =>
      Math.max(108, Math.min(size - 108, value))
    const next = {
      pointerId: event.pointerId,
      start,
      center: {
        x: clamp(start.x, event.currentTarget.clientWidth),
        y: clamp(start.y, event.currentTarget.clientHeight),
      },
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    active.current = next
    setGesture(next)
    setSelection(null)
  }

  function finish(event: PointerEvent<HTMLDivElement>, cancelled: boolean) {
    const current = active.current
    if (!current || current.pointerId !== event.pointerId) return
    const direction = cancelled ? null : selectedDirection(current.start, pointInArena(event))
    active.current = null
    setGesture(null)
    setSelection(null)
    if (direction === null) {
      setMessage('Ping cancelled.')
      return
    }
    emitPing(direction, current.start)
  }

  return (
    <main className="demo">
      <a className="demo-back" href="/#lol-ping">← Back to portfolio</a>
      <h1>LoL Ping Demo</h1>
      <p id="instructions">Press and hold in the field, drag toward a direction, then release. Return to where you started to cancel.</p>

      <div
        className="ping-arena"
        aria-label="Ping field"
        ref={arena}
        onPointerDown={begin}
        onPointerMove={event => {
          const current = active.current
          if (current?.pointerId === event.pointerId) {
            setSelection(selectedDirection(current.start, pointInArena(event)))
          }
        }}
        onPointerUp={event => finish(event, false)}
        onPointerCancel={event => finish(event, true)}
        onLostPointerCapture={event => finish(event, true)}
      >
        {!gesture && !ping && <span className="field-hint" aria-hidden="true">Hold and drag here</span>}
        {ping && (
          <span
            aria-hidden="true"
            className="placed-ping"
            key={ping.id}
            onAnimationEnd={() => setPing(current => current?.id === ping.id ? null : current)}
            style={{ left: ping.point.x, top: ping.point.y, color: directions[ping.direction].color }}
          >
            {directions[ping.direction].icon}
          </span>
        )}
        {gesture && (
          <div className="ping-wheel" aria-hidden="true" style={{ left: gesture.center.x, top: gesture.center.y }}>
            {directions.map(({ label, icon, color }, index) => (
              <span
                className="wheel-direction"
                data-selected={index === selection}
                key={label}
                style={{
                  left: 76 + Math.cos(index * step) * 76,
                  top: 76 - Math.sin(index * step) * 76,
                  color,
                }}
              >{icon}</span>
            ))}
            <span className="wheel-center">{selection === null ? 'Cancel' : directions[selection].label}</span>
          </div>
        )}
      </div>

      <div className="demo-tools">
        <button type="button" aria-pressed={sound} onClick={() => setSound(value => !value)}>Sound {sound ? 'on' : 'off'}</button>
        <p role="status">{message}</p>
      </div>
      <fieldset className="ping-options">
        <legend>Place a ping from the keyboard or by tapping a button</legend>
        {directions.map(({ label, icon, color }, index) => (
          <button key={label} type="button" onClick={() => {
            const field = arena.current
            if (field) emitPing(index, { x: field.clientWidth / 2, y: field.clientHeight / 2 })
          }}>
            <span aria-hidden="true" style={{ color }}>{icon}</span> {label}
          </button>
        ))}
      </fieldset>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<Demo />)
