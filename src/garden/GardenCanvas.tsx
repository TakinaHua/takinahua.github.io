import { useEffect, useRef } from 'react'
import { ART_HEIGHT, ART_WIDTH, layers as gardenLayers, masterUrl as gardenMaster } from './layers'

function loadImage(src: string) {
  const image = new Image()
  image.src = src
  return image.decode().then(() => image)
}

const frameOf = (now: number, frameMs: number, frames: number) => Math.floor(now / frameMs) % frames

// Draws a scene's picture and its animated sprite sheets at the picture's own size (the
// garden's 640 × 360 grid by default). CSS scales the canvas to the stage.
export default function GardenCanvas({ layers = gardenLayers, masterUrl = gardenMaster, width = ART_WIDTH, height = ART_HEIGHT } = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    let master: HTMLImageElement | null = null
    let sheets: HTMLImageElement[] | null = null
    let request = 0
    let lastKey = ''
    let onScreen = true
    let cancelled = false

    function draw(now: number | null) {
      if (!master) return
      context!.drawImage(master, 0, 0)
      if (now === null || !sheets) return
      layers.forEach((layer, index) => {
        const frame = frameOf(now, layer.frameMs, layer.frames)
        context!.drawImage(
          sheets![index],
          (frame % layer.columns) * layer.w, Math.floor(frame / layer.columns) * layer.h, layer.w, layer.h,
          layer.x, layer.y, layer.w, layer.h,
        )
      })
    }

    function tick(now: number) {
      // Redraw only when some layer reaches a new frame.
      const key = layers.map(layer => frameOf(now, layer.frameMs, layer.frames)).join()
      if (key !== lastKey) {
        lastKey = key
        draw(now)
      }
      request = requestAnimationFrame(tick)
    }

    function sync() {
      cancelAnimationFrame(request)
      request = 0
      lastKey = ''
      if (motion.matches || !sheets) {
        draw(null)
        return
      }
      if (onScreen) request = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      sync()
    })
    observer.observe(canvas)
    motion.addEventListener('change', sync)

    loadImage(masterUrl).then(image => {
      if (cancelled) return
      master = image
      sync()
      return Promise.all(layers.map(layer => loadImage(layer.src)))
    }).then(images => {
      if (cancelled || !images) return
      sheets = images
      sync()
    }).catch(() => {
      // The stage's CSS background still shows the still garden.
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(request)
      observer.disconnect()
      motion.removeEventListener('change', sync)
    }
  }, [layers, masterUrl])

  return <canvas ref={canvasRef} className="garden-canvas" width={width} height={height} aria-hidden="true" />
}
