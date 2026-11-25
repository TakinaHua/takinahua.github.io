# Garden redesign: brief for the image tool

## Files in this folder
- `layout-guide.png`: the agreed composition (1920 × 1080). A rough block-out: use it for placement and size only, not for quality.
- `style-reference.png`: the original garden with the signs removed. Use it for style, palette and lighting. A few spots (hut wall, bench back) are smudged; repaint them cleanly.
- `original-with-signs.png`: the untouched original, for reference only.

## How to use it
1. Give the image tool **both** `layout-guide.png` and `style-reference.png`.
2. Paste the prompt below.
3. Ask for **1920 × 1080**. If the tool can't, any 16:9 size works.
4. Save the result in this folder as `garden-wide-v1.png` (keep other attempts as v2, v3…).

## Prompt

> Redraw the first image (layout guide) as a finished pixel-art scene in exactly the style, palette, pixel size and blue-hour lighting of the second image (style reference). Keep every object where the layout guide places it and at the same size:
> - Left: the wooden workshop hut with glowing windows, bookshelf and sakura banner, on a small wooden deck; the wooden noticeboard with pinned notes just to its right.
> - Centre: the large pink sakura tree, with an orange-and-white cat sleeping on a flat rock at its base.
> - A winding stepping-stone path from the hut, past the tree, up to a small red mailbox on a post on the right.
> - Front right: a stone pier with a wooden bench (a teal book lying on it) and an iron lantern glowing warm orange.
> - A mossy stone retaining wall across the middle; a small waterfall falls from the wall into the pond below the hut.
> - Bottom: a calm dark-blue pond with lily pads, floating sakura petals and warm lantern reflections.
> - Back: a dark treeline, and above it a **plain, simple night-blue sky with no clouds, stars or moon** (the sky will be animated separately).
>
> Wide 16:9 composition, 1920 × 1080. **No text, signs, plaques, letters or labels anywhere.** No extra buildings, people or animals. Crisp pixel art, no blur, no smooth gradients, no anti-aliasing.

## If the result drifts
- **Objects moved or resized:** add "match the layout guide's positions exactly".
- **Signs appear anyway:** add "the scene contains absolutely no written text".
- **Looks painterly or blurry:** add "hard-edged pixel art, limited palette, every pixel visible".
- **Sky has clouds:** fine. I can paint them out, but a plain sky saves time.

## What happens after
The result gets snapped to the 384 × 216 grid (1920 ÷ 5) and the shared palette. Then the sky is cut out for the animated sky layer, the waterfall is painted out for the animated waterfall, and small details are cleaned up.
