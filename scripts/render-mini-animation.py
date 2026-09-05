"""Render matched front views for the Ritlum mini sync animation.

Run with the single-matrix Blender scene. KEEP_LEDS accepts a comma-separated
list of row-major LED object indices. This makes it possible to render two
coherent history states that differ by exactly one completion.
The standard product-shot renderer then supplies the exact same camera and
lighting for both frames.
"""

import os
from pathlib import Path
import runpy

import bpy


sync_state = os.environ.get("SYNC_STATE")
if sync_state is not None:
    state = max(0, min(3, int(sync_state)))
    # TodayScreen columns 6–13, with its current-day column initially open.
    latest_eight = ["11101110", "11101110", "10111110", "01111110", "11110110"]
    completed_rows = set(range(state))
    keep_leds = {
        # Scene-local X is mirrored by the front camera: app column 0 maps to
        # LED index 7, while today's app column 7 maps to physical index 0.
        row * 8 + (7 - column)
        for row, pattern in enumerate(latest_eight)
        for column, value in enumerate(pattern)
        if value == "1" or (column == 7 and row in completed_rows)
    }
else:
    keep_leds = {
        int(value)
        for value in os.environ.get("KEEP_LEDS", "").split(",")
        if value.strip()
    }

# The physical scene has a seven-color demo palette. The Mini sync sequence
# mirrors the five Today habits exactly, so make its first five physical rows
# blue, green, orange, pink, and cyan—the same order used by TodayScreen.
if os.environ.get("APP_PALETTE", "0") == "1":
    source_rows = (0, 1, 3, 4, 5)
    for target_row, source_row in enumerate(source_rows):
        for prefix in ("LED_row", "LED_halo"):
            target = bpy.data.materials.get(f"{prefix}{target_row}")
            source = bpy.data.materials.get(f"{prefix}{source_row}")
            if target and source:
                target.node_tree.nodes["Emission"].inputs["Color"].default_value = (
                    source.node_tree.nodes["Emission"].inputs["Color"].default_value
                )

for obj in bpy.data.objects:
    if obj.name.startswith(("LED_", "HALO_")):
        prefix, _, suffix = obj.name.partition("_")
        obj.hide_render = not suffix.isdigit() or int(suffix) not in keep_leds

design_root = Path(
    os.environ.get("RITLUM_DESIGN_ROOT", "/Users/mhd3v/habit-tracker-design")
)
renderer = design_root / "blender" / "render_product_shots.py"
if not renderer.exists():
    raise FileNotFoundError(f"Ritlum product renderer not found: {renderer}")

runpy.run_path(str(renderer), run_name="__main__")
