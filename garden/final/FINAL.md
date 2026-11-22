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
