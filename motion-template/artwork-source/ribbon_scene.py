"""
Procedural hero ribbon for the motion template.

Builds a twisted metallic ribbon (plus a background ribbon and a soft foreground
swoosh) from traced control points and renders one layer at a time with Cycles.

Usage (headless):
  blender -b --factory-startup -P ribbon_scene.py -- <theme> <layer> <out.png> [scale] [samples] [accent] [saturation]

  theme   dark | light
  layer   main | back | front | film (8 s demo clip as numbered frames)
  scale   resolution multiplier of the 1536x754 hero frame (default 1.5)
  accent  optional brand hex (e.g. "#0f766e"): re-hues the cool metal, lights and
          reflections to the brand hue; warm gold edge light is kept. "-" = demo blue.
  saturation  optional multiplier for the metal's saturation (default 1)

The frame maps 1:1 to the reference hero area (1536 x 754 px at scale 1).
Control points below are in those pixel coordinates; depth is in px (+ = farther).
Edit RIBBONS to reshape the artwork for another project.
"""
import bpy
import bmesh
import colorsys
import math
import sys
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
THEME = argv[0] if len(argv) > 0 else "dark"
LAYER = argv[1] if len(argv) > 1 else "main"
OUT = argv[2] if len(argv) > 2 else f"//ribbon-{THEME}-{LAYER}.png"
SCALE = float(argv[3]) if len(argv) > 3 else 1.5
SAMPLES = int(argv[4]) if len(argv) > 4 else 192
ACCENT = argv[5] if len(argv) > 5 and argv[5] not in ("", "-") else None
SATURATION = float(argv[6]) if len(argv) > 6 else 1.0

FRAME_W, FRAME_H = 1536, 754
FILM_FRAMES = 192  # 8 s at 24 fps
DARK = THEME == "dark"

# (x px, y px, depth px, width px, twist deg)
RIBBONS = {
    "main": [
        dict(points=[
            (470, 590, 30, 30, 60),
            (560, 540, 20, 130, 50),
            (680, 480, 0, 190, 40),
            (820, 505, -10, 200, 45),
            (950, 585, -20, 200, 60),
            (1065, 668, -10, 190, 80),
            (1140, 615, 10, 180, 100),
            (1110, 515, 20, 210, 120),
            (995, 430, 0, 230, 130),
            (885, 345, -20, 230, 125),
            (852, 255, -10, 210, 110),
            (905, 160, 10, 200, 95),
            (1005, 108, 30, 190, 75),
            (1130, 145, 40, 190, 60),
            (1225, 240, 30, 200, 50),
            (1350, 318, 10, 200, 45),
            (1500, 330, 0, 200, 40),
            (1660, 300, 0, 190, 40),
        ], alpha=1.0, inner=False),
        # second strand weaving through the S for the layered, folded look
        dict(points=[
            (560, 590, 60, 30, 120),
            (660, 545, 40, 120, 130),
            (800, 560, 30, 150, 120),
            (930, 520, 20, 160, 100),
            (990, 420, -40, 170, 70),
            (930, 300, -40, 170, 50),
            (960, 200, -20, 160, 40),
            (1060, 175, 0, 150, 55),
            (1170, 250, 20, 150, 75),
            (1290, 360, 40, 160, 95),
            (1430, 390, 40, 160, 110),
            (1600, 380, 40, 150, 120),
        ], alpha=0.8, bow=0.3),
    ],
    "back": [
        dict(points=[
            (1150, 430, 260, 30, 60),
            (1270, 390, 260, 80, 20),
            (1390, 270, 260, 96, 0),
            (1470, 150, 260, 96, -20),
            (1560, 60, 260, 90, -40),
            (1640, 0, 260, 80, -50),
        ], alpha=0.85, inner=False),
    ],
    "front": [
        dict(points=[
            (-200, 760, -300, 140, 10),
            (0, 640, -300, 150, 0),
            (200, 600, -300, 150, -5),
            (420, 640, -300, 140, 0),
            (620, 740, -300, 130, 10),
            (780, 860, -300, 120, 20),
        ], alpha=0.75, inner=False),
    ],
}


