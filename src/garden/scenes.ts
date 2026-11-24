// The three scenes that share the stage: the garden, the projects workshop inside the hut, and
// the bookshelf close-up. Art by Codex in /garden (see garden/workshop/REQUEST.md). The garden
// and the shelf are 640 × 360 pixel art; the workshop is a painted 1672 × 941 picture.
import type { Route } from '../router'
import { projects } from '../content'
import { hoverOutlines, landmarks, layers as gardenLayers, masterUrl as gardenMaster } from './layers'
import { ART_HEIGHT, ART_WIDTH } from './layers'
import type { Layer } from './layers'
import type { Art } from './fit'
import workshopMaster from '../../garden/workshop/painted/workshop-background.png'
import shelfMaster from '../../garden/workshop/shelf-640x360.png'
import shelfManifest from '../../garden/workshop/shelf.json'

export type SceneId = 'garden' | 'workshop' | 'shelf'

type Box = { x: number, y: number, w: number, h: number }

// A clickable place in a scene. Its hover outline, when there is one, also sets its shape.
export type Spot = {
  id: string
  href: string
  label: string // the accessible name
  caption?: string // shown beside the object on hover and focus
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
  back?: { href: string, label: string } // Escape and the scene's own back control
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

const workshopSpot = (id: string, href: string, label: string, caption: string, [x, y, w, h]: number[]): Spot =>
  ({ id, href, label, caption, area: { x, y, w, h }, outline: workshopOutlines[`../../garden/workshop/painted/hover-${id}.png`] })

const workshopSpots: Spot[] = [
  workshopSpot('atlas', '/projects/atlas', 'Atlas: the map on the desk', 'Atlas', [455, 530, 780, 240]),
  workshopSpot('fire-and-ice', '/projects/fire-and-ice', 'Fire and Ice: the mountain screen', 'Fire and Ice', [465, 80, 310, 195]),
  workshopSpot('lol-ping', '/projects/lol-ping', 'LoL Ping: the terminal screen', 'LoL Ping', [795, 135, 195, 140]),
  workshopSpot('shelf', '/projects/shelf', 'All projects: the bookshelf', 'All projects', [525, 310, 445, 150]),
  workshopSpot('door', '/', 'Back to the garden: the door', 'Back to the garden', [0, 0, 200, 941]),
]

const shelfSpots: Spot[] = shelfManifest.spines.flatMap(({ id, x, y, width, height }) => {
  const project = projects.find(item => item.id === id)
  return project ? [{ id, href: `/projects/${id}`, label: project.title, title: project.title, area: { x, y, w: width, h: height } }] : []
})

export const scenes: Record<SceneId, Scene> = {
  garden: {
    id: 'garden', title: 'The garden', master: gardenMaster, art: PIXEL_ART, layers: gardenLayers,
    spots: gardenSpots, outlines: outlinesOf(gardenSpots), focusX: 311,
  },
  workshop: {
    id: 'workshop', title: 'Projects', master: workshopMaster, art: { width: 1672, height: 941, pixel: false },
    layers: workshopLayers, spots: workshopSpots, outlines: outlinesOf(workshopSpots), focusX: 830,
    back: { href: '/', label: 'Back to the garden' },
  },
  shelf: {
    id: 'shelf', title: 'All projects', master: shelfMaster, art: PIXEL_ART, layers: [], spots: shelfSpots, outlines: {},
    focusX: 230, back: { href: '/projects', label: 'Back to the workshop' },
  },
}

export const SHELF_ID = 'shelf'

// Which scene a route shows. Garden pages open over the garden, project books over the workshop.
export function sceneFor(route: Route): SceneId {
  if (route.view !== 'projects') return 'garden'
  return route.projectId === SHELF_ID ? 'shelf' : 'workshop'
}

// Project books open from the desk return there; the others came from the shelf.
export function bookBack(projectId: string) {
  return projects.find(project => project.id === projectId)?.onDesk
    ? { href: '/projects', label: 'Back to the workshop' }
    : { href: `/projects/${SHELF_ID}`, label: 'Back to the bookshelf' }
}

// The spot to return focus to when the visitor comes back from `from` to `scene`.
export function returnSpot(from: Route, scene: SceneId): string | null {
  if (scene === 'garden') return from.view === 'garden' ? null : from.view
  if (from.view !== 'projects' || !from.projectId) return null
  if (scene === 'shelf') return from.projectId === SHELF_ID ? null : from.projectId
  if (from.projectId === SHELF_ID) return 'shelf'
  return projects.find(project => project.id === from.projectId)?.onDesk ? from.projectId : 'shelf'
}
