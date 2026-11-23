"""Animate the curled ginger cat on the native garden grid with Pillow."""
import sys
from math import cos, pi
from pathlib import Path

from PIL import Image, ImageChops

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from preview import write_preview

ORIGIN = (309, 171)
SIZE = (51, 40)
COUNT = 88
# Trace the top outline, including its dark rim, across the ginger flank.
BACK_TOP = [16, 14, 13, 12, 11, 10, 10, 9, 9, 8, 8, 7, 7, 7, 7, 7]
# The outer ear folds to the right briefly, then springs back.
EAR = [(36, 7, 37), (35, 8, 37), (34, 9, 37), (33, 10, 37), (33, 11, 36)]


def pose(rest, tick):
    art = rest.copy()
    tick %= COUNT
    phase = tick % 44 / 44
    # Quicker inhale, longer exhale, with a short still point at the bottom.
    breath = (1 - cos(pi * phase / .38)) / 2 if phase < .38 else (
        1 + cos(pi * (phase - .38) / .62)) / 2
    for x, top in enumerate(BACK_TOP, start=5):
        across = max(0, 1 - ((x - 13) / 9) ** 2)
        rise = round(1.2 * breath * across)
        for y in range(top - rise, 23):
            # Stretch the fur markings with the contour, anchoring the folded paw.
            source = top + round((y - top + rise) * (23 - top) / (23 - top + rise))
            art.putpixel((x, y), rest.getpixel((x, source)))
    fold = {56: 1, 57: 2, 58: 2, 59: 1, 62: 1}.get(tick, 0)
    if fold:
        for left, y, right in EAR:
            shift = fold if y < 10 else 1
            for x in range(left, left + shift):
                art.putpixel((x, y), rest.getpixel((left - 1, y)))
            for x in range(left, right + 1):
                art.putpixel((x + shift, y), rest.getpixel((x, y)))
    return art


def main():
    master = Image.open(HERE.parents[1] / "final/garden-final-640x360.png").convert("RGB")
    x, y = ORIGIN
    w, h = SIZE
    rest = master.crop((x, y, x+w, y+h))
    sheet = Image.new("RGBA", (11*w, 8*h))
    poses = [pose(rest, i) for i in range(COUNT)]
    tiles = []
    for i, art in enumerate(poses):
        channels = ImageChops.difference(art, rest).split()
        mask = ImageChops.lighter(ImageChops.lighter(*channels[:2]), channels[2])
        tile = Image.new("RGBA", SIZE)
        tile.paste(art, (0, 0), mask.point(lambda v: 255 if v else 0))
        tiles.append(tile)
        sheet.paste(tile, (i % 11*w, i // 11*h))
    sheet.save(HERE / "cat-sheet.png")
    assert poses[-1].tobytes() == poses[0].tobytes() == rest.tobytes()
    closeups = [art.resize((306, 240), Image.Resampling.NEAREST) for art in poses]
    closeups[0].save(HERE / "cat-closeup.gif", save_all=True, append_images=closeups[1:],
                     duration=100, loop=0, disposal=1)

    with Image.open(HERE.parent / "fireflies/fireflies-in-scene.apng") as garden:
        times, durations = [], []
        elapsed = 0
        for i in range(garden.n_frames):
            garden.seek(i)
            times.append(elapsed)
            duration = int(garden.info["duration"])
            durations.append(duration)
            elapsed += duration
        assert elapsed % (COUNT * 100) == 0
        indices = {ms: i for i, ms in enumerate(times)}
        assert set(range(0, elapsed, 100)).issubset(indices)
        sprites = [tile.resize((2*w, 2*h), Image.Resampling.NEAREST) for tile in tiles]

        def scene(ms):
            garden.seek(indices[ms])
            view = garden.convert("RGB")
            cat = sprites[ms // 100 % COUNT]
            view.paste(cat, (2*x, 2*y), cat)
            return view

        write_preview(HERE / "cat-in-scene.apng", times, durations, scene)


if __name__ == "__main__":
    main()
