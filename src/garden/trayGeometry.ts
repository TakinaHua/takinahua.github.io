// Sizes of the projects tray (ProjectTray.tsx), in the concept art's own pixels. The box is drawn
// for two projects and widens for more; the drawer is a little wider than the box.
import { projects } from '../content'

export const BOX = { width: 608, height: 239 }
export const DRAWER = { width: 641, height: 87 }
export const CARD = { width: 221, height: 116, pitch: 251 } // cards sit 30 px apart
const EDGES = 136 // the box's ends around the cards: 68 px before the first card, 68 after the last
const GAP = 4 // between the box and the drawer, in screen pixels
const MARGIN = 10 // below the drawer

// Scale and extra width for a window `width` wide: at most 70 %, never wider than the window,
// and wide enough for every project when there is room (the rest scroll inside the box).
export function trayGeometry(width: number) {
  const scale = Math.min(0.7, (width - 16) / DRAWER.width)
  const all = EDGES + CARD.pitch * projects.length - (CARD.pitch - CARD.width)
  const fits = (width - 16) / scale - (DRAWER.width - BOX.width)
  const extra = Math.max(0, Math.min(all, fits) - BOX.width)
  const drawer = Math.round(DRAWER.height * scale)
  return {
    scale,
    extra,
    closed: drawer + MARGIN, // the drawer alone
    open: drawer + MARGIN + GAP + Math.round(BOX.height * scale),
  }
}
