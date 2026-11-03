"""Hero scene: one idea splits into four service modules, then locks into one system.

Run headless:
  blender -b -P scripts/hero/scene.py -- --target desktop --out /tmp/hero/desktop
  blender -b -P scripts/hero/scene.py -- --target mobile --out /tmp/hero/mobile --frames 1,48

The timeline is 96 frames; the mobile target renders every second frame.
"""
import argparse
import math
import os
import sys

import bpy
from mathutils import Vector

# Site palette (sRGB hex) from src/index.css.
PRIMARY = "#27384F"
SECONDARY = "#DCE6EF"
MUTED = "#9DB2C2"
ACCENT = "#4E6577"

FRAMES = 96
TARGETS = {
    # Subject sits right of the copy in the Arabic layout; English mirrors it in CSS.
    "desktop": {"res": (1920, 1080), "shift": (-0.22, -0.05), "step": 1, "distance": 9.2},
    "mobile": {"res": (720, 1012), "shift": (0.0, -0.17), "step": 2, "distance": 8},
}


def args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument("--target", choices=TARGETS, default="desktop")
    p.add_argument("--out", required=True)
    p.add_argument("--frames", help="Comma-separated timeline frames to render (default: all)")
    p.add_argument("--samples", type=int, default=64)
    p.add_argument("--save", help="Also save the .blend here")
    return p.parse_args(argv)


def linear(hex_color, alpha=1.0):
    def channel(c):
        c = int(c, 16) / 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    h = hex_color.lstrip("#")
    return (channel(h[0:2]), channel(h[2:4]), channel(h[4:6]), alpha)


# ---------- materials ----------

