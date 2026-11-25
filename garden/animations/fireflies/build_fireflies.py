"""Build the firefly overlay and its full-garden preview with Pillow."""
import sys
from math import cos, pi, sin, tau
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from preview import write_preview

ORIGIN = (8, 117)
SIZE = (618, 119)
COUNT = 66
# Flight center, horizontal and vertical reach, flash peak, flash half-duration.
FLIGHTS = [
    (26, 148, 8, 4, 2, 18), (68, 197, 10, 5, 39, 21),
    (181, 210, 7, 5, 17, 17), (302, 156, 8, 5, 51, 20),
    (476, 137, 9, 5, 28, 19), (556, 185, 11, 6, 8, 20),
    (608, 220, 8, 6, 47, 17),
]
# The pale core and amber spill are both sampled from the garden palette.
CORE = (252, 239, 162)
HALO = (249, 204, 121)


def fireflies(frame):
    layer = Image.new("RGBA", SIZE)
    for i, (cx, cy, rx, ry, peak, span) in enumerate(FLIGHTS):
        age = (frame - peak + COUNT // 2) % COUNT - COUNT // 2
        if abs(age) >= span:
            continue
        light = ((1 + cos(pi * age / span)) / 2) ** 0.75
        phase = tau * (frame % COUNT) / COUNT + 1.7 * i
        x = cx - ORIGIN[0] + round(rx * sin(phase))
        y = cy - ORIGIN[1] + round(ry * (.7 * cos(phase) + .3 * sin(2 * phase)))
        for dy in range(-3, 4):
            for dx in range(-3, 4):
                radius = dx*dx + dy*dy
                if radius > 10:
                    continue
                if radius == 0 or (dx == (1 if i % 2 else -1) and dy == 0):
                    color, opacity = CORE, 255 * light
                else:
                    color, opacity = HALO, (205 / radius**0.7) * light**1.2
                if round(opacity):
                    layer.putpixel((x + dx, y + dy), (*color, round(opacity)))
    return layer


def main():
    w, h = SIZE
    sheet = Image.new("RGBA", (11*w, 6*h))
    frames = [fireflies(i) for i in range(COUNT)]
    for i, frame in enumerate(frames):
        sheet.paste(frame, (i % 11*w, i // 11*h))
    assert fireflies(COUNT).tobytes() == frames[0].tobytes()
    sheet.save(HERE / "fireflies-sheet.png")

    # The pond preview already contains the waterfall and both light layers at 2x.
    with Image.open(HERE.parent / "pond/pond-shimmer-in-scene.apng") as garden:
        times, durations = [], []
        elapsed = 0
        for i in range(garden.n_frames):
            garden.seek(i)
            times.append(elapsed)
            duration = int(garden.info["duration"])
            durations.append(duration)
            elapsed += duration
        assert elapsed % (COUNT * 100) == 0
        assert set(range(0, elapsed, 100)).issubset(times)
        indices = {ms: i for i, ms in enumerate(times)}
        sprites = [f.resize((2*w, 2*h), Image.Resampling.NEAREST) for f in frames]

        def scene(ms):
            garden.seek(indices[ms])
            view = garden.convert("RGB")
            lights = sprites[ms // 100 % COUNT]
            view.paste(lights, (2*ORIGIN[0], 2*ORIGIN[1]), lights)
            return view

        write_preview(HERE / "fireflies-in-scene.apng", times, durations, scene)


if __name__ == "__main__":
    main()
