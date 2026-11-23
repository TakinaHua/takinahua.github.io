# Projects workshop (request for Codex)

Clicking the hut in the garden opens the inside of the workshop as its own full-screen page.

## The chosen picture

Barry chose the painted workshop: `painted/workshop-background.png` (1672 × 941; the site
serves the lighter copy `painted/workshop-1672x941.webp`). It is shown as it is, scaled
smoothly, not converted to the 640 × 360 pixel grid. The animations made for it are already
in `painted/` and listed in `painted/layers.json`; the site lays each APNG over the picture at
its rectangle.

The 640 × 360 workshop set in this folder (`workshop-640x360.png`, `workshop-1920x1080.png`,
the `*-sheet.png` files, `layers.json` and the `hover-*.png` outlines) is no longer used.
`shelf-640x360.png` and `shelf.json` still are (the bookshelf close-up).

## Needed now: hover outlines for the painted picture

One PNG per clickable object, saved in `painted/`, each the full **1672 × 941** canvas,
transparent except a white outline around the object with a soft white glow fading outward,
the same look as the garden's `hover/` outlines at this larger size (an outline about 2–3 px
wide, the glow about 8–10 px). Trace only the outer edge; stop where something stands in
front.

| File | Object | Opens |
| --- | --- | --- |
| `hover-atlas.png` | the map spread on the desk (with its "Atlas" corner) | the Atlas project |
| `hover-fire-and-ice.png` | the left screen with the mountains | the Fire and Ice project |
| `hover-lol-ping.png` | the right screen with the green terminal | the LoL Ping project |
| `hover-shelf.png` | the lower shelf: the row of books and the lucky cat | a close-up of every project |
| `hover-door.png` | the open door on the left, with its ring handle | back to the garden |

The site also uses each outline to decide what is clickable, so the outline must surround the
whole object. Until these exist, each object responds within a rough rectangle with a soft
oval glow.

## Later (optional)

- A shelf close-up in the same painted style as the workshop, replacing the flat
  `shelf-640x360.png`: one book spine per project (Atlas, Fire and Ice, LoL Ping,
  EV Optimization) with room for more, no lettering, and each spine's rectangle in a JSON
  file.
