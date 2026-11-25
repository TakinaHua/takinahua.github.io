import { useEffect, useId, useRef } from 'react'
import { createMobiusRenderer } from './mobiusRenderer'

type Point = { x: number; y: number }

const rest: Point = { x: .5, y: .5 }
const still: Point = { x: 0, y: 0 }
const springRate = .016
const keyboardStep = .04
const arrowSteps = new Map<string, Point>([
  ['ArrowLeft', { x: -keyboardStep, y: 0 }],
  ['ArrowRight', { x: keyboardStep, y: 0 }],
  ['ArrowUp', { x: 0, y: -keyboardStep }],
  ['ArrowDown', { x: 0, y: keyboardStep }],
])

// Critical damping gives a soft arrival without a bounce. Retaining velocity
// keeps the tilt continuous when the cursor reverses or leaves the artwork.
function advanceAxis(value: number, velocity: number, target: number, elapsed: number, decay: number) {
  const distance = value - target
  const slope = velocity + springRate * distance
  return {
    value: target + (distance + slope * elapsed) * decay,
    velocity: (velocity - springRate * slope * elapsed) * decay,
  }
}

function withinPlane(value: number) {
  return Math.max(.08, Math.min(.92, value))
}

export default function MobiusRibbon() {
  const plane = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const instructionsId = useId()

  useEffect(() => {
    const surface = plane.current
    const drawing = canvas.current
    const gl = drawing?.getContext('webgl', { alpha: true, antialias: true })
    if (!surface || !drawing || !gl) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let renderer = createMobiusRenderer(gl)
    let current = rest
    let target = rest
    let velocity = still
    let frame: number | null = null
    let previousTime = 0

    const draw = () => {
      if (!renderer || gl.isContextLost()) return

      renderer.draw(2 * current.x - 1, 2 * current.y - 1)
      if (!surface.hasAttribute('data-rendered')) {
        surface.dataset.rendered = 'true'
        surface.tabIndex = 0
        surface.setAttribute('aria-describedby', instructionsId)
      }
    }

    function tick(time: number) {
      frame = null
      const elapsed = previousTime ? Math.min(time - previousTime, 50) : 16
      const remaining = Math.hypot(target.x - current.x, target.y - current.y)
      const speed = Math.hypot(velocity.x, velocity.y)
      const settled = motion.matches || (remaining < .0008 && speed < .000015)
      if (settled) {
        current = target
        velocity = still
      } else {
        const decay = Math.exp(-springRate * elapsed)
        const x = advanceAxis(current.x, velocity.x, target.x, elapsed, decay)
        const y = advanceAxis(current.y, velocity.y, target.y, elapsed, decay)
        current = { x: x.value, y: y.value }
        velocity = { x: x.velocity, y: y.velocity }
      }

      draw()
      previousTime = settled ? 0 : time
      if (!settled) frame = requestAnimationFrame(tick)
    }

    function setTarget(next: Point) {
      if (!renderer) return
      target = next
      if (frame === null) frame = requestAnimationFrame(tick)
    }

    const followPointer = (event: MouseEvent) => {
      const bounds = surface.getBoundingClientRect()
      setTarget({
        x: withinPlane((event.clientX - bounds.left) / bounds.width),
        y: withinPlane((event.clientY - bounds.top) / bounds.height),
      })
    }

    function onPointerMove(event: PointerEvent) {
      if (event.pointerType !== 'touch' && !motion.matches) followPointer(event)
    }

    function onPointerLeave(event: PointerEvent) {
      if (event.pointerType !== 'touch' && !motion.matches) setTarget(rest)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setTarget(rest)
        return
      }
      const step = arrowSteps.get(event.key)
      if (!step) return

      event.preventDefault()
      setTarget({
        x: withinPlane(target.x + step.x),
        y: withinPlane(target.y + step.y),
      })
    }

    const resize = new ResizeObserver(([entry]) => {
      if (!entry) return
      const { width, height } = entry.contentRect
      if (width === 0 || height === 0) return

      const density = Math.min(window.devicePixelRatio, 2)
      drawing.width = Math.round(width * density)
      drawing.height = Math.round(height * density)
      draw()
    })

    const showStill = () => {
      delete surface.dataset.rendered
      surface.tabIndex = -1
      surface.removeAttribute('aria-describedby')
    }

    const onContextLost = (event: Event) => {
      event.preventDefault()
      renderer = null
      if (frame !== null) cancelAnimationFrame(frame)
      frame = null
      previousTime = 0
      current = target = rest
      velocity = still
      showStill()
    }

    const onContextRestored = () => {
      renderer = createMobiusRenderer(gl)
      draw()
    }

    resize.observe(surface)
    drawing.addEventListener('webglcontextlost', onContextLost)
    drawing.addEventListener('webglcontextrestored', onContextRestored)
    surface.addEventListener('pointermove', onPointerMove)
    surface.addEventListener('pointerleave', onPointerLeave)
    surface.addEventListener('click', followPointer)
    surface.addEventListener('keydown', onKeyDown)
    return () => {
      resize.disconnect()
      drawing.removeEventListener('webglcontextlost', onContextLost)
      drawing.removeEventListener('webglcontextrestored', onContextRestored)
      renderer?.dispose()
      showStill()
      surface.removeEventListener('pointermove', onPointerMove)
      surface.removeEventListener('pointerleave', onPointerLeave)
      surface.removeEventListener('click', followPointer)
      surface.removeEventListener('keydown', onKeyDown)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [instructionsId])

  return (
    <div
      ref={plane}
      className="mobius-ribbon"
      role="group"
      aria-label="Möbius ribbon"
      tabIndex={-1}
    >
      <canvas ref={canvas} aria-hidden="true" />
      <span id={instructionsId} className="visually-hidden">
        Move your pointer, tap, or use the arrow keys to tilt the ribbon and shift the light.
        Press Escape to reset.
      </span>
    </div>
  )
}
