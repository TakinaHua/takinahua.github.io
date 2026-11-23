# Menu icons that match the garden (request for Codex)

The top menu is the visitor's key to the garden, so each menu icon should be a tiny copy of
the object in the garden that opens the same page. Today they disagree: the Home icon is a
hut, but in the garden the hut opens Projects; the About icon is a picture frame, but in the
garden About is the teal book on the bench.

## Files

Redraw these five files in place, same names, same size. The site picks them up as they are.

| File | Draw | Taken from the garden |
| --- | --- | --- |
| `projects.png` | the workshop hut (roof, glowing window, bookshelf) | hut, master around (75, 18, 152, 176) |
| `experience.png` | the small noticeboard with its pinned notes and lantern | noticeboard, around (229, 89, 74, 92) |
| `about.png` | the closed teal book with the pink blossom on its cover | book on the bench, around (434, 224, 106, 74) |
| `contact.png` | the red mailbox on its post | mailbox, around (500, 70, 44, 80) |
| `home.png` | a tiny sakura tree (pink crown, brown trunk) | the sakura at the centre |

`home.png` must read as a whole tree, not a single blossom: the logo next to the name
(`sakura.png`) is already a blossom, and the two sit side by side in the menu.

## Format

- **16 × 16** pixels, transparent background, the same as the current files. The site shows
  them at 32 × 32 (exactly 2×), so every pixel must stay crisp: no anti-aliasing, no blur.
- Use colours sampled from `final/garden-final-640x360.png`, so each icon looks like the
  object in the scene.
- Simplify rather than shrink: at 16 px keep the silhouette and one or two telling details
  (the hut's lit window, the mailbox flag, the book's blossom).
- Leave `sakura.png` and the 32 × 32 project icons as they are.

A preview of the five new icons at 4× beside the current ones would help, for example
`icons/menu-preview.png`.