def _accent_hs():
    h = ACCENT.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    hue, sat, _ = colorsys.rgb_to_hsv(r, g, b)
    return hue, sat


def C(color):
    """Re-hue a cool colour to the brand accent. Warm colours (gold light) pass through."""
    if ACCENT is None and SATURATION == 1.0:
        return color
    r, g, b = color[:3]
    if b < r:  # warm: leave the gold edge light alone
        return color
    peak = max(r, g, b, 1e-6)
    hue, sat, val = colorsys.rgb_to_hsv(r / peak, g / peak, b / peak)
    if ACCENT is not None:
        a_hue, a_sat = _accent_hs()
        hue = a_hue
        if a_sat < 0.08:  # neutral brand colour → near-neutral steel
            sat *= 0.25
    sat = min(1.0, sat * SATURATION)
    nr, ng, nb = colorsys.hsv_to_rgb(hue, sat, val)
    out = (nr * peak, ng * peak, nb * peak)
    return out + tuple(color[3:])


def to_world(px, py, d):
    return Vector(((px - FRAME_W / 2) / 100, d / 100, (FRAME_H / 2 - py) / 100))


def catmull(p0, p1, p2, p3, t):
    t2, t3 = t * t, t * t * t
    return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)


def lerp(a, b, t):
    return a + (b - a) * t


def sample(points, per_seg=48):
    pts = [to_world(p[0], p[1], p[2]) for p in points]
    ext = [pts[0] + (pts[0] - pts[1])] + pts + [pts[-1] + (pts[-1] - pts[-2])]
    out = []
    for i in range(len(pts) - 1):
        for s in range(per_seg):
            t = s / per_seg
            pos = catmull(ext[i], ext[i + 1], ext[i + 2], ext[i + 3], t)
            # smooth interpolation of width / twist
            st = t * t * (3 - 2 * t)
            w = lerp(points[i][3], points[i + 1][3], st) / 100
            tw = math.radians(lerp(points[i][4], points[i + 1][4], st))
            out.append((pos, w, tw))
    last = points[-1]
    out.append((pts[-1], last[3] / 100, math.radians(last[4])))
    return out


def build_ribbon(name, spec, across=10):
    samples = sample(spec["points"])
    n = len(samples)
    view = Vector((0, 1, 0))
    bm = bmesh.new()
    uv_layer = bm.loops.layers.uv.new("UVMap")
    fade_layer = bm.verts.layers.float.new("fade")
    rows = []
    length = 0.0
    lengths = [0.0]
    for i in range(1, n):
        length += (samples[i][0] - samples[i - 1][0]).length
        lengths.append(length)
    for i, (pos, w, tw) in enumerate(samples):
        a = samples[max(i - 1, 0)][0]
        b = samples[min(i + 1, n - 1)][0]
        T = (b - a).normalized()
        B0 = view.cross(T)
        if B0.length < 1e-4:
            B0 = Vector((1, 0, 0))
        B0.normalize()
        N0 = T.cross(B0).normalized()
        W = (B0 * math.cos(tw) + N0 * math.sin(tw)).normalized()
        u = lengths[i] / length
        # taper the very ends
        end = min(u, 1 - u)
        taper = min(1.0, end / 0.06)
        taper = taper * taper * (3 - 2 * taper)
        row = []
        for j in range(across + 1):
            v = j / across
            # slight ruffle: the ribbon is a thin sheet with a gentle bow across its width
            bow = math.sin(v * math.pi) * spec.get("bow", 0.22) * w
            co = pos + W * (v - 0.5) * w * max(taper, 0.05) + N0 * bow
            vert = bm.verts.new(co)
            vert[fade_layer] = taper
            row.append((vert, u, v))
        rows.append(row)
    for i in range(n - 1):
        for j in range(across):
            quad = [rows[i][j], rows[i + 1][j], rows[i + 1][j + 1], rows[i][j + 1]]
            f = bm.faces.new([q[0] for q in quad])
            f.smooth = True
            for loop, q in zip(f.loops, quad):
                loop[uv_layer].uv = (q[1] * length * 0.25, q[2])
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return obj


