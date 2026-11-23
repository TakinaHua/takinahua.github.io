// Garden art lives in /garden (made with Codex). Positions and timings follow garden/final/FINAL.md.
import master from '../../garden/final/garden-final-640x360.png'
import waterfall from '../../garden/animations/waterfall/waterfall-sheet.png'
import pond from '../../garden/animations/pond/pond-shimmer-sheet.png'
import sakura from '../../garden/animations/sakura/sakura-sway-sheet-clean.png'
import cat from '../../garden/animations/cat/cat-sheet.png'
import windowGlow from '../../garden/animations/glow/window-sheet.png'
import lanternGlow from '../../garden/animations/glow/lantern-sheet.png'
import fireflies from '../../garden/animations/fireflies/fireflies-sheet.png'

export const ART_WIDTH = 640
export const ART_HEIGHT = 360
export const masterUrl = master

export type Layer = {
  src: string
  x: number
  y: number
  w: number
  h: number
  frames: number
  columns: number
  frameMs: number
}

// Drawn bottom to top.
export const layers: Layer[] = [
  { src: waterfall, x: 120, y: 248, w: 96, h: 112, frames: 15, columns: 15, frameMs: 110 },
  { src: pond, x: 64, y: 320, w: 548, h: 40, frames: 48, columns: 8, frameMs: 100 },
  { src: sakura, x: 262, y: 0, w: 250, h: 214, frames: 72, columns: 12, frameMs: 1000 / 12 },
  { src: cat, x: 309, y: 171, w: 51, h: 40, frames: 88, columns: 11, frameMs: 100 },
  { src: windowGlow, x: 90, y: 84, w: 82, h: 77, frames: 48, columns: 8, frameMs: 100 },
  { src: lanternGlow, x: 377, y: 220, w: 60, h: 140, frames: 48, columns: 8, frameMs: 100 },
  { src: fireflies, x: 8, y: 117, w: 618, h: 119, frames: 66, columns: 11, frameMs: 100 },
]

export type LandmarkId = 'projects' | 'experience' | 'about' | 'contact'

export type Landmark = {
  id: LandmarkId
  label: string
  // Clickable area in native art pixels, used until the outline's own shape is read (and for
  // any landmark without an outline).
  area: { x: number, y: number, w: number, h: number }
}

export const landmarks: Landmark[] = [
  { id: 'projects', label: 'Projects', area: { x: 75, y: 18, w: 152, h: 176 } },
  { id: 'experience', label: 'Experience', area: { x: 229, y: 89, w: 74, h: 92 } },
  { id: 'about', label: 'About me', area: { x: 434, y: 224, w: 106, h: 74 } },
  { id: 'contact', label: 'Contact', area: { x: 500, y: 70, w: 44, h: 80 } },
]

// Hover outlines from Codex (see garden/hover/REQUEST.md): full 640 × 360 overlays named after
// each landmark. Any that are missing fall back to the soft oval glow in garden.css. The
// pattern names the four files so preview.png is not bundled.
const outlineFiles = import.meta.glob<string>('../../garden/hover/{projects,experience,about,contact}.png', { eager: true, import: 'default' })
export const hoverOutlines: Partial<Record<LandmarkId, string>> = Object.fromEntries(
  Object.entries(outlineFiles).map(([path, url]) => [path.slice(path.lastIndexOf('/') + 1, -'.png'.length), url]),
)
