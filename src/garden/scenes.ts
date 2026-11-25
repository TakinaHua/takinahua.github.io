// The three scenes that share the stage: the garden, the projects workshop inside the hut, and
// the bookshelf close-up. Art by Codex in /garden (see garden/workshop/REQUEST.md). The garden
// is 640 × 360 pixel art; the workshop (1672 × 941) and the shelf (1536 × 1024) are painted.
import type { Route } from '../router'
import { projects } from '../content'
import { hoverOutlines, landmarks, layers as gardenLayers, masterUrl as gardenMaster } from './layers'
import { ART_HEIGHT, ART_WIDTH } from './layers'
import type { Layer } from './layers'
import type { Art } from './fit'
import workshopMaster from '../../garden/workshop/painted/workshop-background.webp'
import shelfMaster from '../../garden/workshop/shelf-painted.webp'

export type SceneId = 'garden' | 'workshop' | 'shelf'

type Box = { x: number, y: number, w: number, h: number }

// A clickable place in a scene. Its hover outline, when there is one, also sets its shape.
export type Spot = {
  id: string
  href: string
  label: string // the accessible name
  title?: string // written on the object itself (book spines)
  area: Box
  outline?: string
}

export type Scene = {
  id: SceneId
  title: string // the page title and the scene's hidden heading
  master: string
  art: Art
  layers: Layer[] // sprite sheets drawn on the scene's canvas
  spots: Spot[]
  outlines: Partial<Record<string, string>>
  focusX: number // where a narrow screen starts its pan, in the picture's pixels
  // Where Escape leads. The scene shows its own back button unless the way back is drawn in
  // the picture (the workshop's Garden sign); phones, which pan, keep the button anyway.
  back?: { href: string, label: string, inPicture?: boolean }
}

const outlinesOf = (spots: Spot[]) => Object.fromEntries(spots.flatMap(spot => spot.outline ? [[spot.id, spot.outline]] : []))

const gardenSpots: Spot[] = landmarks.map(({ id, label, area }) => ({ id, href: `/${id}`, label, area, outline: hoverOutlines[id] }))

const PIXEL_ART: Art = { width: ART_WIDTH, height: ART_HEIGHT, pixel: true }

// The workshop's animations, redone one element at a time (garden/workshop/ANIMATION-PROMPT.md):
// each element is a sprite sheet in animations/<name>/, placed by <name>.json and drawn on the
// scene's canvas like the garden's. Codex delivers PNG sheets; the site loads a WebP copy of
// each (<name>-sheet.webp), which is a fraction of the size.
type SheetPlacement = { x: number, y: number, width: number, height: number, frames: number, columns: number, frameMs: number }
const sheetFiles = import.meta.glob<string>('../../garden/workshop/animations/*/*-sheet.webp', { eager: true, import: 'default' })
const sheetPlacements = import.meta.glob<SheetPlacement>('../../garden/workshop/animations/*/*.json', { eager: true, import: 'default' })
const ELEMENT_ORDER = ['petals', 'pond', 'lamp', 'steam', 'fire-and-ice', 'lol-ping', 'ivy', 'cat']
const workshopLayers: Layer[] = ELEMENT_ORDER.flatMap(name => {
  const src = sheetFiles[`../../garden/workshop/animations/${name}/${name}-sheet.webp`]
  const placement = sheetPlacements[`../../garden/workshop/animations/${name}/${name}.json`]
  if (!src || !placement) return []
  const { x, y, width: w, height: h, frames, columns, frameMs } = placement
  return [{ src, x, y, w, h, frames, columns, frameMs }]
})

// Outlines for the painted workshop, when Codex adds them (hover-<id>.png at 1672 × 941). Until
// then each spot is its rectangle with the soft oval glow.
const workshopOutlines = import.meta.glob<string>('../../garden/workshop/painted/hover-*.png', { eager: true, import: 'default' })

const workshopSpot = (id: string, href: string, label: string, [x, y, w, h]: number[]): Spot =>
  ({ id, href, label, area: { x, y, w, h }, outline: workshopOutlines[`../../garden/workshop/painted/hover-${id}.png`] })

const workshopSpots: Spot[] = [
  workshopSpot('atlas', '/projects/atlas', 'Atlas: the map on the desk', [455, 530, 780, 240]),
  workshopSpot('fire-and-ice', '/projects/fire-and-ice', 'Fire and Ice: the mountain screen', [465, 80, 310, 195]),
  workshopSpot('lol-ping', '/projects/lol-ping', 'LoL Ping: the terminal screen', [795, 135, 195, 140]),
  workshopSpot('shelf', '/projects/shelf', 'All projects: the bookshelf', [525, 310, 445, 150]),
  workshopSpot('door', '/', 'Back to the garden: the Garden sign on the door', [96, 520, 144, 296]),
]

// The bookshelf close-up is a painted 1536 × 1024 picture: four standing books, one for each
// project, each titled on its spine, and a crimson "← Workshop" ribbon painted top left.
const SHELF_SPINES: [string, number[]][] = [
  ['atlas', [112, 268, 190, 484]],
  ['fire-and-ice', [302, 222, 164, 530]],
  ['lol-ping', [468, 282, 132, 470]],
  ['ev-optimization', [602, 345, 116, 407]],
]

const shelfSpots: Spot[] = [
  ...SHELF_SPINES.flatMap(([id, [x, y, w, h]]) => {
    const project = projects.find(item => item.id === id)
    return project ? [{ id, href: `/projects/${id}`, label: project.title, title: project.title, area: { x, y, w, h } }] : []
  }),
  { id: 'workshop', href: '/projects', label: 'Back to the workshop', area: { x: 112, y: 70, w: 520, h: 118 } },
]

export const scenes: Record<SceneId, Scene> = {
  garden: {
    id: 'garden', title: 'The garden', master: gardenMaster, art: PIXEL_ART, layers: gardenLayers,
    spots: gardenSpots, outlines: outlinesOf(gardenSpots), focusX: 311,
  },
  workshop: {
    id: 'workshop', title: 'Projects', master: workshopMaster, art: { width: 1672, height: 941, pixel: false },
    layers: workshopLayers, spots: workshopSpots, outlines: outlinesOf(workshopSpots), focusX: 830,
    back: { href: '/', label: 'Back to the garden', inPicture: true },
  },
  shelf: {
    id: 'shelf', title: 'All projects', master: shelfMaster, art: { width: 1536, height: 1024, pixel: false }, layers: [],
    spots: shelfSpots, outlines: {}, focusX: 560, back: { href: '/projects', label: 'Back to the workshop', inPicture: true },
  },
}

export const SHELF_ID = 'shelf'

// Which scene a route shows. Garden pages open over the garden, project books over the workshop.
export function sceneFor(route: Route): SceneId {
  if (route.view !== 'projects') return 'garden'
  return route.projectId === SHELF_ID ? 'shelf' : 'workshop'
}

// Every project book is shelved: its "← Bookshelf" ribbon leads there, wherever it was opened.
export function bookBack() {
  return { href: `/projects/${SHELF_ID}`, label: 'Back to the bookshelf' }
}

// The spot to return focus to when the visitor comes back from `from` to `scene`.
export function returnSpot(from: Route, scene: SceneId): string | null {
  if (scene === 'garden') return from.view === 'garden' ? null : from.view
  if (from.view !== 'projects' || !from.projectId) return null
  if (scene === 'shelf') return from.projectId === SHELF_ID ? null : from.projectId
  if (from.projectId === SHELF_ID) return 'shelf'
  return projects.find(project => project.id === from.projectId)?.onDesk ? from.projectId : 'shelf'
}