def node(nt, kind, loc=(0, 0), **inputs):
    n = nt.nodes.new(kind)
    n.location = loc
    for k, v in inputs.items():
        n.inputs[k].default_value = v
    return n


def ribbon_material(name, alpha_scale, edge_scale=1.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = node(nt, "ShaderNodeOutputMaterial", (1400, 0))
    tex = node(nt, "ShaderNodeTexCoord", (-1400, 0))
    sep = node(nt, "ShaderNodeSeparateXYZ", (-1200, 0))
    nt.links.new(tex.outputs["UV"], sep.inputs[0])

    # fine striations running along the ribbon (lines parallel to its length)
    stri = node(nt, "ShaderNodeTexNoise", (-1000, 200), Scale=1.0, Detail=2.0)
    stri_coord = node(nt, "ShaderNodeCombineXYZ", (-1100, 300))
    mul_v = node(nt, "ShaderNodeMath", (-1150, 400))
    mul_v.operation = "MULTIPLY"
    mul_v.inputs[1].default_value = 160.0
    nt.links.new(sep.outputs["Y"], mul_v.inputs[0])
    mul_u = node(nt, "ShaderNodeMath", (-1150, 500))
    mul_u.operation = "MULTIPLY"
    mul_u.inputs[1].default_value = 0.6
    nt.links.new(sep.outputs["X"], mul_u.inputs[0])
    nt.links.new(mul_v.outputs[0], stri_coord.inputs["X"])
    nt.links.new(mul_u.outputs[0], stri_coord.inputs["Y"])
    nt.links.new(stri_coord.outputs[0], stri.inputs["Vector"])
    stri_ramp = node(nt, "ShaderNodeValToRGB", (-800, 200))
    stri_ramp.color_ramp.elements[0].position = 0.35
    stri_ramp.color_ramp.elements[1].position = 0.75
    nt.links.new(stri.outputs["Fac"], stri_ramp.inputs[0])

    base_dark = C((0.02, 0.03, 0.06, 1) if DARK else (0.30, 0.36, 0.50, 1))
    base_light = C((0.50, 0.57, 0.74, 1) if DARK else (0.70, 0.76, 0.88, 1))
    base_mix = node(nt, "ShaderNodeMix", (-500, 200))
    base_mix.data_type = "RGBA"
    base_mix.inputs["A"].default_value = base_dark
    base_mix.inputs["B"].default_value = base_light
    nt.links.new(stri_ramp.outputs["Color"], base_mix.inputs["Factor"])

    rough = node(nt, "ShaderNodeMapRange", (-500, -50))
    rough.inputs["To Min"].default_value = 0.08
    rough.inputs["To Max"].default_value = 0.24
    nt.links.new(stri_ramp.outputs["Color"], rough.inputs["Value"])

    tangent = node(nt, "ShaderNodeTangent", (-500, -250))
    tangent.direction_type = "UV_MAP"
    tangent.uv_map = "UVMap"

    bsdf = node(nt, "ShaderNodeBsdfPrincipled", (-100, 100))
    bsdf.inputs["Metallic"].default_value = 1.0
    bsdf.inputs["Anisotropic"].default_value = 0.5
    bsdf.inputs["Coat Weight"].default_value = 0.35
    bsdf.inputs["Coat Roughness"].default_value = 0.05
    nt.links.new(base_mix.outputs["Result"], bsdf.inputs["Base Color"])
    nt.links.new(rough.outputs["Result"], bsdf.inputs["Roughness"])
    nt.links.new(tangent.outputs["Tangent"], bsdf.inputs["Tangent"])

    # warm glowing edges
    v_min = node(nt, "ShaderNodeMath", (-900, -500))
    v_min.operation = "SUBTRACT"
    v_min.inputs[0].default_value = 1.0
    nt.links.new(sep.outputs["Y"], v_min.inputs[1])
    edge_d = node(nt, "ShaderNodeMath", (-700, -500))
    edge_d.operation = "MINIMUM"
    nt.links.new(sep.outputs["Y"], edge_d.inputs[0])
    nt.links.new(v_min.outputs[0], edge_d.inputs[1])
    edge = node(nt, "ShaderNodeMapRange", (-500, -500))
    edge.inputs["From Min"].default_value = 0.0
    edge.inputs["From Max"].default_value = 0.024
    edge.inputs["To Min"].default_value = 1.0
    edge.inputs["To Max"].default_value = 0.0
    edge.interpolation_type = "SMOOTHERSTEP"
    nt.links.new(edge_d.outputs[0], edge.inputs["Value"])

    # glitter: tiny cells along the surface
    vor = node(nt, "ShaderNodeTexVoronoi", (-900, -800), Scale=55.0)
    nt.links.new(tex.outputs["UV"], vor.inputs["Vector"])
    glit = node(nt, "ShaderNodeMapRange", (-700, -800))
    glit.inputs["From Min"].default_value = 0.0
    glit.inputs["From Max"].default_value = 0.06
    glit.inputs["To Min"].default_value = 1.0
    glit.inputs["To Max"].default_value = 0.0
    nt.links.new(vor.outputs["Distance"], glit.inputs["Value"])
    glit_mask = node(nt, "ShaderNodeTexNoise", (-900, -1000), Scale=1.2, Detail=1.0)
    nt.links.new(tex.outputs["UV"], glit_mask.inputs["Vector"])
    glit_mask_r = node(nt, "ShaderNodeMapRange", (-700, -1000))
    glit_mask_r.inputs["From Min"].default_value = 0.5
    glit_mask_r.inputs["From Max"].default_value = 0.7
    nt.links.new(glit_mask.outputs["Fac"], glit_mask_r.inputs["Value"])
    glit_m = node(nt, "ShaderNodeMath", (-500, -800))
    glit_m.operation = "MULTIPLY"
    nt.links.new(glit.outputs["Result"], glit_m.inputs[0])
    nt.links.new(glit_mask_r.outputs["Result"], glit_m.inputs[1])

    edge_col = (1.0, 0.60, 0.26, 1) if DARK else (0.95, 0.62, 0.28, 1)
    edge_strength = 5.0 if DARK else 2.2
    emit_e = node(nt, "ShaderNodeEmission", (-100, -400))
    # edge light drifts between warm gold and cool silver along the ribbon
    tone = node(nt, "ShaderNodeTexNoise", (-700, -300), Scale=0.9, Detail=0.5)
    tone_c = node(nt, "ShaderNodeCombineXYZ", (-900, -300))
    tone_c.inputs["Y"].default_value = 3.7
    nt.links.new(sep.outputs["X"], tone_c.inputs["X"])
    nt.links.new(tone_c.outputs[0], tone.inputs["Vector"])
    tone_r = node(nt, "ShaderNodeMapRange", (-500, -300))
    tone_r.inputs["From Min"].default_value = 0.47
    tone_r.inputs["From Max"].default_value = 0.62
    nt.links.new(tone.outputs["Fac"], tone_r.inputs["Value"])
    tone_mix = node(nt, "ShaderNodeMix", (-300, -300))
    tone_mix.data_type = "RGBA"
    tone_mix.inputs["A"].default_value = edge_col
    tone_mix.inputs["B"].default_value = C((0.85, 0.9, 1.0, 1) if DARK else (0.35, 0.42, 0.6, 1))
    nt.links.new(tone_r.outputs["Result"], tone_mix.inputs["Factor"])
    nt.links.new(tone_mix.outputs["Result"], emit_e.inputs["Color"])
    e_str = node(nt, "ShaderNodeMath", (-300, -500))
    e_str.operation = "MULTIPLY"
    e_str.inputs[1].default_value = edge_strength * edge_scale
    # light catches the edges intermittently along the length
    edge_var = node(nt, "ShaderNodeTexNoise", (-700, -650), Scale=1.6, Detail=1.0)
    edge_var_c = node(nt, "ShaderNodeCombineXYZ", (-900, -650))
    nt.links.new(sep.outputs["X"], edge_var_c.inputs["X"])
    nt.links.new(edge_var_c.outputs[0], edge_var.inputs["Vector"])
    edge_var_r = node(nt, "ShaderNodeMapRange", (-500, -650))
    edge_var_r.inputs["From Min"].default_value = 0.38
    edge_var_r.inputs["From Max"].default_value = 0.62
    edge_var_r.inputs["To Min"].default_value = 0.08
    nt.links.new(edge_var.outputs["Fac"], edge_var_r.inputs["Value"])
    edge_m = node(nt, "ShaderNodeMath", (-400, -560))
    edge_m.operation = "MULTIPLY"
    nt.links.new(edge.outputs["Result"], edge_m.inputs[0])
    nt.links.new(edge_var_r.outputs["Result"], edge_m.inputs[1])
    nt.links.new(edge_m.outputs[0], e_str.inputs[0])
    nt.links.new(e_str.outputs[0], emit_e.inputs["Strength"])

    emit_g = node(nt, "ShaderNodeEmission", (-100, -700))
    emit_g.inputs["Color"].default_value = (1.0, 0.9, 0.75, 1) if DARK else (0.9, 0.7, 0.4, 1)
    g_str = node(nt, "ShaderNodeMath", (-300, -800))
    g_str.operation = "MULTIPLY"
    g_str.inputs[1].default_value = 14.0 if DARK else 1.0
    nt.links.new(glit_m.outputs[0], g_str.inputs[0])
    nt.links.new(g_str.outputs[0], emit_g.inputs["Strength"])

    add1 = node(nt, "ShaderNodeAddShader", (200, 0))
    nt.links.new(bsdf.outputs[0], add1.inputs[0])
    nt.links.new(emit_e.outputs[0], add1.inputs[1])
    add2 = node(nt, "ShaderNodeAddShader", (400, 0))
    nt.links.new(add1.outputs[0], add2.inputs[0])
    nt.links.new(emit_g.outputs[0], add2.inputs[1])

    # glassy translucency: thinner where seen face-on, denser at grazing angles
    lw = node(nt, "ShaderNodeLayerWeight", (200, 300), Blend=0.35)
    alpha = node(nt, "ShaderNodeMapRange", (400, 300))
    alpha.inputs["To Min"].default_value = 0.96 if DARK else 0.94
    alpha.inputs["To Max"].default_value = 1.0
    nt.links.new(lw.outputs["Facing"], alpha.inputs["Value"])
    fade = node(nt, "ShaderNodeAttribute", (200, 500))
    fade.attribute_name = "fade"
    a2 = node(nt, "ShaderNodeMath", (600, 400))
    a2.operation = "MULTIPLY"
    nt.links.new(alpha.outputs["Result"], a2.inputs[0])
    nt.links.new(fade.outputs["Fac"], a2.inputs[1])
    a3 = node(nt, "ShaderNodeMath", (800, 400))
    a3.operation = "MULTIPLY"
    a3.inputs[1].default_value = alpha_scale
    nt.links.new(a2.outputs[0], a3.inputs[0])

    transp = node(nt, "ShaderNodeBsdfTransparent", (600, 100))
    mix = node(nt, "ShaderNodeMixShader", (1100, 0))
    nt.links.new(a3.outputs[0], mix.inputs["Fac"])
    nt.links.new(transp.outputs[0], mix.inputs[1])
    nt.links.new(add2.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    return mat


def setup_world():
    world = bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    out = node(nt, "ShaderNodeOutputWorld", (800, 0))
    tc = node(nt, "ShaderNodeTexCoord", (-800, 0))
    sep = node(nt, "ShaderNodeSeparateXYZ", (-600, 0))
    nt.links.new(tc.outputs["Generated"], sep.inputs[0])
    ramp = node(nt, "ShaderNodeValToRGB", (-400, 0))
    els = ramp.color_ramp.elements
    if DARK:
        els[0].position, els[0].color = 0.40, C((0.01, 0.012, 0.02, 1))
        els[1].position, els[1].color = 0.92, C((1.1, 1.25, 1.6, 1))
        e = els.new(0.62)
        e.color = C((0.10, 0.13, 0.22, 1))
    else:
        els[0].position, els[0].color = 0.30, C((0.25, 0.28, 0.34, 1))
        els[1].position, els[1].color = 0.95, C((1.0, 1.0, 1.0, 1))
        e = els.new(0.60)
        e.color = C((0.62, 0.66, 0.75, 1))
    nt.links.new(sep.outputs["Z"], ramp.inputs[0])
    bg = node(nt, "ShaderNodeBackground", (0, 0), Strength=2.4 if DARK else 1.2)
    nt.links.new(ramp.outputs["Color"], bg.inputs["Color"])
    # camera never sees the environment, only reflections do
    lp = node(nt, "ShaderNodeLightPath", (0, 300))
    black = node(nt, "ShaderNodeBackground", (0, -200), Strength=0.0)
    mix = node(nt, "ShaderNodeMixShader", (400, 0))
    nt.links.new(lp.outputs["Is Camera Ray"], mix.inputs["Fac"])
    nt.links.new(bg.outputs[0], mix.inputs[1])
    nt.links.new(black.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])


def add_area(name, loc, rot, size, color, energy):
    data = bpy.data.lights.new(name, "AREA")
    data.size = size
    data.color = C(color)
    data.energy = energy
    obj = bpy.data.objects.new(name, data)
    obj.location = loc
    obj.rotation_euler = [math.radians(a) for a in rot]
    bpy.context.collection.objects.link(obj)
    return obj


def add_point(name, loc, color, energy, radius=0.3):
    data = bpy.data.lights.new(name, "POINT")
    data.color = color
    data.energy = energy
    data.shadow_soft_size = radius
    obj = bpy.data.objects.new(name, data)
    obj.location = loc
    bpy.context.collection.objects.link(obj)
    return obj


def main():
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o)
    scene = bpy.context.scene
    try:
        scene.render.engine = "CYCLES"
    except TypeError as e:
        print(e)
    prefs = bpy.context.preferences.addons["cycles"].preferences
    try:
        prefs.compute_device_type = "OPTIX"
        prefs.get_devices()
        for d in prefs.devices:
            d.use = d.type == "OPTIX"
        scene.cycles.device = "GPU"
    except Exception as e:
        print("GPU unavailable, using CPU:", e)
    scene.cycles.samples = SAMPLES
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 8
    scene.cycles.transparent_max_bounces = 16
    scene.render.resolution_x = int(FRAME_W * SCALE)
    scene.render.resolution_y = int(FRAME_H * SCALE)
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.color_depth = "16"
    try:
        scene.view_settings.view_transform = "Standard"
        scene.view_settings.look = "None"
    except TypeError:
        pass

    cam_data = bpy.data.cameras.new("Cam")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = FRAME_W / 100
    cam = bpy.data.objects.new("Cam", cam_data)
    cam.location = (0, -20, 0)
    cam.rotation_euler = (math.radians(90), 0, 0)
    scene.collection.objects.link(cam)
    scene.camera = cam

    setup_world()
    # big soft panels around the subject: the metal reads through what it reflects
    if DARK:
        add_area("Top", (0, -2, 9), (0, 0, 0), 9, (0.86, 0.90, 1.0), 2200)
        add_area("Left", (-11, -3, 1), (0, -90, 0), 10, (0.80, 0.85, 0.96), 1600)
        add_area("Right", (11, -3, 2), (0, 90, 0), 10, (0.85, 0.89, 1.0), 1800)
        add_area("Front", (0, -10, 0), (90, 0, 0), 8, (0.55, 0.62, 0.85), 450)
        add_area("Warm", (-5, -4, -7), (150, 0, -30), 8, (1.0, 0.66, 0.36), 2200)
        add_area("WarmFront", (-3, -7, -2.5), (110, 0, -25), 4, (1.0, 0.62, 0.32), 380)
        add_point("Glow1", to_world(760, 500, -120), (1.0, 0.7, 0.4), 260)
        add_point("Glow2", to_world(1150, 330, -120), (1.0, 0.75, 0.45), 80)
    else:
        add_area("Top", (0, -2, 9), (0, 0, 0), 16, (1.0, 1.0, 1.0), 2600)
        add_area("Left", (-11, -3, 1), (0, -90, 0), 10, (0.92, 0.95, 1.0), 1500)
        add_area("Right", (11, -3, 2), (0, 90, 0), 10, (0.95, 0.97, 1.0), 1700)
        add_area("Front", (0, -10, 0), (90, 0, 0), 8, (0.85, 0.9, 1.0), 700)
        add_area("Warm", (-5, -4, -7), (150, 0, -30), 8, (1.0, 0.78, 0.55), 700)

    film = LAYER == "film"
    if film:
        # demo brand film: all ribbons, slow push-in and drift, opaque background
        scene.render.film_transparent = False
        scene.render.resolution_x, scene.render.resolution_y = 1280, 720
        scene.render.image_settings.color_mode = "RGB"
        scene.render.image_settings.color_depth = "8"
        scene.frame_start, scene.frame_end = 1, FILM_FRAMES
        scene.render.fps = 24
        start, end = to_world(1010, 400, 0), to_world(930, 360, 0)
        cam.location = (start.x, -20, start.z)
        cam_data.ortho_scale = 11.5
        cam.keyframe_insert("location", frame=1)
        cam_data.keyframe_insert("ortho_scale", frame=1)
        cam.location = (end.x, -20, end.z)
        cam_data.ortho_scale = 7.8
        cam.keyframe_insert("location", frame=FILM_FRAMES)
        cam_data.keyframe_insert("ortho_scale", frame=FILM_FRAMES)
        cam.rotation_euler = (math.radians(90), 0, 0)
        cam.keyframe_insert("rotation_euler", frame=1)
        cam.rotation_euler = (math.radians(90), math.radians(-6), 0)
        cam.keyframe_insert("rotation_euler", frame=FILM_FRAMES)
    specs = [s for key in ("back", "main") for s in RIBBONS[key]] if film else RIBBONS[LAYER]
    for i, spec in enumerate(specs):
        obj = build_ribbon(f"{LAYER}_{i}", spec)
        obj.data.materials.append(ribbon_material(f"mat_{LAYER}_{i}", spec["alpha"]))
        if spec.get("inner"):
            # a second, slimmer sheet riding inside the first gives the layered, folded look
            inner = dict(points=[(p[0] + 6, p[1] + 16, p[2] - 8, p[3] * 0.55, p[4] + 18) for p in spec["points"]])
            obj2 = build_ribbon(f"{LAYER}_{i}_inner", inner)
            obj2.data.materials.append(ribbon_material(f"mat_{LAYER}_{i}_inner", spec["alpha"] * 0.6, 0.25))

    scene.render.filepath = OUT
    if film:
        bpy.ops.render.render(animation=True)
    else:
        bpy.ops.render.render(write_still=True)
    print("WROTE", OUT)


main()
