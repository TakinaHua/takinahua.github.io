"""Build the window and pier lantern loops on the final garden's native grid."""
from pathlib import Path
import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
base = np.array(Image.open(HERE / "../../final/garden-final-640x360.png").convert("RGB"))
palette, indices = np.unique(base.reshape(-1, 3), axis=0, return_inverse=True)
native = indices.reshape(base.shape[:2]).astype("uint8")
gif_palette = palette.tobytes().ljust(768, b'\0')
frames = []
sheets = {}
for i in range(48):
    frame = native.copy()
    phase = 2 * np.pi * i / 48
    for name, (x, y, w, h), wave in [
        ("window", (98, 93, 65, 48), .75*np.sin(phase) + .25*np.sin(2*phase)),
        ("lantern", (393, 237, 24, 32), .53*np.sin(2*phase) + .30*np.sin(5*phase) + .17*np.sin(7*phase)),
    ]:
        colors = base[y:y+h, x:x+w].astype(float)
        red, green, blue = colors.transpose(2, 0, 1)
        lit = (red > 174) & (green > 72) & (green > blue*1.25) & (red > green*1.05)
        yy, xx = np.mgrid[:h, :w]
        if name == "window":
            lit &= ((xx < 31) & (yy >= 3) & (yy < 29+xx*.44)) | ((xx > 40) & (yy < 44))
            strength = 18
        else:
            lit &= (xx >= 3) & (xx <= 21) & (yy >= 3) & (yy <= 27)
            strength = 34
        target = colors[lit] + strength*wave*np.array([.64, 1, .75])
        matches = ((target[:, None] - palette.astype(float))**2).sum(axis=2).argmin(axis=1)
        patch = frame[y:y+h, x:x+w]
        patch[lit] = matches
        overlay = Image.fromarray(np.dstack([palette[patch], 255*(patch != native[y:y+h,x:x+w]).astype("uint8")]))
        if i == 0:
            sheets[name] = Image.new("RGBA", (w*8, h*6))
        sheets[name].paste(overlay, (i%8*w, i//8*h))
    view = Image.frombytes("P",(640,360),frame.tobytes())
    view.putpalette(gif_palette)
    frames.append(view)
for name, sheet in sheets.items():
    sheet.save(HERE / (name + "-sheet.png"))
frames[0].save(HERE / "glow-preview.gif", save_all=True, append_images=frames[1:],
               duration=100, loop=0, optimize=False, disposal=1)
