import os
import math
import numpy as np
from PIL import Image

pdir = r'd:\Projects\FocusCat_Extracted\BotPet\desktop\assets\skins\puppy_parts'
out_dir = r'C:\Users\GOD\.gemini\antigravity-ide\brain\f11096d8-aa34-4fb5-8fec-4fa1d32d07a6'

# Load parts
tail = Image.open(os.path.join(pdir, 'tail.png')).convert('RGBA')
leg_rear_far = Image.open(os.path.join(pdir, 'leg_rear_far.png')).convert('RGBA')
leg_front_far = Image.open(os.path.join(pdir, 'leg_front_far.png')).convert('RGBA')
torso = Image.open(os.path.join(pdir, 'torso.png')).convert('RGBA')
chest = Image.open(os.path.join(pdir, 'chest_ruff.png')).convert('RGBA')
leg_rear_near = Image.open(os.path.join(pdir, 'leg_rear_near.png')).convert('RGBA')
leg_front_near = Image.open(os.path.join(pdir, 'leg_front_near.png')).convert('RGBA')
head = Image.open(os.path.join(pdir, 'head.png')).convert('RGBA')
mouth_open = Image.open(os.path.join(pdir, 'mouth_open.png')).convert('RGBA')
ear_near = Image.open(os.path.join(pdir, 'ear_near.png')).convert('RGBA')
puppy_full_closed = Image.open(os.path.join(pdir, 'puppy_full_closed.png')).convert('RGBA')

# SVG viewBox is 200x150. Let's render at 4x resolution: 800x600 canvas
CANVAS_W, CANVAS_H = 800, 600
SCALE = 4.0

def paste_rotated(canvas, img, target_w, target_h, pivot_world, local_pivot, angle_deg, opacity=1.0):
    w_px = max(1, int(round(target_w * SCALE)))
    h_px = max(1, int(round(target_h * SCALE)))
    resized = img.resize((w_px, h_px), Image.Resampling.LANCZOS)
    
    if opacity < 1.0:
        arr = np.array(resized)
        arr[:, :, 3] = (arr[:, :, 3].astype(float) * opacity).astype(np.uint8)
        resized = Image.fromarray(arr, 'RGBA')
    
    lp_x = local_pivot[0] * SCALE
    lp_y = local_pivot[1] * SCALE
    wp_x = pivot_world[0] * SCALE
    wp_y = pivot_world[1] * SCALE
    
    if abs(angle_deg) > 0.05:
        rot_img = resized.rotate(-angle_deg, resample=Image.Resampling.BICUBIC, expand=True, center=(lp_x, lp_y))
        rw, rh = rot_img.size
        # Top-left of unrotated image relative to world pivot
        # Unrotated top-left was at (wp_x - lp_x, wp_y - lp_y)
        # Center of unrotated was at (wp_x - lp_x + w_px/2, wp_y - lp_y + h_px/2)
        # In expanded image, center remains center
        rad = math.radians(angle_deg)
        # Vector from local pivot to center
        cx_lp = (w_px / 2.0) - lp_x
        cy_lp = (h_px / 2.0) - lp_y
        # Rotated vector
        rcx = cx_lp * math.cos(rad) + cy_lp * math.sin(rad)
        rcy = -cx_lp * math.sin(rad) + cy_lp * math.cos(rad)
        # World center is pivot_world + rotated vector
        wc_x = wp_x + rcx
        wc_y = wp_y + rcy
        dest_x = int(round(wc_x - rw / 2.0))
        dest_y = int(round(wc_y - rh / 2.0))
        canvas.alpha_composite(rot_img, (dest_x, dest_y))
    else:
        dest_x = int(round(wp_x - lp_x))
        dest_y = int(round(wp_y - lp_y))
        canvas.alpha_composite(resized, (dest_x, dest_y))

