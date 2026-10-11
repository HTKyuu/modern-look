"""
Post-process raw Blender layer renders into web-ready WebP layers.

  python postprocess.py <render_dir> <out_dir> <theme> [scale] [accent]

Per layer: depth-of-field style blur (back/front), bloom on highlights (main),
then export as RGBA WebP. Requires Pillow + numpy.
"""
import colorsys
import sys
from pathlib import Path

import numpy as np
from PIL import Image

render_dir, out_dir, theme = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3]
scale = float(sys.argv[4]) if len(sys.argv) > 4 else 1.5
accent = sys.argv[5] if len(sys.argv) > 5 and sys.argv[5] not in ("", "-") else None
out_dir.mkdir(parents=True, exist_ok=True)
dark = theme == "dark"

def rehue(rgb):
    """Shift the cool haze tint to the brand hue (keeps its saturation/brightness)."""
    if accent is None:
        return rgb
    h = accent.lstrip("#")
    a_hue, a_sat, _ = colorsys.rgb_to_hsv(*(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)))
    peak = max(rgb)
    _, sat, val = colorsys.rgb_to_hsv(*(c / peak for c in rgb))
    if a_sat < 0.08:
        sat *= 0.25
    return tuple(c * peak for c in colorsys.hsv_to_rgb(a_hue, sat, val))


LAYERS = {
    # name: (blur radius @1x, bloom strength, opacity, tint or None)
    "back": (2.5, 0.35 if dark else 0.0, 0.9, None),
    "main": (0.0, 0.8 if dark else 0.12, 1.0, None),
    # the out-of-focus foreground swoosh reads as cool, dim haze
    "front": (16.0, 0.0, 0.45 if dark else 0.4, rehue((0.52, 0.6, 0.8) if dark else (0.55, 0.62, 0.78))),
}


def _box(a, r, axis):
    if r < 1:
        return a
    pad = [(0, 0)] * a.ndim
    pad[axis] = (r + 1, r)
    c = np.cumsum(np.pad(a, pad, mode="edge"), axis=axis, dtype=np.float64)
    n = a.shape[axis]
    hi = np.take(c, np.arange(2 * r + 1, 2 * r + 1 + n), axis=axis)
    lo = np.take(c, np.arange(0, n), axis=axis)
    return ((hi - lo) / (2 * r + 1)).astype(np.float32)


def gblur(arr, sigma):
    """Gaussian approximation: three box passes per axis (works on HxW or HxWxC)."""
    if sigma <= 0:
        return arr
    r = max(1, int(round((np.sqrt(12 * sigma * sigma / 3 + 1) - 1) / 2)))
    for _ in range(3):
        arr = _box(_box(arr, r, 0), r, 1)
    return arr


def blur_premultiplied(rgba, radius):
    if radius <= 0:
        return rgba
    a = rgba[..., 3:4]
    pm = np.concatenate([rgba[..., :3] * a, a], axis=-1)
    pm = gblur(pm, radius)
    out = pm.copy()
    alpha = np.clip(pm[..., 3:4], 1e-5, 1)
    out[..., :3] = np.where(pm[..., 3:4] > 1e-5, pm[..., :3] / alpha, 0)
    return out


def bloom(rgba, strength, s):
    if strength <= 0:
        return rgba
    a = rgba[..., 3:4]
    pm = rgba[..., :3] * a
    lum = pm @ np.array([0.2126, 0.7152, 0.0722])
    mask = np.clip((lum - 0.55) / 0.45, 0, 1)[..., None]
    hi = pm * mask
    glow = np.zeros_like(pm)
    for r, w in ((4 * s, 0.6), (14 * s, 0.4), (36 * s, 0.35)):
        glow += gblur(hi, r) * w
    glow *= strength
    # composite additively in premultiplied space
    pm2 = pm + glow
    glow_a = np.clip(glow.max(axis=-1, keepdims=True), 0, 1)
    a2 = np.clip(a + glow_a * (1 - a), 0, 1)
    rgb = np.where(a2 > 1e-5, pm2 / np.clip(a2, 1e-5, 1), 0)
    return np.concatenate([np.clip(rgb, 0, 1), a2], axis=-1)


for name, (blur_r, bloom_s, opacity, tint) in LAYERS.items():
    src = render_dir / f"{theme}-{name}.png"
    if not src.exists():
        print("skip", src)
        continue
    rgba = np.asarray(Image.open(src).convert("RGBA")).astype(np.float32) / 255.0
    if tint is not None:
        lum = rgba[..., :3] @ np.array([0.2126, 0.7152, 0.0722])
        rgba[..., :3] = np.clip(lum[..., None] * np.array(tint) * 1.3, 0, 1)
    rgba = blur_premultiplied(rgba, blur_r * scale)
    rgba = bloom(rgba, bloom_s, scale)
    rgba[..., 3] *= opacity
    img = Image.fromarray((np.clip(rgba, 0, 1) * 255 + 0.5).astype(np.uint8), mode="RGBA")
    dst = out_dir / f"ribbon-{name}.webp"
    img.save(dst, "WEBP", quality=86, method=6, alpha_quality=90)
    print("wrote", dst, dst.stat().st_size // 1024, "KB")
