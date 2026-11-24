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

### Fix A1: a curvier menu sheet (paste after group A)

> Redo the menu's parchment only. `parchment-panel.png` stretches as a 9-slice, so its edge
> repeats in a short, even pattern and the open menu reads as a neat rectangle. In the concept
> sheet the menu is a **single torn piece of old paper** with a lively outline. Since the menu
> always holds the same five rows, draw it as one picture at its full size instead:
> - `menu-sheet.png`, **136 × 180** at 1× (the site shows it at exactly 2×, 272 × 360).
> - **Shape:** gently curving, slightly uneven sides (they bow in and out by 1–3 px), a wavy
>   torn bottom edge with two or three deeper tears, a softly curled top edge with a little
>   shadow under the curl, and rounded, slightly dog-eared corners. No straight line longer
>   than about 12 px anywhere on the outline.
> - **Paper:** the same cream as `parchment-panel.png`, a darker sepia burn along the whole
>   edge that follows its curves, a few faint stains and fibres inside, light from the top left.
> - **Safe area:** keep **x 10–126, y 14–164** plain enough for text (the five rows and their
>   lines sit there); all the raggedness lives outside it.
> - Transparent outside the paper. No words.
> Keep `parchment-panel.png` as it is (the welcome sign may still use it), and update the
> preview with the new sheet behind the five menu rows.

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

### Fix B1: the tray as an object, like the concept (paste after group B)

> Redo the tray's case only; keep the four `card-*.png` pictures and `card-frame.png`. The
> current `tray-case.png` and `tray-front.png` stretch into a flat strip across the whole
> window, like a toolbar. In the concept sheet the tray is **an object sitting in the scene**,
> with the garden showing on both sides:
> - an **open box seen from slightly above**: a thick dark-navy lacquered back rim with a brass
>   handle on its top centre, side walls that **slant inward** so the box is a little narrower
>   at the bottom than at the top, a recessed dark floor where the pictures lie, and a lower
>   front lip;
> - beneath it, a separate **drawer front**: a long rounded navy bar with its own brass handle
>   on its top edge and the word "Projects" (set by the site) in the middle. When the tray is
>   closed, only this bar shows; when it opens, the box rises above it.
>
> Draw both so they can widen with the number of projects (three slices: a left end, a middle
> that repeats side to side, a right end; all the perspective and corners live in the ends):
>
> | File | Size at 1× | What |
> | --- | --- | --- |
> | `tray-box.png` | about 72 × 92 (ends 28 px, middle 16 px) | The open box. **Back rim** along the top, about 10 px thick, lacquer navy with a bright bevel line and a darker underside; **side walls** in each end piece slanting inward by about 10 px from top to bottom, showing their inner face; **floor** recessed and darker, with a soft shadow under the back rim; **front lip** along the bottom, about 6 px, with a highlight on its top edge. The middle slice is a straight section of rim, floor and lip that repeats seamlessly. **Safe floor area: y 16–82**, and at least 6 px in from where each slanted wall meets the floor, for the pictures and their names. Transparent outside the box. |
> | `tray-drawer.png` | about 56 × 24 (ends 12 px, middle 16 px) | The drawer front: a rounded-end navy lacquer bar, a bright bevel along the top, a dark lip below, the same blues as the box. **Text area: y 6–20**, kept plain for the word "Projects". |
> | `tray-handle-large.png` | about 32 × 12 | The brass handle from the concept: a bar on two posts, a highlight along the bar. It sits on the box's back rim and on the drawer's top edge. Also `tray-handle-large-hover.png`, a little brighter. |
>
> Use the night blues of `final/garden-final-640x360.png` (not black) for the lacquer, and
> the brass of the existing handle. No words. Update `ui.json` with each piece's end widths,
> and the preview with the box (four pictures in it, names beneath) above the drawer, over a
> crop of the garden, matching the concept's proportions.

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
