import { useEffect, useId, useRef } from 'react'

type Point = { x: number; y: number }

const rest: Point = { x: .64, y: .43 }
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
    const surfaceColor = colors.getPropertyValue('--color-surface').trim()
    const raisedColor = colors.getPropertyValue('--color-highlight-surface').trim()
    let width = 0
    let height = 0
    let current = rest
    let target = rest
    let frame: number | null = null
    let previousTime = 0

    const draw = () => {
      if (width === 0 || height === 0) return

      const poleX = current.x * width
      const poleY = current.y * height
      const radius = height * .32
      const radiusSquared = radius ** 2
      const softeningSquared = (height * .12) ** 2
      const strength = (height * .15) ** 2
      const rowCount = 23
      const columnCount = 72

      context.clearRect(0, 0, width, height)

      const light = context.createRadialGradient(poleX, poleY, 0, poleX, poleY, radius * 1.65)
      light.addColorStop(0, glow)
      light.addColorStop(1, 'transparent')
      context.fillStyle = light
      context.fillRect(0, 0, width, height)

      // Project a continuous wave surface and apply a softened complex rotation
      // around the pointer. Both are sampled on the same mesh.
      const rows = Array.from({ length: rowCount + 1 }, (_, row) => {
        const v = row / rowCount
        return Array.from({ length: columnCount + 1 }, (_, column) => {
          const u = column / columnCount
          const ridge = .55 - .23 * u
          const crest = Math.exp(-(((v - ridge) / .19) ** 2))
          const shoulder = Math.exp(-(((v - ridge - .31) / .20) ** 2))
          const lift = Math.sin(Math.PI * u) * (.36 * crest + .11 * shoulder)
          const x = (.02 + .84 * u + .13 * v) * width
          const y = (.44 - .18 * u + .46 * v - lift) * height
          const dx = x - poleX
          const dy = y - poleY
          const distanceSquared = dx ** 2 + dy ** 2
          const turn = strength * Math.exp(-distanceSquared / radiusSquared)
            / (distanceSquared + softeningSquared)
          const magnitude = Math.sqrt(1 + turn ** 2)
          return {
            x: poleX + (dx - dy * turn) / magnitude,
            y: poleY + (dy + dx * turn) / magnitude,
          }
        })
      })

      const face = context.createLinearGradient(0, height * .75, width, height * .13)
      face.addColorStop(0, surfaceColor)
      face.addColorStop(.56, raisedColor)
      face.addColorStop(1, surfaceColor)

      const ink = context.createLinearGradient(0, height * .65, width, height * .25)
      ink.addColorStop(0, 'transparent')
      ink.addColorStop(.19, line)
      ink.addColorStop(.49, bright)
      ink.addColorStop(.8, line)
      ink.addColorStop(1, 'transparent')

      const highlight = context.createRadialGradient(poleX, poleY, 0, poleX, poleY, radius)
      highlight.addColorStop(0, bright)
      highlight.addColorStop(.48, line)
      highlight.addColorStop(1, 'transparent')

      const trace = (row: Point[]) => {
        context.moveTo(row[0].x, row[0].y)
        for (let i = 1; i < row.length; i++) context.lineTo(row[i].x, row[i].y)
      }

      // Draw back to front so a raised section can cover the lines behind it.
      for (let row = 0; row < rowCount; row++) {
        const back = rows[row]
        const front = rows[row + 1]
        context.beginPath()
        trace(back)
        for (let column = columnCount; column >= 0; column--) {
          context.lineTo(front[column].x, front[column].y)
        }
        context.closePath()
        context.fillStyle = face
        context.globalAlpha = .94
        context.fill()

        context.beginPath()
        for (let column = 6; column < columnCount; column += 6) {
          context.moveTo(back[column].x, back[column].y)
          context.lineTo(front[column].x, front[column].y)
        }
        context.strokeStyle = ink
        context.lineWidth = .75
        context.globalAlpha = .36
        context.stroke()

        context.beginPath()
        trace(front)
        context.lineWidth = 1
        context.globalAlpha = .86
        context.stroke()
        context.strokeStyle = highlight
        context.globalAlpha = .55
        context.stroke()
      }
      context.globalAlpha = 1
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
