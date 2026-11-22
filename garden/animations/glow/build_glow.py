"""Render both light sources on the native grid and export matching sheets and GIF."""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
base = Image.open(HERE / "../../final/garden-final-640x360.png").convert("RGB")
regions = {"window": (90, 84, 82, 77), "lantern": (377, 220, 60, 140)}
phase = 2 * np.pi * np.arange(48) / 48
window = .75*np.sin(phase) + .25*np.sin(2*phase)
lantern = .53*np.sin(2*phase) + .30*np.sin(5*phase) + .17*np.sin(7*phase)
window /= window.max()
lantern /= lantern.max()


def light_frames(name, strength, wave):
    x, y, w, h = regions[name]
    patch = np.array(base.crop((x, y, x+w, y+h)), dtype=float)
    red, green, blue = patch.transpose(2, 0, 1)
    yy, xx = np.mgrid[y:y+h, x:x+w]
    panes = Image.new("L", (w, h))
    draw = ImageDraw.Draw(panes)
    polygons = (
        [[(97,98),(129,108),(129,137),(97,124)],
         [(140,96),(161,94),(161,134),(140,136)]]
        if name == "window" else
        [[(396,240),(414,240),(414,264),(406,266),(396,263)]]
    )
    for polygon in polygons:
        draw.polygon([(px-x, py-y) for px, py in polygon], fill=255)
    lit = (np.asarray(panes)>0) & (red>174) & (green>72) & (green>1.25*blue)
    mask = Image.fromarray(lit.astype("uint8")*255)
    # Soften only the illumination falloff. The underlying art retains its edges.
    spill = np.array(mask.filter(ImageFilter.GaussianBlur(3)), dtype=float)/255
    if name == "lantern":
        spill += .68*np.exp(-((xx-405)/12)**2-((yy-299)/4.2)**2)
    for angle, flicker in zip(phase, wave):
        power = (1+flicker)/2
        delta = strength*flicker*lit[..., None]*np.array([.67, 1, .81])
        delta += strength*.72*power*spill[..., None]*np.array([1, .6, .21])
        if name == "lantern":
            # Follow the existing amber reflection below the stone pier.
            water = (yy >= 338) & (red > 95) & (red > green*1.17) & (green > blue*1.09)
            center = 406 + 2*np.sin(angle + yy*.6)
            streak = np.exp(-((xx-center)/10)**2)
            ripple = .65 + .35*np.sin(yy*1.7 - 2*angle)
            delta += (water*streak*ripple*(12+60*flicker))[..., None]*[1,.76,.34]
        yield np.uint8(np.clip(np.rint(patch+delta),0,255))


patches = {"window": list(light_frames("window",54,window)),
           "lantern": list(light_frames("lantern",82,lantern))}
# Reserve every master color, then learn additional tones from the illuminated pixels.
original = np.unique(np.asarray(base).reshape(-1,3), axis=0)
samples = []
for name, sequence in patches.items():
    x,y,w,h = regions[name]
    static = np.array(base.crop((x,y,x+w,y+h)))
    for patch in sequence:
        samples.append(patch[np.any(patch != static, axis=2)])
pixels = np.concatenate(samples)
swatches = Image.fromarray(pixels.reshape(-1,1,3)).quantize(256-len(original))
palette = Image.new("P",(1,1))
palette.putpalette(original.tobytes()+bytes(swatches.getpalette()[:3*(256-len(original))]))
# Map each distinct RGB exactly once (Pillow's palette lookup uses reduced precision).
colors = np.array(palette.getpalette(),dtype=int).reshape(-1,3)
unique, indices = np.unique(np.asarray(base).reshape(-1,3), axis=0, return_inverse=True)
static_frame = indices.reshape(base.height,base.width).astype("uint8")
frames = [static_frame.copy() for _ in phase]
for name, sequence in patches.items():
    x,y,w,h = regions[name]
    sheet = Image.new("RGBA",(8*w,6*h))
    unique, inverse = np.unique(np.array(sequence).reshape(-1,3),axis=0,return_inverse=True)
    nearest = np.concatenate([((batch[:,None]-colors)**2).sum(axis=2).argmin(axis=1)
                              for batch in np.array_split(unique, max(1,len(unique)//512))])
    for i, patch in enumerate(nearest[inverse].reshape(48,h,w)):
        frames[i][y:y+h,x:x+w] = patch
        rgb = colors[patch].astype("uint8")
        alpha = np.any(rgb != colors[static_frame[y:y+h,x:x+w]],axis=2).astype("uint8")*255
        sheet.paste(Image.fromarray(np.dstack([rgb,alpha])),(i%8*w,i//8*h))
    sheet.save(HERE / (name+"-sheet.png"))
views = []
for frame in frames:
    view = Image.frombytes("P",base.size,frame.tobytes())
    view.putpalette(palette.getpalette())
    views.append(view)
views[0].save(HERE/"glow-preview.gif",save_all=True,append_images=views[1:],
              duration=100,loop=0,optimize=False,disposal=1)