def render_scene(state='sit', cycle=0.0, is_panting=False):
    canvas = Image.new('RGBA', (CANVAS_W, CANVAS_H), (24, 24, 28, 255))
    
    # Ground shadow
    shadow = Image.new('RGBA', (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    from PIL import ImageDraw
    draw = ImageDraw.Draw(shadow)
    # Shadow cx=102, cy=138, rx=48, ry=5
    sh_x0 = int((102 - 48) * SCALE)
    sh_y0 = int((138 - 5.5) * SCALE)
    sh_x1 = int((102 + 48) * SCALE)
    sh_y1 = int((138 + 5.5) * SCALE)
    draw.ellipse([sh_x0, sh_y0, sh_x1, sh_y1], fill=(15, 10, 5, 80))
    canvas = Image.alpha_composite(canvas, shadow)

    if state == 'sit':
        # Seated/standing pose: render seamless complete dog
        paste_rotated(canvas, puppy_full_closed, 120.41, 120.41,
                      pivot_world=(40.57, 17.80), local_pivot=(0, 0), angle_deg=0)
        
        # Dynamic panting mouth overlay if active
        if is_panting:
            paste_rotated(canvas, mouth_open, 76.87, 58.65,
                          pivot_world=(82.79, 19.26 + 1.2), local_pivot=(0, 0), angle_deg=0)
        return canvas

    # WALK STATE
    walk_speed = 8.0
    beat = cycle * 2
    body_bob = -math.sin(beat) * 1.5 + math.sin(beat * 2 - 0.7) * 0.45
    body_sway = math.sin(cycle) * 1.8
    body_pitch = math.cos(beat - 0.3) * 1.2
    body_rot = body_sway + body_pitch
    
    # 4-beat trot gait kinematics
    p_fn = cycle % (math.pi * 2)
    u_fn = p_fn / (math.pi * 2)
    if u_fn < 0.60:
        s = u_fn / 0.60
        rot_fn = 14.0 - 26.0 * s
        dy_fn = 56.0 * (1.0 - math.cos(math.radians(rot_fn)))
    else:
        w = (u_fn - 0.60) / 0.40
        ease = w * w * (3.0 - 2.0 * w)
        rot_fn = -12.0 + 26.0 * ease
        dy_fn = -math.sin(w * math.pi) * 4.2
        
    p_bn = (cycle + 1.18 * math.pi) % (math.pi * 2)
    u_bn = p_bn / (math.pi * 2)
    if u_bn < 0.58:
        s = u_bn / 0.58
        rot_bn = 11.0 - 30.0 * s
        dy_bn = 52.0 * (1.0 - math.cos(math.radians(rot_bn)))
    else:
        w = (u_bn - 0.58) / 0.42
        ease = w * w * (3.0 - 2.0 * w)
        rot_bn = -19.0 + 30.0 * ease
        dy_bn = -math.sin(w * math.pi) * 5.4
        
    p_ff = (cycle + math.pi) % (math.pi * 2)
    u_ff = p_ff / (math.pi * 2)
    if u_ff < 0.60:
        s = u_ff / 0.60
        rot_ff = 14.0 - 26.0 * s
        dy_ff = 56.0 * (1.0 - math.cos(math.radians(rot_ff)))
    else:
        w = (u_ff - 0.60) / 0.40
        ease = w * w * (3.0 - 2.0 * w)
        rot_ff = -12.0 + 26.0 * ease
        dy_ff = -math.sin(w * math.pi) * 4.2
        
    p_bf = (cycle + 0.18 * math.pi) % (math.pi * 2)
    u_bf = p_bf / (math.pi * 2)
    if u_bf < 0.58:
        s = u_bf / 0.58
        rot_bf = 11.0 - 30.0 * s
        dy_bf = 52.0 * (1.0 - math.cos(math.radians(rot_bf)))
    else:
        w = (u_bf - 0.58) / 0.42
        ease = w * w * (3.0 - 2.0 * w)
        rot_bf = -19.0 + 30.0 * ease
        dy_bf = -math.sin(w * math.pi) * 5.4
        
    tail_rot = -body_sway * 3.2 + body_pitch * 1.2
    head_lag_y = body_bob * 0.82
    head_lag_rot = -body_sway * 0.65 + body_pitch * 0.4

    # 1. FAR LEGS (behind body)
    # Far rear leg
    paste_rotated(canvas, leg_rear_far, 22.17, 46.59,
                  pivot_world=(81.0, 90.0 + body_bob + dy_bf),
                  local_pivot=(11.55, 3.06), angle_deg=rot_bf)
    # Far front leg
    paste_rotated(canvas, leg_front_far, 18.19, 50.05,
                  pivot_world=(130.0, 86.0 + body_bob + dy_ff),
                  local_pivot=(10.0, 1.55), angle_deg=rot_ff)

    # 2. BODY GROUP (Torso, tail, and chest ruff)
    # Tail anchored to rump at (58.49, 64.27) inside body group
    tail_world_x = 58.49
    tail_world_y = 64.27 + body_bob
    paste_rotated(canvas, tail, 24.16, 34.92,
                  pivot_world=(tail_world_x, tail_world_y),
                  local_pivot=(16.46, 26.42), angle_deg=tail_rot + body_rot)

    # Seamless continuous Torso
    torso_world_x = 56.37
    torso_world_y = 60.15 + body_bob
    paste_rotated(canvas, torso, 85.23, 49.12,
                  pivot_world=(torso_world_x, torso_world_y),
                  local_pivot=(0, 0), angle_deg=body_rot)

    # Chest ruff
    chest_world_x = 93.43
    chest_world_y = 52.11 + body_bob
    paste_rotated(canvas, chest, 47.08, 43.09,
                  pivot_world=(chest_world_x, chest_world_y),
                  local_pivot=(0, 0), angle_deg=body_rot)

    # 3. NEAR LEGS (in front of torso!)
    # Near rear leg & haunch
    paste_rotated(canvas, leg_rear_near, 26.42, 61.87,
                  pivot_world=(58.5, 82.2 + body_bob + dy_bn),
                  local_pivot=(13.0, 9.7), angle_deg=rot_bn)
    # Near front leg
    paste_rotated(canvas, leg_front_near, 22.84, 54.17,
                  pivot_world=(109.0, 88.0 + body_bob + dy_fn),
                  local_pivot=(11.61, 2.23), angle_deg=rot_fn)

    # 4. HEAD ASSEMBLY
    head_world_x = 82.79
    head_world_y = 19.26 + head_lag_y
    paste_rotated(canvas, head, 76.87, 58.65,
                  pivot_world=(head_world_x, head_world_y),
                  local_pivot=(0, 0), angle_deg=head_lag_rot)

    return canvas

# Render and save previews
img_sit = render_scene(state='sit')
img_sit.save(os.path.join(out_dir, 'preview_puppy_sit.png'))
print('Saved preview_puppy_sit.png')

img_walk = render_scene(state='walk', cycle=1.2)
img_walk.save(os.path.join(out_dir, 'preview_puppy_walk.png'))
print('Saved preview_puppy_walk.png')

img_pant = render_scene(state='sit', is_panting=True)
img_pant.save(os.path.join(out_dir, 'preview_puppy_pant.png'))
print('Saved preview_puppy_pant.png')
