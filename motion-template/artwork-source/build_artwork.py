"""
Render and export the hero artwork layers (and optionally the brand film).

  python artwork-source/build_artwork.py [--accent "#0f766e"] [--saturation 1.0]
                                         [--theme dark|light] [--layer main|back|front]
                                         [--scale 1.5] [--samples 192] [--film]

--accent re-hues the ribbon's metal, reflections and haze to a brand colour (the warm
gold edge light is kept). Without it you get the demo blue-silver ribbon.
--film also renders the 8 s demo clip and encodes public/media/brand-film.mp4 + poster
(needs ffmpeg on PATH; takes ~10 min on a mid-range GPU).

Set BLENDER to your Blender executable if it is not on PATH or the default Windows path.
Output: public/artwork/<theme>/ribbon-<layer>.webp
"""
import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
RAW = HERE / "renders"

parser = argparse.ArgumentParser()
parser.add_argument("--accent", default="-")
parser.add_argument("--saturation", type=float, default=1.0)
parser.add_argument("--scale", type=float, default=1.5)
parser.add_argument("--samples", type=int, default=192)
parser.add_argument("--theme", choices=["dark", "light"], action="append")
parser.add_argument("--layer", choices=["main", "back", "front"], action="append")
parser.add_argument("--film", action="store_true", help="also render + encode the demo brand film")
args = parser.parse_args()


def find_blender() -> str:
    env = os.environ.get("BLENDER") or shutil.which("blender")
    if env:
        return env
    base = Path(r"C:\Program Files\Blender Foundation")
    found = sorted(base.glob("Blender */blender.exe")) if base.exists() else []
    if found:
        return str(found[-1])
    sys.exit("Blender not found. Install Blender 4.2+ or set BLENDER=<path to blender executable>.")


blender = find_blender()
scene = str(HERE / "ribbon_scene.py")
themes = args.theme or ["dark", "light"]
layers = args.layer or ["back", "main", "front"]
RAW.mkdir(exist_ok=True)

for theme in themes:
    for layer in layers:
        out = RAW / f"{theme}-{layer}.png"
        print(f"render {theme}/{layer}", flush=True)
        subprocess.run(
            [blender, "-b", "--factory-startup", "-P", scene, "--",
             theme, layer, str(out), str(args.scale), str(args.samples), args.accent, str(args.saturation)],
            check=True, stdout=subprocess.DEVNULL,
        )
    subprocess.run(
        [sys.executable, str(HERE / "postprocess.py"), str(RAW), str(ROOT / "public" / "artwork" / theme),
         theme, str(args.scale), args.accent],
        check=True,
    )

if args.film:
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        sys.exit("--film needs ffmpeg on PATH")
    frames = RAW / "film"
    frames.mkdir(exist_ok=True)
    print("render film (192 frames)", flush=True)
    subprocess.run(
        [blender, "-b", "--factory-startup", "-P", scene, "--",
         "dark", "film", str(frames / "f_####"), "1", "16", args.accent, str(args.saturation)],
        check=True, stdout=subprocess.DEVNULL,
    )
    media = ROOT / "public" / "media"
    media.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [ffmpeg, "-y", "-loglevel", "error", "-framerate", "24", "-i", str(frames / "f_%04d.png"),
         "-vf", "fade=t=in:st=0:d=0.6,fade=t=out:st=7.3:d=0.7", "-c:v", "libx264", "-preset", "slow",
         "-pix_fmt", "yuv420p", "-crf", "23", "-movflags", "+faststart", str(media / "brand-film.mp4")],
        check=True,
    )
    from PIL import Image

    Image.open(frames / "f_0060.png").convert("RGB").save(media / "brand-film-poster.webp", "WEBP", quality=82)
    print("wrote", media / "brand-film.mp4")
