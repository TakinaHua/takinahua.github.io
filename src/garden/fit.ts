import { ART_HEIGHT, ART_WIDTH } from './layers'

// Native-pixel box that must stay visible: the four landmarks and the sakura
// trunk. The hut roof peak, the top of the forest and the pond may be cropped.
export const SAFE_AREA = { x: 68, y: 40, w: 486, h: 260 }

export type GardenLayout = {
  scale: number // CSS pixels per art pixel
  left: number // art position inside the viewport, in CSS pixels
  top: number
  pan: boolean // true on narrow portrait screens, where the scene scrolls sideways
  panTo: number // initial scrollLeft in pan mode, centred on the safe area
}

// Space taken by bars drawn over the scene, which the safe area must stay clear of.
export type Insets = { top?: number, bottom?: number }

// Whole device pixels per art pixel keep the art crisp. Prefer them unless an in-between
// scale shows the scene at least 15% larger; at that size the unevenness is hard to see.
const PREFER_WHOLE = 1.15

// Below this share of the window height, a contained scene looks like a thin strip
// (portrait phones and tablets), so fill the height and let visitors pan instead.
const MIN_HEIGHT_SHARE = 0.7

// Below this width (phones), a whole picture would be too small to use, so the scene
// fills the height and visitors pan instead. Anything wider always shows the whole frame.
const PAN_BELOW_WIDTH = 520

// The picture a scene draws: its own size in pixels, and whether it is pixel art (scaled by whole
// device pixels to stay crisp) or a painted picture (scaled smoothly to the exact fit).
export type Art = { width: number, height: number, pixel: boolean }
const PIXEL_ART: Art = { width: ART_WIDTH, height: ART_HEIGHT, pixel: true }

// Show the entire picture between the bars, centred, with the blurred scene filling any
// leftover space. focusX is the x, in the picture's pixels, a narrow screen's pan starts
// centred on (the garden's landmarks by default).
export function computeWholeLayout(
  width: number, height: number, dpr: number, insets: Insets = {}, focusX = SAFE_AREA.x + SAFE_AREA.w / 2, art: Art = PIXEL_ART,
): GardenLayout {
  const insetTop = insets.top ?? 0
  const bandHeight = height - insetTop - (insets.bottom ?? 0)
  const snap = (value: number) => Math.round(value * dpr) / dpr
  const exact = Math.min(width / art.width, bandHeight / art.height)
  const whole = Math.floor(exact * dpr) / dpr
  // Pixel art: whole device pixels when they cost little size; never larger than the space allows.
  const scale = art.pixel && whole >= 1 / dpr && exact < whole * PREFER_WHOLE ? whole : exact

  if (width < PAN_BELOW_WIDTH && art.height * scale < bandHeight * MIN_HEIGHT_SHARE) {
    const fill = bandHeight / art.height
    const panScale = art.pixel ? Math.ceil(fill * dpr) / dpr : fill
    const artWidth = art.width * panScale
    return {
      scale: panScale,
      left: 0,
      top: snap(insetTop + (bandHeight - art.height * panScale) / 2),
      pan: artWidth > width,
      panTo: Math.max(0, Math.min(artWidth - width, focusX * panScale - width / 2)),
    }
  }

  return {
    scale,
    left: snap((width - art.width * scale) / 2),
    top: snap(insetTop + (bandHeight - art.height * scale) / 2),
    pan: false,
    panTo: 0,
  }
}
