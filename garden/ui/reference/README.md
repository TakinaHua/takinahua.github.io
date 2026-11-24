# Garden menu and project tray

These PNGs come from the supplied 1536 × 1024 concept sheet. Use `preview.png` to compare the original composition with an implementation. `assets.json` records each sprite’s width, height and top-left position in the concept sheet, in source pixels. Preserve the aspect ratio and scale a whole control and its children together.

## Menu

The closed trigger is `menu-button.png` (185 × 56), including its folded map and cream Menu lettering. The open panel is `menu-open.png` (313 × 407), including all five illustrations, labels and dividers. Position the paper just beneath the trigger, with their left edges aligned. In the illustration the map slightly overhangs the top-left corner of the paper.

For an exact visual match, display the assembled menu inside a navigation element and position five accessible links over its rows. Give the trigger the accessible name **Menu** and keep its expanded state in sync with the panel. Give each link its page name and a visible keyboard-focus outline. Treat the assembled artwork as decorative when those names are supplied by the controls.

| Link | Separate icon | Illustrated row | Vertical link area on the 407 px panel |
| --- | --- | --- | --- |
| Home | `icon-home.png` · sakura tree | `row-home.png` | 14–93 px |
| Projects | `icon-projects.png` · lit workshop | `row-projects.png` | 94–162 px |
| Experience | `icon-experience.png` · noticeboard | `row-experience.png` | 163–232 px |
| About | `icon-about.png` · blossom journal | `row-about.png` | 233–302 px |
| Contact | `icon-contact.png` · red mailbox | `row-contact.png` | 303–389 px |

For translated or editable labels, use `menu-paper.png` behind the separate transparent icons and live text. The empty paper reconstructs the texture hidden by the original lettering and illustrations. Use the source origins in the manifest minus the paper origin **(426, 125)** to position each icon. Labels begin about 139 px from the paper’s left edge. The illustrated row sprites include their own original parchment and lettering. `folded-map.png` and `menu-rule.png` provide the trigger icon and a divider independently.

## Project tray

| Asset | Size | Use |
| --- | --- | --- |
| `tray-open.png` | 608 × 239 | Exact two-card arrangement, original lettering and upper brass pull |
| `tray-drawer.png` | 641 × 87 | Closed control with the Projects label and its own pull |
| `tray-empty.png` | 608 × 239 | Open case with the floor reconstructed behind the cards |
| `drawer-empty.png` | 641 × 87 | Drawer backing for a live label |
| `card-atlas.png` | 221 × 116 | Framed island chart from the left slot |
| `card-fire-and-ice.png` | 223 × 116 | Framed snowy peaks and lava from the right slot |
| `tray-pull.png` | 103 × 43 | Isolated brass hardware; both assembled pieces already contain a pull |

Keep the drawer centered beneath the open case. In the closed state show only the drawer. For the exact open design, align the two project links over the framed pictures and their captions. In the editable version, place Atlas at **(70, 56)** and Fire and Ice at **(322, 56)** relative to the case; center each live caption beneath its card, around y = 187 px. Keep both brass pulls at their original scale. The reference shows two projects. Use a second pair or paging if the site needs to show additional projects with these same proportions.

The assembled lettering is part of the supplied illustration. The filenames labelled “empty” are reconstructed backgrounds for implementation. This package covers the menu and project tray in the upper half of the reference sheet.
