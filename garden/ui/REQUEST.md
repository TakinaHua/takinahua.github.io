# Pixel UI for the garden: menu, project tray, welcome sign (request for Codex)

The garden and the workshop are painted worlds, but the controls on top of them are still
plain boxes: a wooden "Menu" button that opens a dark list, a dark strip of project tiles at
the bottom, and a flat parchment welcome card. Barry chose a concept sheet where they become
objects from the same world:

- **Menu:** a "Menu" button with a small folded map, opening onto a sheet of torn parchment
  with each page's icon, a line between each row.
- **Project tray:** a dark-blue lacquered wooden case along the bottom with a brass handle,
  holding a small framed picture for each project, the project's name beneath it.
- **Welcome sign:** the first-visit "Hi, I'm Barry." card on the same torn parchment, with a
  small ink arrow on "Got it".

Draw the pieces below. **Draw no words**: every label, title and sentence is live text set by
the site (so it can be read aloud, translated and changed), and the site keeps its own pixel
fonts. Do one group at a time (A, B, C) and stop after each for review.

## Shared rules

- **Pixel art at 1×**, transparent background, hard pixel edges: no anti-aliasing, blur or
  soft shadows. The site shows every piece at exactly 2× (some at 3×), so a pixel must stay a
  crisp square.
- **Colours from the scenes:** sample from `final/garden-final-640x360.png` (night blues,
  blossom pink, lantern gold) and `workshop/painted/workshop-background.png` (warm wood,
  brass, parchment). Light falls from the top left.
- **Stretchable frames are 9-slice:** fixed corners, edges that repeat, a centre that repeats.
  The site stretches them to any size with CSS `border-image`, so:
  - each **edge** must tile seamlessly with itself, side by side, along its length (the torn
    parchment edge too: make its irregular pattern repeat every edge segment);
  - the **centre** must tile seamlessly in both directions;
  - the corners can be as detailed as you like.
  Write each frame's slice sizes (top, right, bottom, left, in pixels at 1×) to
  `garden/ui/ui.json`, for example `{ "parchment-panel": { "slice": [12, 12, 12, 12] } }`.
- **Preview:** `garden/ui/ui-preview.png`, the pieces assembled at 2× over a crop of the
  garden, laid out like the concept sheet, with placeholder text in a plain pixel font so the
  spacing can be judged.

Deliver everything in `garden/ui/`. Leave the scenes, the animations and the website code
alone.

---

## A. Menu

The menu shows on screens narrower than about 1020 px (phones and small laptops). Wider
screens keep the row of names across the top bar.

| File | Size at 1× | What |
| --- | --- | --- |
| `menu-map.png` | 16 × 16 | A small folded paper map, three panels, a green and blue coastline and a dotted route, cream paper, a dark outline. Sits left of the word "Menu" on the button (shown at 32 × 32, the same as the page icons). |
| `parchment-panel.png` | about 48 × 48, 9-slice | The menu's sheet: aged cream parchment with a **torn, slightly ragged edge** all round, a darker sepia rim just inside the tear, a few faint stains in the centre (sparse, so they do not repeat visibly). Centre tile plain enough to sit behind text. Also used for the welcome sign (C), so keep it general. |
| `parchment-divider.png` | about 32 × 3, 3-slice (ends + repeating middle) | A thin hand-inked sepia line that fades at both ends, drawn between menu rows. Give its end widths in `ui.json`. |

The five page icons stay as they are (`icons/home.png`, `projects.png`, `experience.png`,
`about.png`, `contact.png`). The hovered or current row is marked by the site (a pink
underline and a slightly darker parchment), so no extra art for states.

## B. Project tray

The tray runs the full width of the window along the bottom of the garden. It is about 40 px
tall when closed (just its front edge with the handle and the word "Projects") and about
170 px when open (the front edge plus a row of project cards). Visitors open and close it by
the handle.

| File | Size at 1× | What |
| --- | --- | --- |
| `tray-case.png` | about 64 × 48, 9-slice | The open case: dark navy lacquered wood (sample the garden's night blues, not black), a lighter bevelled rim along the top edge, darker sides, and a **recessed floor** in the centre that sits a little in shadow under the rim. It stretches to the full window width, so the edge and centre pieces repeat. |
| `tray-front.png` | about 32 × 20, 3-slice (ends + repeating middle) | The front edge seen when the tray is closed and along the top of the open tray: the same navy lacquer, a bright bevel on top, a dark lip below. |
| `tray-handle.png` | about 24 × 10 | A brass drawer pull (a bar on two posts, a highlight on the bar), sitting on the centre of the front edge. Also draw `tray-handle-hover.png`, the same handle slightly brighter, for hover and keyboard focus. |
| `card-frame.png` | about 24 × 18, 9-slice | A thin frame around each project picture: a warm cream mat with a dark outline and a one-pixel highlight top and left, like a postcard set in the tray. |
| `card-atlas.png` | 64 × 36 | Atlas: the island map from the workshop desk, green islands on blue sea, a red pin and a dotted route. |
| `card-fire-and-ice.png` | 64 × 36 | Fire and Ice: the workshop monitor's picture, the volcano with glowing lava rivers on the left and icy peaks on the right, a sunset sky. |
| `card-lol-ping.png` | 64 × 36 | LoL Ping: the green terminal, prompt marks and typed lines on dark glass, the block cursor. |
| `card-ev-optimization.png` | 64 × 36 | EV Optimization (coming soon): the green battery with a lightning bolt from its icon, plugged into a charging post at dusk, the cable glowing; keep it slightly muted, since the project is not out yet. |

The four pictures must match the 32 × 32 icons in `garden/icons/` (same subjects) and the
objects in the workshop, so a visitor recognises each project wherever it appears.

## C. Welcome sign

The first-visit card ("Hi, I'm Barry." with a short line and a "Got it" button) uses the same
`parchment-panel.png` as the menu, so it needs only one new piece:

| File | Size at 1× | What |
| --- | --- | --- |
| `arrow-right.png` | 5 × 7 | A solid ink-dark triangle pointing right, shown after "Got it" at 2× or 3×. |

If the parchment frame reads too thin at the welcome card's size (about 380 × 180 px on
screen), draw `parchment-panel-large.png` as well: the same parchment with a bigger, more
ragged tear (corners about 16 px at 1×).

---

## What happens after each group

Claude wires the pieces into the site (CSS `border-image` for the frames, the icons and
pictures as images), checks them at desktop and phone size and with keyboard focus, and tells
you if anything reads badly, before you send the next group.
