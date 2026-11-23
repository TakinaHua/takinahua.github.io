# Hover outlines (request for Codex)

When a visitor's cursor is over one of the four clickable places in the garden, the site
fades in a white outline around that object. The site needs one still overlay per place.

## Files

Save four PNGs in this folder, with exactly these names:

| File | Object | Rough area in the master (x, y, w, h) |
| --- | --- | --- |
| `projects.png` | the hut (roof, walls, porch, bookshelf, curtain) | 75, 18, 152, 176 |
| `experience.png` | the small noticeboard stand beside the hut | 229, 89, 74, 92 |
| `about.png` | the closed book lying on the bench (book only, not the bench) | 434, 224, 106, 74 |
| `contact.png` | the red mailbox, including its post | 500, 70, 44, 80 |

## Format

- Each file is the full **640 × 360** canvas, transparent everywhere except the outline,
  lined up pixel for pixel with `final/garden-final-640x360.png`. The site lays it straight
  over the master, so no offsets are needed.
- Native pixel art only: hard edges, no anti-aliasing, no blur filter.
- Single still frame (no sheet). The site handles the fade in and out.

## Look

- A **1 px white outline** (`#ffffff`, full opacity) that traces the object's outer
  silhouette, drawn on the pixels just outside the object so the object itself is untouched.
- Around it, a **faded white glow** about 3–4 px wide, made of solid pixels in stepped
  opacity (for example 55 %, 30 %, 15 %, then nothing), following the same silhouette.
- Trace only the outer edge; leave inner details (windows, shelves, papers) alone.
- Where the object meets something in front of it (the bench under the book, grass at the
  foot of the post), stop the outline at that edge instead of drawing across the other thing.

A side-by-side preview of each outline over the master (3× scale) would help, for example
`hover/preview.png`.
