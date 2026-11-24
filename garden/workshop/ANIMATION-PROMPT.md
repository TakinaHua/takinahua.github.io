# Workshop animations: one element at a time (prompt for Codex)

## How to use it
1. Paste **The shared rules** below into Codex once, then **one** element brief at a time, in
   order (1 to 6). Tell Codex to do only that element and stop.
2. Look at its preview. When it is right, tell Claude ("the petals are done"); Claude checks
   it in the site and blends it in, then you paste the next element.
3. Redo an element as often as needed before moving on. Nothing else changes while you do.

This is how the garden was made (waterfall, sakura, glow, pond, fireflies, cat): each element
on its own, from the picture's own pixels, reviewed in the real scene before the next.

---

## The shared rules (paste once)

> We are animating the painted workshop `garden/workshop/painted/workshop-background.png`
> (1672 × 941). The website shows this picture smoothly scaled to fit the window, usually at
> **50–70 % of its size**, and lays each animation over it at its exact rectangle. Work on one
> element at a time and stop after each one for review.
>
> For every element:
> - **Start from the picture's own pixels** in that element's rectangle and animate them, so
>   the first frame matches the picture exactly and the layer blends in with no seam, halo or
>   colour shift. Use colours sampled from the picture.
> - **Transparent wherever a frame matches the picture.** Only changed pixels are opaque, the
>   same as `animations/sakura/sakura-sway-sheet-clean.png` in the garden.
> - **Visible at 50 % size.** The earlier set (`painted/*.apng`) changed only a few pixels per
>   frame, so on the site it looked still. Every motion must read at half size: moving shapes
>   at least 8–12 px across in the full-size picture, clear contrast against what is behind
>   them, and motion that covers the element's area, not one corner of it.
> - **Calm and looping.** Gentle, cosy motion, no flashing. The last frame must lead back into
>   the first with no jump.
> - **No text** anywhere in the animation.
>
> Deliver, in `garden/workshop/animations/<name>/`:
> - `<name>-sheet.png`: all frames in one transparent sprite sheet, left to right, top to
>   bottom, every frame the same size.
> - `<name>.json`: `{ "x", "y", "width", "height", "frames", "columns", "frameMs" }`, where
>   `x, y, width, height` place the frame in the 1672 × 941 picture.
> - `<name>-in-scene.apng` (or `.gif`): the whole workshop at **50 %** with this element
>   playing, so it can be judged at the size the site shows it.
> - A short section in `garden/workshop/FINAL.md` (create it if missing) in the style of
>   `garden/final/FINAL.md`: the file, position, frame size, frame count, timing, and one
>   line on what moves.
>
> Leave everything else alone: no website code, no other element, no other folder.

---

## 1. Sakura and petals through the window (`petals`)

> Element 1 only. Rectangle: the window view, about **x 1140–1672, y 0–520**. The sakura's
> crown sways gently in gusts (a few pixels at the top, less near the trunk), and **8–12 pink
> petals** drift down across the window, turning as they fall, some passing in front of the
> trunk and the pond. 48 frames at 100 ms (4.8 s loop). Keep the window frame and its bars
> still; petals pass behind the bars.

### Fix 1a: petals in the sky (paste after element 1)

> Redo element 1 (`petals`) only. Pink petals show up in the open night sky of the window
> view, where nothing could have dropped them. In the current sheet, pink pixels sit over sky
> in 44 of the 48 frames, up to about 1,400 per frame, mostly in the top 140 px of the
> rectangle.
> - Each petal must **start inside the sakura's crown** and fall from there: down and a little
>   sideways with the breeze, past the trunk, into the pond area. No petal appears, or
>   drifts, in open sky above the crown or to its right.
> - The crown's sway must stay within **2–3 px of its edge in the picture**. Blossom must not
>   swing out into the sky.
> - Keep everything else as it is: same rectangle (1140, 0, 532 × 520), 48 frames at 100 ms,
>   transparent where a frame matches the picture, petals passing behind the window bars.
> Replace `animations/petals/petals-sheet.png`, `petals.json` and `petals-in-scene.apng`, and
> update the petals section of `garden/workshop/FINAL.md`.

