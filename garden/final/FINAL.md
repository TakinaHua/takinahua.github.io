# Final garden background

_Background: `garden-wide-v12.png` (redrawn hut), an exact 3× enlargement of the 640 × 360 master._

- `final/garden-final-640x360.png`: the master file. Native pixel art, 640 × 360 grid, 192 colours. Use this one in the site.
- `final/garden-final-1920x1080.png`: the same image enlarged exactly 3× (each pixel is a 3×3 block), for viewing.

## Display rules (keep the pixels crisp)
- Scale only by whole numbers (2×, 3×, 4×…), never fractions.
- CSS: `image-rendering: pixelated;` on the image or canvas.
- To fill the screen: use the smallest whole-number scale that covers the window, centred, letting edges crop.
  e.g. a 1512×860 window → 3× (1920×1080), cropping about 204 px per side and 110 px top and bottom.

## For animation (waterfall, petals, fireflies, pond, sky, cat)
- Draw every animated layer on the same 640 × 360 grid, then scale it with the background, so its pixels match.
- Use colours sampled from this image so the animated parts blend in.
- No text or signs in the art; labels and navigation are handled in code.

## Waterfall (done)
- `animations/waterfall/waterfall-sheet.png`: 15 frames side by side, each 96 × 112 grid pixels. It replaces the patch of the picture at grid (120, 248). Play one frame every 110 ms in a loop.
- Each frame is the picture's own pixels, animated: the sheet of water scrolls down 2 px a frame (the lip stays fixed), the foam churns, the reflection shimmers, and three faint rings spread across the pond.
- Position it in screen pixels as: left = artLeft + 120 × scale, top = artTop + 248 × scale; size 96 × 112 × scale; `background-size` = (96 × 15 × scale) × (112 × scale); `background-position-x` = −frame × 96 × scale.
- `animations/waterfall/waterfall-preview.gif` shows the loop; `animations/waterfall/build_waterfall.py` regenerates the sheet (run it from that folder).
- If a new effect (petals, fireflies) is drawn over the pond, draw it above this layer.
- Cropping to fill the screen: take about 3/4 of the extra height from the top (forest) so the pond and waterfall stay visible.

## Sakura sway (done; replaces the earlier GIF-based sheet)
- Use `animations/sakura/sakura-sway-sheet-clean.png`: 72 frames, 12 per row, each 250 × 214 grid pixels, transparent wherever a frame matches the picture. Place it at grid (262, 0) and play at 12 fps (about 83 ms per frame) in a loop.
- Source: `animations/sakura/` (made by `animate.py` / `export.py` from the picture's own pixels). The "-clean" version is the same animation with 537 blurred in-between colours snapped to the picture's own palette, so revealed edges stay crisp.
- Movement: the whole crown leans downwind together in gusts and settles back (top up to 3 px, upper sides 1–2, fork 0), tips dip 1 px at the strongest gust, about 16 petals fall. The loop closes with almost no change (50 px).
- Frame position in the sheet: column = frame % 12, row = floor(frame / 12).
- The overlay does not change the cat's pixels, but its rectangle covers that area: draw any cat animation above this layer.
- Settings (position, size, fps) are in `animations/sakura/sakura-sway.json`.

## Lantern and window glow

Use the two transparent sheets in `animations/glow/` over the 640 × 360 master.
Both contain 48 frames in 8 columns and 6 rows, looping every 4.8 seconds
at 100 ms per frame. Clear each overlay before drawing its next frame.

| Sheet | Native position (x, y) | Frame size |
| --- | --- | --- |
| `window-sheet.png` | (90, 84) | 82 × 77 |
| `lantern-sheet.png` | (377, 220) | 60 × 140 |

## Pond shimmer

Place `animations/pond/pond-shimmer-sheet.png` at native (64, 320).
Each transparent tile is 548 × 40 pixels. Read the 48 frames left to right
in 8 columns and 6 rows. Advance every 100 ms and wrap after 4.8 seconds.
Clear the old tile each tick. Draw the master, waterfall, shimmer, then the
two glow layers. Most of the shimmer tile is transparent, including the
waterfall patch and the lantern reflection.

Ten broken blue crests brighten in staggered groups. Each travels up to ten native
pixels. At its peak, the crest picks up the pale blue of the pond reflections,
with a short, broken glint trailing the main line.
The 1280 × 720 preview (`animations/pond/pond-shimmer-in-scene.apng`) plays
the waterfall, shimmer, window and lantern at their original timings. Its
52.8-second loop contains 32 waterfall cycles and 11 shimmer/glow cycles.
Run `python garden/animations/pond/build_pond.py` with Pillow to rebuild
both assets and check the decoded preview against the native composition
at every frame boundary after nearest-neighbor enlargement.

## Fireflies

Place `animations/fireflies/fireflies-sheet.png` at native (8, 117). Each
618 × 119 tile contains only the lights. Read 66 frames left to right in
11 columns and 6 rows, advancing every 100 ms for a 6.6-second loop. Clear
the previous tile and composite above the garden layers using its alpha.

Seven fireflies follow short curved paths near grass and shrubs. Their
two-pixel pale yellow cores glow inside seven-pixel-wide amber halos.
Each light rises and fades over 3.4–4.2 seconds, with staggered peaks.
`animations/fireflies/fireflies-in-scene.apng` shows eight loops over the
waterfall, pond shimmer, window and lantern glow at 2× nearest-neighbor
scale. Run `python garden/animations/fireflies/build_fireflies.py` with
Pillow to rebuild from the sheet generator and the current pond preview.

## Sleeping cat

Place `animations/cat/cat-sheet.png` at native (309, 171), above the sakura
overlay. Each transparent tile is 51 × 40 pixels. Read the 88 frames left
to right in 11 columns and 8 rows. Advance every 100 ms, clearing the old tile.
The 8.8-second loop includes two breaths and a small double flick of the
outer ear. The back rises up to one native pixel. The face and paws stay
planted on the rock.

`animations/cat/cat-closeup.gif` shows one loop at 6× nearest-neighbor.
`animations/cat/cat-in-scene.apng` shows six loops at 2× alongside the
fireflies, waterfall, glow and pond shimmer. Run
`python garden/animations/cat/build_cat.py` with Pillow to regenerate
the assets from the native master and the firefly scene preview.
