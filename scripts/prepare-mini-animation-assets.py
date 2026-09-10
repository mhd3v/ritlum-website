#!/usr/bin/env python3
"""Crop six true Blender states to one stable, pixel-aligned square canvas."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ANIMATION_DIR = ROOT / "assets" / "mini" / "animation"
sources = [
    Image.open(ANIMATION_DIR / f"state-{index}" / "01-front.webp").convert("RGBA")
    for index in range(6)
]
boxes = [image.getchannel("A").getbbox() for image in sources]
if any(box is None for box in boxes):
    raise RuntimeError("A source frame has no visible pixels")

left = min(box[0] for box in boxes)
top = min(box[1] for box in boxes)
right = max(box[2] for box in boxes)
bottom = max(box[3] for box in boxes)
padding = 48
content_width, content_height = right - left, bottom - top
side = max(content_width, content_height) + padding * 2
offset = ((side - content_width) // 2, (side - content_height) // 2)

for index, source in enumerate(sources):
    cropped = source.crop((left, top, right, bottom))
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.alpha_composite(cropped, dest=offset)
    output = ANIMATION_DIR / f"state-{index}" / "front-square.webp"
    canvas.save(output, "WEBP", quality=94, method=6)
    print(f"wrote {output.relative_to(ROOT)} ({side}x{side})")
