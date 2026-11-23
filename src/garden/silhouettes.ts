import { useEffect, useState } from 'react'
import { hoverOutlines } from './layers'
import type { LandmarkId } from './layers'

// The clickable shape of each landmark, read from its hover outline so the hover area matches
// what the visitor sees. `area` is the outline's bounding box in the picture's own pixels (each
// outline is drawn at its scene's full size); `clipPath` is a CSS
// polygon() in percentages of that box.
export type Silhouette = {
  area: { x: number, y: number, w: number, h: number }
  clipPath: string
}

export type Silhouettes = Partial<Record<LandmarkId, Silhouette>>

// Ignore near-invisible pixels so faint glow edges do not widen the shape.
const MIN_ALPHA = 24

type Point = [number, number]

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

// Andrew's monotone chain; points sorted by x, then y.
function convexHull(points: Point[]): Point[] {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cross = (o: Point, a: Point, b: Point) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const half = (list: Point[]) => {
    const hull: Point[] = []
    for (const point of list) {
      while (hull.length >= 2 && cross(hull[hull.length - 2], hull[hull.length - 1], point) <= 0) hull.pop()
      hull.push(point)
    }
    hull.pop()
    return hull
  }
  return [...half(sorted), ...half(sorted.reverse())]
}

// The outlines are deliberately open where something stands in front of the object (the
// noticeboard before the hut, grass at the foot of the post), so the shape is the convex hull
// of the outline rather than its enclosed area.
function traceSilhouette(pixels: Uint8ClampedArray, width: number, height: number): Silhouette | null {
  const corners: Point[] = []
  let left = width, right = -1, top = height, bottom = -1

  for (let y = 0; y < height; y++) {
    let first = -1, last = -1
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] < MIN_ALPHA) continue
      if (first < 0) first = x
      last = x
    }
    if (first < 0) continue
    // The outer corners of each row's end pixels bound every pixel on that row.
    corners.push([first, y], [first, y + 1], [last + 1, y], [last + 1, y + 1])
    left = Math.min(left, first)
    right = Math.max(right, last + 1)
    top = Math.min(top, y)
    bottom = y + 1
  }
  if (right < 0) return null

  const area = { x: left, y: top, w: right - left, h: bottom - top }
  const percent = (value: number, start: number, size: number) => `${Number((((value - start) / size) * 100).toFixed(3))}%`
  const points = convexHull(corners).map(([x, y]) => `${percent(x, left, area.w)} ${percent(y, top, area.h)}`)
  return { area, clipPath: `polygon(${points.join(', ')})` }
}

export function useSilhouettes(outlines: Partial<Record<string, string>> = hoverOutlines) {
  const [silhouettes, setSilhouettes] = useState<Partial<Record<string, Silhouette>>>({})

  useEffect(() => {
    let cancelled = false
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return

    Promise.all(Object.entries(outlines).map(async ([id, src]) => {
      if (!src) return [id, null] as const
      const image = await loadImage(src)
      const { naturalWidth: width, naturalHeight: height } = image
      canvas.width = width
      canvas.height = height
      context.drawImage(image, 0, 0)
      return [id, traceSilhouette(context.getImageData(0, 0, width, height).data, width, height)] as const
    })).then(entries => {
      if (cancelled) return
      setSilhouettes(Object.fromEntries(entries.filter((entry): entry is readonly [string, Silhouette] => entry[1] !== null)))
    }).catch(() => { /* keep the rectangular areas */ })

    return () => { cancelled = true }
  }, [outlines])

  return silhouettes
}
