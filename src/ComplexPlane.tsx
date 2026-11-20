import { useEffect, useId, useRef } from 'react'

type Point = { x: number; y: number }

const rest: Point = { x: .64, y: .47 }
const keyboardStep = .04
const arrowSteps = new Map<string, Point>([
  ['ArrowLeft', { x: -keyboardStep, y: 0 }],
  ['ArrowRight', { x: keyboardStep, y: 0 }],
  ['ArrowUp', { x: 0, y: -keyboardStep }],
  ['ArrowDown', { x: 0, y: keyboardStep }],
])

function withinPlane(value: number) {
  return Math.max(.08, Math.min(.92, value))
}

export default function ComplexPlane() {
  const plane = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const instructionsId = useId()

  useEffect(() => {
    const surface = plane.current
    const drawing = canvas.current
    const context = drawing?.getContext('2d')
    if (!surface || !drawing || !context) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const colors = getComputedStyle(surface)
    const line = colors.getPropertyValue('--color-plane-line').trim()
    const bright = colors.getPropertyValue('--color-plane-bright').trim()
    const glow = colors.getPropertyValue('--color-plane-glow').trim()
    const point = colors.getPropertyValue('--color-plane-point').trim()
    let width = 0
    let height = 0
    let current = rest
    let target = rest
    let frame: number | null = null
    let previousTime = 0

    const draw = () => {
      if (width === 0 || height === 0) return

      const spacing = Math.min(width, height) / 13
      const poleX = current.x * width
      const poleY = current.y * height
      const radius = 5.5 * spacing
      const softening = .68 * spacing
      const strength = 3.8 * spacing ** 2

      context.clearRect(0, 0, width, height)
      const light = context.createRadialGradient(poleX, poleY, 0, poleX, poleY, radius)
      light.addColorStop(0, glow)
      light.addColorStop(1, 'transparent')
      context.fillStyle = light
      context.fillRect(0, 0, width, height)

      // Use a softened reciprocal for the rotation around the pole. Normalizing
      // the complex multiplier preserves distance from the pole and prevents folds.
      const trace = (startX: number, startY: number, endX: number, endY: number) => {
        const steps = Math.ceil(Math.hypot(endX - startX, endY - startY) / 3)
        for (let i = 0; i <= steps; i++) {
          const fraction = i / steps
          const x = startX + (endX - startX) * fraction
          const y = startY + (endY - startY) * fraction
          const dx = x - poleX
          const dy = y - poleY
          const distanceSquared = dx ** 2 + dy ** 2
          const influence = Math.exp(-distanceSquared / radius ** 2)
          const deflection = strength * influence / (distanceSquared + softening ** 2)
          const magnitude = Math.hypot(1, deflection)
          const mappedX = poleX + (dx - dy * deflection) / magnitude
          const mappedY = poleY + (dy + dx * deflection) / magnitude
          if (i === 0) context.moveTo(mappedX, mappedY)
          else context.lineTo(mappedX, mappedY)
        }
      }

      context.beginPath()
      for (let x = spacing / 2; x < width; x += spacing) trace(x, 0, x, height)
      for (let y = spacing / 2; y < height; y += spacing) trace(0, y, width, y)
      const ink = context.createRadialGradient(poleX, poleY, 0, poleX, poleY, radius)
      ink.addColorStop(0, bright)
      ink.addColorStop(.35, bright)
      ink.addColorStop(1, line)
      context.strokeStyle = ink
      context.lineWidth = .85
      context.stroke()

      context.beginPath()
      context.arc(poleX, poleY, 2.2, 0, Math.PI * 2)
      context.fillStyle = point
      context.fill()
    }

    function tick(time: number) {
      frame = null
      const elapsed = previousTime ? Math.min(time - previousTime, 50) : 16
      const remaining = Math.hypot(target.x - current.x, target.y - current.y)
      const settled = motion.matches || remaining < .001
      const blend = 1 - Math.exp(-elapsed / 75)
      current = settled ? target : {
        x: current.x + (target.x - current.x) * blend,
        y: current.y + (target.y - current.y) * blend,
      }
      draw()
      previousTime = settled ? 0 : time
      if (!settled) frame = requestAnimationFrame(tick)
    }

    function setTarget(next: Point) {
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
      width = entry.contentRect.width
      height = entry.contentRect.height
      if (width === 0 || height === 0) return

      const density = Math.min(window.devicePixelRatio, 2)
      drawing.width = Math.round(width * density)
      drawing.height = Math.round(height * density)
      context.setTransform(drawing.width / width, 0, 0, drawing.height / height, 0, 0)
      draw()
    })

    resize.observe(surface)
    surface.addEventListener('pointermove', onPointerMove)
    surface.addEventListener('pointerleave', onPointerLeave)
    surface.addEventListener('click', followPointer)
    surface.addEventListener('keydown', onKeyDown)
    return () => {
      resize.disconnect()
      surface.removeEventListener('pointermove', onPointerMove)
      surface.removeEventListener('pointerleave', onPointerLeave)
      surface.removeEventListener('click', followPointer)
      surface.removeEventListener('keydown', onKeyDown)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div
      ref={plane}
      className="complex-plane"
      role="group"
      aria-label="Interactive complex plane"
      aria-describedby={instructionsId}
      tabIndex={0}
    >
      <canvas ref={canvas} aria-hidden="true" />
      <span id={instructionsId} className="visually-hidden">
        Move your pointer, tap, or use the arrow keys to bend the grid.
        Press Escape to reset.
      </span>
    </div>
  )
}
