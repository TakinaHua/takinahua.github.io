"""Build the native shimmer sheet and lossless 2x combined preview with Pillow."""
import sys
from math import cos, pi, sin
from pathlib import Path

from PIL import Image, ImageChops

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from preview import write_preview

MASTER = HERE.parents[1] / "final/garden-final-640x360.png"
ORIGIN = (64, 320)
SIZE = (548, 40)
COUNT = 48
# Crest origin, half-width, peak time (in frames), drift direction.
# Each sits in a gap between the existing reflected objects.
CRESTS = [
    (82, 332, 6, 3, 1), (98, 350, 8, 29, -1),
    (228, 342, 6, 18, 1), (281, 350, 9, 38, -1),
    (308, 333, 7, 10, 1), (326, 345, 6, 30, 1),
    (453, 354, 7, 8, -1), (473, 350, 5, 23, 1),
    (566, 349, 8, 41, -1), (599, 340, 6, 16, 1),
]
# Increasingly bright blue-grey tones sampled from the pond.
TONES = [(60, 71, 108), (67, 86, 125), (87, 106, 140), (99, 128, 146), (115, 144, 175)]


def shimmer(base, frame):
    overlay = Image.new("RGBA", SIZE)
    for x, y, width, peak, direction in CRESTS:
        phase = ((frame - peak + COUNT / 2) % COUNT - COUNT / 2) / 15
        if abs(phase) >= 1:
            continue
        swell = (1 + cos(pi * phase)) / 2
        center = x + direction * round(5 * sin(pi * phase / 2))
        width += 2
        for dx in range(-width, width + 1):
            # Leave a break between the main crest and its trailing glint.
            along = dx * direction
            if along in (2, 3):
                continue
            strength = swell * (1 - (abs(dx) / (width + 1)) ** 1.5)
            if strength < 0.14:
                continue
            px = center + dx
            py = y + int(along > 3)
            rgb = base.getpixel((px, py))
            tone = TONES[min(len(TONES) - 1, int(strength * len(TONES)))]
            if rgb[2] > rgb[1] > rgb[0] and tone[1] > rgb[1]:
                overlay.putpixel((px - ORIGIN[0], py - ORIGIN[1]), (*tone, 255))
    return overlay


def tiles(sheet, size, columns, count):
    w, h = size
    for i in range(count):
        x, y = i % columns * w, i // columns * h
        yield sheet.crop((x, y, x + w, y + h))


def main():
    base = Image.open(MASTER).convert("RGB")
    ripples = [shimmer(base, i) for i in range(COUNT)]
    assert shimmer(base, COUNT).tobytes() == ripples[0].tobytes()
    w, h = SIZE
    sheet = Image.new("RGBA", (8*w, 6*h))
    for i, tile in enumerate(ripples):
        sheet.paste(tile, (i % 8*w, i // 8*h))
    sheet.save(HERE / "pond-shimmer-sheet.png")

    def load(name, size, columns, count):
        return list(tiles(Image.open(HERE.parent / name).convert("RGBA"), size, columns, count))

    falls = load("waterfall/waterfall-sheet.png", (96, 112), 15, 15)
    window = load("glow/window-sheet.png", (82, 77), 8, 48)
    lantern = load("glow/lantern-sheet.png", (60, 140), 8, 48)
    # Render at every source frame boundary throughout their joint cycle.
    end = 52800
    times = sorted(set(range(0, end, 100)) | set(range(0, end, 110)))
    durations = [b-a for a, b in zip(times, times[1:] + [end])]

    def scene(ms):
        i = ms // 100 % COUNT
        art = base.copy()
        art.paste(falls[ms // 110 % 15], (120, 248))
        for tile, origin in [(ripples[i], ORIGIN), (window[i], (90, 84)),
                             (lantern[i], (377, 220))]:
            art.paste(tile, origin, tile)
        return art.resize((1280, 720), Image.Resampling.NEAREST)

    path = HERE / "pond-shimmer-in-scene.apng"
    write_preview(path, times, durations, scene)
    assert ImageChops.difference(scene(0), scene(end)).getbbox() is None


if __name__ == "__main__":
    main()
