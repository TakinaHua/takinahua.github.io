# Sakura tree sway animation

**Use `sakura-sway-sheet-clean.png` in the site.** It is `sakura-sway-sheet.png` with 537 blurred in-between colours snapped to the picture's own palette, so edges stay crisp. If you re-run the scripts, snap the colours again (or add that step to `export.py`). The scripts expect `garden.png` (copy `../../final/garden-final-1920x1080.png`) and `native.png` (copy `../../final/garden-final-640x360.png`) next to them.

An animation of the sakura tree in `garden-final-1920x1080.png`, cut from the scene's own pixels. The crown
leans downwind in gusts and settles back, and petals drift down. It loops seamlessly.

## Files
- `sakura-sway-sheet.png`: 72 frames, 12 columns, each 250x214 **native art pixels**. Each frame is
  transparent wherever it matches the static background, so it overlays the original image exactly.
- `sakura-sway.json`: frame size, fps (12), loop, and position.
- `sakura-demo.html`: a working reference that plays the sheet in a `<canvas>` over the background. Put it next to
  `garden-final-1920x1080.png` and the sheet to try it.
- `sakura-sway-in-scene.mp4`, `sakura-sway-closeup.gif`: previews only.
- `animate.py`, `export.py`: the generator (Python 3 with numpy, Pillow and scipy). It needs `garden.png` (the 1920x1080
  scene) and `native.png` (the 640x360 downsample: `im[1::3, 1::3]`). Tune `AMP` (lean strength), the `wind()`
  gust shape, and `NP` (petal count) in animate.py, then run `python3 animate.py && python3 export.py`.

## Placement
The 1920x1080 background is a 3x upscale of 640x360 pixel art. Overlay rectangle:
- native: x 262, y 0, 250 x 214
- at 1920x1080: x 786, y 0, 750 x 642
- as fractions of the scene: left 40.9375%, top 0, width 39.0625%, height 59.444%

Scale with nearest-neighbour (`image-rendering: pixelated`). The overlay does not cover the cat.
