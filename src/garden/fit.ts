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

// Show the entire picture between the bars, centred, with the blurred scene filling any
// leftover space.
export function computeWholeLayout(width: number, height: number, dpr: number, insets: Insets = {}): GardenLayout {
  const insetTop = insets.top ?? 0
  const bandHeight = height - insetTop - (insets.bottom ?? 0)
  const snap = (value: number) => Math.round(value * dpr) / dpr
  const exact = Math.min(width / ART_WIDTH, bandHeight / ART_HEIGHT)
  const whole = Math.floor(exact * dpr) / dpr
  // Whole device pixels when they cost little size; never larger than the space allows.
  const scale = whole >= 1 / dpr && exact < whole * PREFER_WHOLE ? whole : exact

  if (width < PAN_BELOW_WIDTH && ART_HEIGHT * scale < bandHeight * MIN_HEIGHT_SHARE) {
    const panScale = Math.ceil((bandHeight / ART_HEIGHT) * dpr) / dpr
    const artWidth = ART_WIDTH * panScale
    const safeCentreX = SAFE_AREA.x + SAFE_AREA.w / 2
    return {
      scale: panScale,
      left: 0,
      top: snap(insetTop + (bandHeight - ART_HEIGHT * panScale) / 2),
      pan: artWidth > width,
      panTo: Math.max(0, Math.min(artWidth - width, safeCentreX * panScale - width / 2)),
    }
  }

  return {
    scale,
    left: snap((width - ART_WIDTH * scale) / 2),
    top: snap(insetTop + (bandHeight - ART_HEIGHT * scale) / 2),
    pan: false,
    panTo: 0,
  }
}