def principled(name, color, metallic=0.0, roughness=0.4, transmission=0.0, emission=None, strength=0.0, coat=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = linear(color)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Transmission Weight"].default_value = transmission
    bsdf.inputs["Coat Weight"].default_value = coat
    if emission:
        bsdf.inputs["Emission Color"].default_value = linear(emission)
        bsdf.inputs["Emission Strength"].default_value = strength
    return mat


def halo_material():
    """Additive glow: radial falloff to zero, so the frame edge stays the page colour."""
    mat = bpy.data.materials.new("Halo")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    coord = nt.nodes.new("ShaderNodeTexCoord")
    grad = nt.nodes.new("ShaderNodeTexGradient")
    grad.gradient_type = "SPHERICAL"
    scale = nt.nodes.new("ShaderNodeMapping")
    scale.inputs["Scale"].default_value = (0.42, 0.42, 0.42)
    nt.links.new(coord.outputs["Object"], scale.inputs[0])
    nt.links.new(scale.outputs[0], grad.inputs[0])
    curve = nt.nodes.new("ShaderNodeMath")
    curve.operation = "POWER"
    curve.inputs[1].default_value = 2.2
    nt.links.new(grad.outputs["Fac"], curve.inputs[0])
    amount = nt.nodes.new("ShaderNodeMath")
    amount.operation = "MULTIPLY"
    amount.inputs[1].default_value = 0.35
    nt.links.new(curve.outputs[0], amount.inputs[0])
    emit = nt.nodes.new("ShaderNodeEmission")
    emit.inputs["Color"].default_value = linear(ACCENT)
    nt.links.new(amount.outputs[0], emit.inputs["Strength"])
    clear = nt.nodes.new("ShaderNodeBsdfTransparent")
    add = nt.nodes.new("ShaderNodeAddShader")
    nt.links.new(clear.outputs[0], add.inputs[0])
    nt.links.new(emit.outputs[0], add.inputs[1])
    nt.links.new(add.outputs[0], out.inputs["Surface"])
    return mat


# ---------- geometry helpers ----------

def assign(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    return obj


def bevel(obj, width=0.02, segments=3):
    mod = obj.modifiers.new("Bevel", "BEVEL")
    mod.width = width
    mod.segments = segments
    mod.limit_method = "ANGLE"
    for poly in obj.data.polygons:
        poly.use_smooth = True
    return obj


def box(name, size, loc, mat, parent, radius=0.02):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(scale=True)
    bevel(obj, radius)
    obj.parent = parent
    return assign(obj, mat)


def cylinder(name, radius, depth, loc, rot, mat, parent, vertices=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    for poly in obj.data.polygons:
        poly.use_smooth = True
    obj.parent = parent
    return assign(obj, mat)


def empty(name, loc=(0, 0, 0)):
    obj = bpy.data.objects.new(name, None)
    obj.location = loc
    bpy.context.collection.objects.link(obj)
    return obj


# ---------- the four modules ----------

def module_digital(m):
    root = empty("AI & Digital")
    box("Screen", (0.95, 0.05, 0.62), (0, 0, 0.05), m["primary"], root, 0.025)
    for i in range(7):
        box(f"Grid V{i}", (0.006, 0.01, 0.54), (-0.42 + i * 0.14, -0.03, 0.05), m["line"], root, 0.002)
    for i in range(5):
        box(f"Grid H{i}", (0.88, 0.01, 0.006), (0, -0.03, -0.19 + i * 0.12), m["line"], root, 0.002)
    for i, (x, z, w) in enumerate(((-0.28, 0.17, 0.22), (-0.14, -0.07, 0.36), (0.14, 0.17, 0.08))):
        box(f"Data {i}", (w, 0.012, 0.09), (x, -0.04, z), m["muted"], root, 0.004)
    box("Bezel", (1.0, 0.03, 0.67), (0, 0.03, 0.05), m["steel"], root, 0.03)
    box("Chip", (0.26, 0.12, 0.26), (0.26, -0.1, -0.12), m["glow"], root, 0.03)
    for i in range(4):
        box(f"Pin {i}", (0.02, 0.05, 0.08), (0.17 + i * 0.06, -0.08, -0.29), m["steel"], root, 0.005)
    return root


def module_events(m):
    root = empty("Events")
    bpy.ops.mesh.primitive_cube_add(size=0.82, location=(0, 0, 0.02))
    truss = bpy.context.active_object
    truss.name = "Truss"
    wire = truss.modifiers.new("Wire", "WIREFRAME")
    wire.thickness = 0.035
    truss.parent = root
    assign(truss, m["steel"])
    box("Floor", (0.9, 0.9, 0.04), (0, 0, -0.41), m["muted"], root, 0.01)
    box("Banner", (0.5, 0.02, 0.36), (0, 0.38, 0.08), m["glow"], root, 0.01)
    box("Counter", (0.36, 0.2, 0.26), (-0.12, -0.12, -0.26), m["light"], root, 0.03)
    return root


def module_brand(m):
    root = empty("Brand")
    bpy.ops.mesh.primitive_torus_add(major_radius=0.27, minor_radius=0.075, location=(-0.16, -0.12, 0.1),
                                     rotation=(math.radians(90), 0, 0), major_segments=64, minor_segments=24)
    ring = bpy.context.active_object
    ring.name = "Mark"
    for poly in ring.data.polygons:
        poly.use_smooth = True
    ring.parent = root
    assign(ring, m["light"])
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.07, location=(0.14, -0.16, 0.34))
    dot = bpy.context.active_object
    dot.name = "Dot"
    bpy.ops.object.shade_smooth()
    dot.parent = root
    assign(dot, m["muted"])
    swatches = [m["primary"], m["accent"], m["muted"], m["light"]]
    for i, mat in enumerate(swatches):
        card = box(f"Swatch {i}", (0.17, 0.015, 0.26), (0.24 + i * 0.07, -0.02 - i * 0.03, -0.12 + i * 0.03), mat, root, 0.01)
        card.rotation_euler = (0, math.radians(-18 + i * 12), 0)
    return root


def module_operations(m):
    root = empty("Operations")
    steps = [(-0.26, 0, -0.2), (0.0, 0, 0.0), (0.26, 0, 0.2)]
    for i, loc in enumerate(steps):
        box(f"Block {i}", (0.24, 0.24, 0.24), loc, m["light"] if i != 1 else m["accent"], root, 0.04)
    cylinder("Flow A", 0.025, 0.36, (-0.13, 0, -0.1), (0, math.radians(45), 0), m["glow"], root)
    cylinder("Flow B", 0.025, 0.36, (0.13, 0, 0.1), (0, math.radians(45), 0), m["glow"], root)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.16, minor_radius=0.03, location=(0.26, -0.13, -0.22),
                                     rotation=(math.radians(90), 0, 0), major_segments=8, minor_segments=8)
    gear = bpy.context.active_object
    gear.name = "Gear"
    gear.parent = root
    assign(gear, m["steel"])
    return root


# ---------- scene ----------

def build(target):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.frame_start, scene.frame_end = 1, FRAMES

    m = {
        "steel": principled("Steel", SECONDARY, metallic=1.0, roughness=0.28),
        "light": principled("Light", SECONDARY, roughness=0.35, coat=0.5),
        "muted": principled("Muted", MUTED, roughness=0.45),
        "accent": principled("Accent", ACCENT, roughness=0.4, coat=0.5),
        "primary": principled("Primary", PRIMARY, roughness=0.4, coat=0.5),
        "glow": principled("Glow", MUTED, emission=SECONDARY, strength=0.9),
        "glass": principled("Glass", "#FFFFFF", roughness=0.04, transmission=1.0),
        "line": principled("Line", MUTED, emission=SECONDARY, strength=2.2),
        "orbit": principled("Orbit", MUTED, emission=MUTED, strength=0.7),
    }

    # The idea: a glass shell with a light inside.
    core = empty("Core")
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=5, radius=0.42)
    shell = bpy.context.active_object
    shell.name = "Core Shell"
    bpy.ops.object.shade_smooth()
    shell.parent = core
    assign(shell, m["glass"])
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.2, segments=48, ring_count=24)
    heart = bpy.context.active_object
    heart.name = "Core Light"
    bpy.ops.object.shade_smooth()
    heart.parent = core
    assign(heart, principled("Heart", MUTED, emission=SECONDARY, strength=0.55))
    bpy.ops.object.light_add(type="POINT", location=(0, 0, 0))
    inner = bpy.context.active_object
    inner.name = "Core Lamp"
    inner.data.energy = 120
    inner.data.color = linear("#DCE6EF")[:3]
    inner.data.shadow_soft_size = 0.2
    inner.visible_camera = False
    inner.parent = core

    modules = [module_digital(m), module_events(m), module_brand(m), module_operations(m)]
    # Spread (frame 43) and docked (frame 96) positions, top-left, top-right, bottom-left, bottom-right.
    spread = [(-1.15, 0.8, 0.85), (1.15, -0.6, 0.75), (-1.05, -0.7, -0.8), (1.1, 0.9, -0.85)]
    spread_rot = [(0.5, 0.6, -0.4), (-0.4, -0.7, 0.3), (0.3, -0.5, 0.6), (-0.6, 0.5, -0.3)]
    docked = [(-0.78, 0, 0.5), (0.78, 0, 0.5), (-0.78, 0, -0.5), (0.78, 0, -0.5)]

    for mod in modules:
        mod.location = (0, 0, 0)
        mod.scale = (0.01, 0.01, 0.01)
        mod.keyframe_insert("location", frame=14)
        mod.keyframe_insert("scale", frame=14)
        mod.keyframe_insert("rotation_euler", frame=14)
    for i, mod in enumerate(modules):
        mod.location = spread[i]
        mod.scale = (1, 1, 1)
        mod.rotation_euler = spread_rot[i]
        for prop in ("location", "scale", "rotation_euler"):
            mod.keyframe_insert(prop, frame=43)
        # Each module turns to face the camera in turn while the camera orbits.
        face = 46 + i * 7
        mod.keyframe_insert("rotation_euler", frame=face)
        mod.rotation_euler = (0, 0, 0)
        mod.keyframe_insert("rotation_euler", frame=face + 9)
        mod.location = Vector(spread[i]) * 0.92
        mod.keyframe_insert("location", frame=76)
        mod.location = docked[i]
        mod.keyframe_insert("location", frame=92)

    # Core breathes, shrinks while the modules leave, settles at the centre of the system.
    # Four thin orbits around the idea: the paths it will take.
    for i in range(4):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.62 + i * 0.07, minor_radius=0.003,
                                         major_segments=128, minor_segments=8)
        orbit = bpy.context.active_object
        orbit.name = f"Orbit {i}"
        orbit.parent = core
        assign(orbit, m["orbit"])
        tilt = (math.radians(70 + i * 9), math.radians(-25 + i * 17), math.radians(i * 40))
        orbit.rotation_euler = tilt
        orbit.keyframe_insert("rotation_euler", frame=1)
        orbit.rotation_euler = (tilt[0], tilt[1] + math.radians(30 - i * 12), tilt[2] + math.radians(45))
        orbit.keyframe_insert("rotation_euler", frame=26)
        for frame, s in ((1, 1.0), (16, 1.0), (27, 1.5)):
            orbit.scale = (s, s, s)
            orbit.keyframe_insert("scale", frame=frame)
        orbit.hide_render = True
        orbit.keyframe_insert("hide_render", frame=28)
        orbit.hide_render = False
        orbit.keyframe_insert("hide_render", frame=27)
    for frame, s in ((1, 1.45), (7, 1.53), (14, 1.45), (43, 0.62), (76, 0.62), (92, 0.72), (96, 0.72)):
        core.scale = (s, s, s)
        core.keyframe_insert("scale", frame=frame)
    for frame, e in ((1, 40), (43, 20), (80, 20), (92, 50)):
        inner.data.energy = e
        inner.data.keyframe_insert("energy", frame=frame)

    # Lit lines from the core to each docked module, drawn in at the end.
    for i, pos in enumerate(docked):
        v = Vector(pos)
        mid = v * 0.5
        line = cylinder(f"Link {i}", 0.012, v.length * 0.7, mid, (0, 0, 0), m["line"], None, 16)
        line.rotation_mode = "QUATERNION"
        line.rotation_quaternion = v.to_track_quat("Z", "Y")
        line.scale = (1, 1, 0.001)
        line.keyframe_insert("scale", frame=84)
        line.scale = (1, 1, 1)
        line.keyframe_insert("scale", frame=93)

    # Camera on a pivot so it can orbit.
    pivot = empty("Camera Pivot")
    bpy.ops.object.camera_add(location=(0, -TARGETS[target]["distance"], 0.7))
    cam = bpy.context.active_object
    cam.parent = pivot
    track = cam.constraints.new("TRACK_TO")
    track.target = pivot
    cam.data.lens = 50
    cam.data.dof.use_dof = True
    cam.data.dof.focus_object = pivot
    cam.data.dof.aperture_fstop = 5.6
    cam.data.shift_x, cam.data.shift_y = TARGETS[target]["shift"]
    scene.camera = cam
    for frame, z in ((1, 0), (43, math.radians(-8)), (76, math.radians(22)), (92, 0), (96, 0)):
        pivot.rotation_euler = (0, 0, z)
        pivot.keyframe_insert("rotation_euler", frame=frame)

    # Lighting: soft key, cool rim, low fill.
    def area(name, loc, energy, size, color):
        bpy.ops.object.light_add(type="AREA", location=loc)
        light = bpy.context.active_object
        light.name = name
        light.data.energy = energy
        light.data.size = size
        light.data.color = linear(color)[:3]
        t = light.constraints.new("TRACK_TO")
        t.target = pivot
        return light

    area("Key", (-4, -5, 4), 260, 4, "#F4F8FB")
    area("Rim", (3, 5, 3), 420, 3, "#9DB2C2")
    area("Fill", (5, -4, -2), 70, 5, "#DCE6EF")

    # Soft halo behind the subject that fades to exactly the page colour at its edge.
    bpy.ops.mesh.primitive_plane_add(size=7, location=(0, 3, 0), rotation=(math.radians(90), 0, 0))
    halo = bpy.context.active_object
    halo.name = "Halo"
    halo.parent = pivot
    assign(halo, halo_material())
    halo.visible_shadow = False

    world = bpy.data.worlds.new("World")
    world.use_nodes = True
    bg = next(n for n in world.node_tree.nodes if n.type == "BACKGROUND")
    bg.inputs[0].default_value = linear(PRIMARY)
    bg.inputs[1].default_value = 1.0
    scene.world = world

    scene.render.engine = "CYCLES"
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.compute_device_type = "METAL"
        # Background kernel specialisation crashes Blender 5.2 on Metal mid-sequence.
        prefs.kernel_optimization_level = "OFF"
        prefs.get_devices()
        for device in prefs.devices:
            device.use = True
        scene.cycles.device = "GPU"
    except Exception as error:  # CPU still renders, only slower.
        print("GPU unavailable:", error)
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 6
    scene.cycles.transmission_bounces = 6
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "None"
    w, h = TARGETS[target]["res"]
    scene.render.resolution_x, scene.render.resolution_y = w, h
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGB"
    return scene


def main():
    a = args()
    scene = build(a.target)
    scene.cycles.samples = a.samples
    if a.save:
        bpy.ops.wm.save_as_mainfile(filepath=a.save)
    step = TARGETS[a.target]["step"]
    frames = [int(f) for f in a.frames.split(",")] if a.frames else list(range(1, FRAMES + 1, step))
    for index, frame in enumerate(frames, start=1):
        scene.render.filepath = f"{a.out}/{frame:03d}.png"
        if os.path.exists(scene.render.filepath):  # resume after an interrupted run
            continue
        scene.frame_set(frame)
        bpy.ops.render.render(write_still=True)
        print(f"rendered {index}/{len(frames)} frame {frame}", flush=True)


main()