## 2. Pond and waterfall through the window (`pond`)

> Element 2 only. Rectangles: the waterfall at about **x 1535–1640, y 370–450**, and the pond
> at about **x 1300–1672, y 420–520**. The waterfall's water slides down continuously with
> foam churning where it lands; the pond carries slow horizontal shimmer lines and the pink
> reflections of the sakura waver. The lily pads stay still. 48 frames at 100 ms.

## 3. Desk lamp (`lamp`)

> Element 3 only. Rectangle: the lamp and its pool of light, about **x 300–780, y 380–770**
> (the lamp head, the bulb, and the warm light on the wall, the desk and the left of the map).
> The bulb and its light breathe slowly in brightness and warmth (a soft flicker, never a
> strobe); the pool of light on the desk and map grows and shrinks a little with it. Nothing
> in the scene moves position. 48 frames at 100 ms.

## 4. Tea steam (`steam`)

> Element 4 only. Rectangle: above the cherry-blossom mug, about **x 350–480, y 540–680**.
> Two or three soft ribbons of pale steam rise from the mug, curl, and fade out by the top of
> the rectangle; each ribbon about 10–16 px wide in the full picture so it shows at half size.
> 48 frames at 100 ms.

### Fix 4a: steam over the lamplight (paste after element 4)

> Redo element 4 (`steam`) only. The site draws the steam **on top of the lamp animation**
> (`animations/lamp/lamp-sheet.png`), which brightens and dims this whole area. The current
> steam sheet is fully opaque: about 5,000 pixels per frame are solid colours worked out
> against the plain, unlit picture, and about 1,500 of them are plain copies of it. Over the
> lamp they cover its glow, so a dull, steam-shaped patch shows around the wisps when the lamp
> is bright (on average 30–90 colour levels darker than the lit picture there).
> - Make the steam a **see-through layer**: each wisp is pale cream-white with partial alpha
>   (about 15–45 % at its densest, fading to 0 at its edges and as it rises). No pixel may be a
>   copy of the picture behind it; everywhere that is not steam is fully transparent.
> - Then it looks the same over the plain picture and over any lamp frame. Check it by laying
>   it over the lamp sheet's brightest and dimmest frames (the lamp frame's offset for this
>   rectangle is x 50, y 160).
> - Keep everything else: same rectangle (350, 540, 130 × 140), 48 frames at 100 ms, three
>   staggered wisps about 10–16 px wide, visible at half size, frame 0 leading on from frame 47.
> Make `steam-in-scene.apng` with the lamp animation playing under the steam. Replace
> `animations/steam/steam-sheet.png`, `steam.json` and `steam-in-scene.apng`, and update the
> steam section of `garden/workshop/FINAL.md`.

## 5. The mountain screen, Fire and Ice (`fire-and-ice`)

> Element 5 only. Rectangle: the inside of the left monitor's screen, about **x 553–752,
> y 106–240**. This screen stands for the game Fire and Ice: lava glows and pulses on the left
> slope, snow drifts on the icy peaks, and a slow scan line runs down the screen, like an old
> CRT. Keep the monitor's case still. 48 frames at 100 ms.

## 6. The terminal screen, LoL Ping (`lol-ping`)

> Element 6 only. Rectangle: the inside of the right monitor's screen, about **x 855–975,
> y 158–250**. This screen stands for LoL Ping, a small app: green terminal lines type in one
> after another, the block cursor blinks, the lines scroll up by one, and a soft CRT flicker
> runs across. Lines about 4–6 px tall in the full picture, so they read at half size. Keep
> the monitor's case still. 48 frames at 100 ms (or a longer loop if the typing needs it).

---

## Optional, after the six

- **Ivy** (`ivy`): the ivy on the left post (about x 185–345, y 0–570) stirs in a light breeze.
- **Lucky cat** (`cat`): the waving paw on the shelf rocks slowly.

## What happens after each element
Claude adds the sheet to the workshop scene at its rectangle, checks it at desktop and phone
size, makes sure it stops for visitors who turn motion off, and tells you if anything lines up
badly or reads too faint, before you send the next one.
