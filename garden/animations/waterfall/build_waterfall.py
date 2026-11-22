import numpy as np, random, math
from PIL import Image
src = np.asarray(Image.open("../../final/garden-final-640x360.png")  # run from this folder.convert("RGB")).astype(np.int32)
# region the animation replaces (everything else in the picture stays untouched)
RX0, RY0, RX1, RY1 = 120, 248, 216, 360
SHEET = (151, 184, 269, 299)      # falling water: inner columns and rows that scroll
POOL = (147, 187, 254, 260)       # still pool above the lip
FOAM = (142, 193, 300, 321)       # splash at the base
REFL = (149, 187, 321, 360)       # reflection streak in the pond
CX, CY = 167, 317                 # where the water lands
N, STEP = 15, 2                   # 15 frames; sheet moves 2 px/frame over its 30-row loop
lum = lambda c: c[...,0]*.3 + c[...,1]*.59 + c[...,2]*.11
# colours taken from the waterfall itself
sheet_px = src[SHEET[2]:SHEET[3], SHEET[0]:SHEET[1]].reshape(-1,3)
uniq = np.unique(sheet_px, axis=0); uniq = uniq[np.argsort(lum(uniq))]
LIGHT = uniq[int(len(uniq)*.80)]; MID = uniq[int(len(uniq)*.6)]
def is_pond(c):  # dark blue water, so rings slide under lily pads and stop at rocks
    return c[2] > c[0] + 10 and lum(c) < 85
frames = []
for f in range(N):
    img = src.copy()
    rng = random.Random(f * 7919)
    # 1. falling sheet: every column scrolls down, wrapping, so streaks fall forever
    x0, x1, y0, y1 = SHEET
    # each column starts at its own offset, so darker rows break into streaks instead of a band
    for i, x in enumerate(range(x0, x1)):
        ph = (i * 11) % (y1 - y0)
        img[y0:y1, x] = np.roll(src[y0:y1, x], (f * STEP + ph) % (y1 - y0), axis=0)
    # 2. pool surface: rows drift a pixel back and forth, so glints wander toward the lip
    x0, x1, y0, y1 = POOL
    for y in range(y0, y1):
        sh = round(math.sin(2*math.pi*f/N*2 + y*1.3))
        img[y, x0+1:x1-1] = np.roll(src[y, x0+1:x1-1], sh, axis=0)
    # 3. foam: each bright pixel borrows a nearby pixel's colour, so the splash churns
    x0, x1, y0, y1 = FOAM
    for y in range(y0, y1):
        for x in range(x0, x1):
            if lum(src[y, x]) > 120 or rng.random() < .25:
                dy, dx = rng.randint(-2, 2), rng.randint(-3, 3)
                yy, xx = min(max(y+dy, y0), y1-1), min(max(x+dx, x0), x1-1)
                img[y, x] = src[yy, xx]
    # 4. reflection: each row slides sideways a little, out of step with its neighbours
    x0, x1, y0, y1 = REFL
    for y in range(y0, y1):
        sh = round(1.4 * math.sin(2*math.pi*(f/N*2) + y*0.9))
        img[y, x0:x1] = np.roll(src[y, x0:x1], sh, axis=0)
    # 5. rings: three ripples spread from the landing point, front half only, on pond pixels only
    for k in range(3):
        t = ((f + k*N/3) % N) / N
        rx = 14 + t*34; ry = rx*.3
        col = LIGHT if t < .45 else MID
        for i in range(0, 181, 2):
            a = math.radians(i)
            x = round(CX + rx*math.cos(math.pi - a)); y = round(CY + 2 + ry*math.sin(a))
            if not (RX0 <= x < RX1 and FOAM[3] <= y < RY1): continue
            if t > .65 and (x + y) % 2: continue
            if (x*7 + k) % 6 == 0: continue
            if is_pond(src[y, x]): img[y, x] = col
    frames.append(img[RY0:RY1, RX0:RX1].astype(np.uint8))
sheet = np.concatenate(frames, axis=1)
Image.fromarray(sheet).save("waterfall-sheet.png")
# preview gif of the whole scene at 2x
gif = []
for fr in frames:
    full = src.copy().astype(np.uint8); full[RY0:RY1, RX0:RX1] = fr
    gif.append(Image.fromarray(full).crop((90,220,260,360)).resize((680,560), Image.NEAREST))
gif[0].save("waterfall-preview.gif", save_all=True, append_images=gif[1:], duration=110, loop=0)
print("sheet", sheet.shape, "region", (RX0, RY0, RX1-RX0, RY1-RY0), "frames", N)
