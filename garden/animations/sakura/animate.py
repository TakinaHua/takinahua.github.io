"""Sway the sakura tree from garden.png.

Works on the native 640x360 art (the image is a 3x upscale). The crown is split into clumps
(Voronoi cells around k-means centers on the tree pixels). Each frame every clump is shifted by a
whole number of art pixels: a shared slow breeze that grows with height, plus each clump's own
little flutter. Rendering is backward-mapped, so there are never holes; where a clump moves off
what was behind it, a clean plate (the dark woods extended inward) shows through.

Output: frames of a fixed rectangle, transparent wherever the frame equals the original
background, so they overlay the static image exactly. Loops seamlessly.
"""
import json, math, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
from scipy.cluster.vq import kmeans2

SCALE = 3
FPS, DUR = 12, 6.0
NF = int(FPS * DUR)
# overlay rectangle in native px (covers crown + falling petals' path)
RX0, RY0, RX1, RY1 = 262, 0, 512, 214
Y_FORK, Y_TOP = 122, 6      # crown motion is 0 at the fork and full at the top
AMP = 3.4                   # art px the crown top leans downwind at the strongest gust

src = np.array(Image.open("native.png").convert("RGB")).astype(np.int32)
H, W, _ = src.shape
r, g, b = src[..., 0], src[..., 1], src[..., 2]
yy, xx = np.mgrid[0:H, 0:W]

# ---- tree mask ---------------------------------------------------------------------------
zone = (xx >= 268) & (xx <= 500) & (yy <= 150)
pink = (r > 150) & (r > g + 35) & (b > g) & (b > 95) & zone
lab, k = nd.label(nd.binary_dilation(pink, iterations=1))
sizes = nd.sum(pink, lab, range(1, k + 1))
pink &= lab == (np.argmax(sizes) + 1)
hull = nd.binary_fill_holes(nd.binary_closing(nd.binary_dilation(pink, iterations=1), iterations=4))
red = (r > g + 8) & (r >= b - 25)
hut_wood = (xx < 304) & (yy > 80) & (b < g - 5)       # warm orange wood of the hut, not the mauve crown
tree = hull & (red | pink) & ~hut_wood
lab, k = nd.label(tree)
s = nd.sum(tree, lab, range(1, k + 1))
tree = np.isin(lab, np.nonzero(s >= 3)[0] + 1)

# ---- clean plate: tree pixels replaced by the nearest background pixel -------------------
_, (iy, ix) = nd.distance_transform_edt(tree, return_indices=True)
plate = src[iy, ix].copy()
# soften the streaks a little with a 3x3 mode-ish blur restricted to the filled area
blur = np.stack([nd.uniform_filter(plate[..., c].astype(float), 3) for c in range(3)], -1)
plate[tree] = blur[tree].astype(np.int32)

# ---- clumps ------------------------------------------------------------------------------
pts = np.argwhere(tree).astype(float)                # (y, x)
rng = np.random.default_rng(7)
np.random.seed(7)
cent, _ = kmeans2(pts, 34, minit="++", seed=7)
# Voronoi label for every pixel of the overlay rectangle (output space)
grid = np.stack([yy, xx], -1).reshape(-1, 2).astype(float)
d2 = ((grid[:, None, :] - cent[None, :, :]) ** 2).sum(-1)
cell = d2.argmin(1).reshape(H, W)
hgt = np.clip((Y_FORK - cent[:, 0]) / (Y_FORK - Y_TOP), 0, 1)
# every clump follows the same breeze in the same direction; they differ only a little in how far
# (gain) and how late (lag: higher and outer clumps answer a beat later, like a crown bending)
gain = rng.uniform(0.85, 1.15, len(cent))
lag = 0.25 * hgt + rng.uniform(0, 0.12, len(cent))

def wind(ph):
    # one-directional gusts, 0 = calm .. ~1 = strongest push: a long push, a small second gust, then rest
    w = 0.5 - 0.5 * math.cos(ph) + 0.18 * (0.5 - 0.5 * math.cos(2 * ph - 0.6))
    return w / 1.18

# which pixels may move at all: the crown region, grown a little so uncovered edges get repainted
moving = nd.binary_dilation(tree, iterations=4) & (yy < Y_FORK + 22)

# ---- petals ------------------------------------------------------------------------------
crown_pink = np.argwhere(pink & (yy > 40))
pal = {
    "lite": np.array([255, 214, 222]), "mid": np.array([240, 160, 182]),
    "deep": np.array([196, 110, 140]), "glint": np.array([255, 240, 236]),
}
NP = 16
pet = []
for i in range(NP):
    y0, x0 = crown_pink[rng.integers(len(crown_pink))]
    land = rng.uniform(150, 205)
    pet.append(dict(x0=x0, y0=y0, land=land, off=rng.uniform(), rep=1 + (i % 2),
                    drift=rng.uniform(14, 34), wob=rng.uniform(2, 5), ph=rng.uniform(0, 6.28)))

frames = []
for f in range(NF):
    ph = 2 * math.pi * f / NF
    w = np.array([wind(ph - L) for L in lag])
    dx = np.round(AMP * gain * hgt ** 1.3 * w).astype(int)
    dy = np.round(0.8 * hgt ** 2 * w).astype(int)  # tips dip a pixel on the strongest push
    out = src.copy()
    ys, xs = np.nonzero(moving)
    c = cell[ys, xs]
    sy = np.clip(ys - dy[c], 0, H - 1)
    sx = np.clip(xs - dx[c], 0, W - 1)
    from_tree = tree[sy, sx]
    out[ys, xs] = np.where(from_tree[:, None], src[sy, sx], plate[ys, xs])
    # petals: let go somewhere in the crown, flutter down and to the right, vanish on the grass
    for p in pet:
        u = (f / NF * p["rep"] + p["off"]) % 1.0
        sw = dx[cell[int(p["y0"]), int(p["x0"])]]
        y = p["y0"] + (p["land"] - p["y0"]) * u
        x = p["x0"] + sw + p["drift"] * u + p["wob"] * math.sin(u * 2 * math.pi * 2 + p["ph"])
        if u < 0.06 or u > 0.97:
            continue
        X, Y = int(round(x)), int(round(y))
        flip = math.sin(u * 2 * math.pi * 5 + p["ph"])
        col = pal["lite"] if flip > 0 else pal["deep"]
        out[Y, X] = col
        if abs(flip) > 0.45:
            out[Y, X + (1 if flip > 0 else -1)] = pal["mid"]
        if flip > 0.93:
            out[Y, X] = pal["glint"]
    frames.append(out[RY0:RY1, RX0:RX1].astype(np.uint8))

base = src[RY0:RY1, RX0:RX1].astype(np.uint8)
np.save("frames.npy", np.stack(frames))
print("frames", len(frames), frames[0].shape, "clumps", len(cent))
