#!/usr/bin/env python3
"""
build_puppy_parts.py

Extracts, segments, and generates modular parts for the Golden Retriever puppy
from the high-resolution asset created via Imagen / Nanobana.
Saves transparent PNGs for all articulated parts and generates the assembly code.
"""

import os
import sys
import base64
from collections import deque
from PIL import Image, ImageFilter
import numpy as np
from scipy import ndimage

def create_transparent_puppy(src_path):
    print(f"Loading image from: {src_path}")
    img = Image.open(src_path).convert('RGB')
    w, h = img.size
    arr = np.array(img, dtype=np.float32)

    # Detect white/near-white background
    # Colors very close to (255, 255, 255)
    diff_from_white = np.sqrt(
        (255.0 - arr[:, :, 0]) ** 2 +
        (255.0 - arr[:, :, 1]) ** 2 +
        (255.0 - arr[:, :, 2]) ** 2
    )
    is_white = diff_from_white < 28.0

    # Flood fill from outer borders to only remove external background,
    # preserving white highlights inside the eyes and fur
    visited = np.zeros((h, w), dtype=bool)
    q = deque()

    for x in range(w):
        if is_white[0, x]:
            visited[0, x] = True
            q.append((0, x))
        if is_white[h - 1, x]:
            visited[h - 1, x] = True
            q.append((h - 1, x))

    for y in range(h):
        if is_white[y, 0] and not visited[y, 0]:
            visited[y, 0] = True
            q.append((y, 0))
        if is_white[y, w - 1] and not visited[y, w - 1]:
            visited[y, w - 1] = True
            q.append((y, w - 1))

    while q:
        r, c = q.popleft()
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < h and 0 <= nc < w and not visited[nr, nc] and is_white[nr, nc]:
                visited[nr, nc] = True
                q.append((nr, nc))

    # Binary mask: True where dog is
    dog_mask = ~visited

    # Smooth the alpha mask for anti-aliased edges
    alpha_float = dog_mask.astype(np.float32)
    alpha_blurred = ndimage.gaussian_filter(alpha_float, sigma=0.8)
    alpha_uint8 = np.clip(alpha_blurred * 255.0, 0, 255).astype(np.uint8)

    # De-halo: Defringe slight white border by adjusting edge colors
    rgb_arr = np.array(img, dtype=np.uint8)
    rgba_arr = np.dstack([rgb_arr, alpha_uint8])
    rgba_img = Image.fromarray(rgba_arr, 'RGBA')

    return rgba_img, dog_mask

def segment_and_save_parts(rgba_img, dog_mask, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    w, h = rgba_img.size
    arr = np.array(rgba_img)

    # Find tight bounding box of the puppy
    coords = np.argwhere(dog_mask)
    ymin, xmin = coords.min(axis=0)
    ymax, xmax = coords.max(axis=0)
    print(f"Dog bounding box: x=[{xmin}, {xmax}], y=[{ymin}, {ymax}]")

    # Crop to bounding box with small margin
    margin = 12
    crop_box = (
        max(0, xmin - margin),
        max(0, ymin - margin),
        min(w, xmax + margin),
        min(h, ymax + margin)
    )
    cropped_puppy = rgba_img.crop(crop_box)
    full_path = os.path.join(out_dir, "puppy_full.png")
    cropped_puppy.save(full_path, "PNG")
    print(f"Saved complete puppy: {full_path} ({cropped_puppy.size})")

    # Normalized dimension for the parts
    # The cropped puppy is approximately square (~900x900)
    cw, ch = cropped_puppy.size
    scale_x = cw / (xmax - xmin + 2 * margin)
    scale_y = ch / (ymax - ymin + 2 * margin)

    # Function to extract a soft masked region relative to full cropped puppy
    def extract_part(name, poly_mask_fn, sigma=1.2):
        part_arr = np.array(cropped_puppy).copy()
        mask = np.zeros((ch, cw), dtype=np.float32)
        for y in range(ch):
            for x in range(cw):
                w_val = poly_mask_fn(x, y)
                mask[y, x] = max(0.0, min(1.0, w_val))
        
        # Smooth the mask boundary
        if sigma > 0:
            mask = ndimage.gaussian_filter(mask, sigma=sigma)
        part_arr[:, :, 3] = (part_arr[:, :, 3].astype(np.float32) * mask).astype(np.uint8)
        
        # Crop tight around the part
        part_alpha = part_arr[:, :, 3]
        if np.max(part_alpha) > 10:
            pcoords = np.argwhere(part_alpha > 10)
            p_ymin, p_xmin = pcoords.min(axis=0)
            p_ymax, p_xmax = pcoords.max(axis=0)
            p_cropped = Image.fromarray(part_arr).crop((p_xmin, p_ymin, p_xmax + 1, p_ymax + 1))
            part_file = os.path.join(out_dir, f"{name}.png")
            p_cropped.save(part_file, "PNG")
            print(f"Extracted part [{name}]: bbox=({p_xmin}, {p_ymin}, {p_xmax}, {p_ymax}), size={p_cropped.size}")
            return {
                "name": name,
                "file": part_file,
                "bbox": (int(p_xmin), int(p_ymin), int(p_xmax), int(p_ymax)),
                "size": p_cropped.size,
                "rel_x": float(p_xmin) / cw,
                "rel_y": float(p_ymin) / ch,
                "rel_w": float(p_xmax - p_xmin) / cw,
                "rel_h": float(p_ymax - p_ymin) / ch
            }
        return None

    # Define anatomical regions directly on cropped_puppy (ch=907, cw=907):
    # 1. Tail: ONLY the sickle tail (stem and tip) - zero rump pixels below y=388!
    def tail_mask_fn(x, y):
        if arr[y, x, 3] <= 30: return 0.0
        if y < 350 and x < 185: return 1.0
        if 350 <= y <= 388:
            bound_x = 125 + (y - 350) * (53.0 / 38.0)
            if x <= bound_x: return 1.0
        return 0.0
    tail_info = extract_part("tail", tail_mask_fn, sigma=0.8)

    # 2. Torso: complete continuous body from rump to throat and chest
    # Contains the full rump (x >= 34), full spine, full back, and continuous belly down into leg sockets
    def torso_mask_fn(x, y):
        if arr[y, x, 3] <= 30: return 0.0
        # Exclude tail
        if y < 350 and x < 185: return 0.0
        if 350 <= y <= 388:
            bound_x = 125 + (y - 350) * (53.0 / 38.0)
            if x <= bound_x: return 0.0
        # Body extends down into leg sockets (full rump & belly)
        if y <= 660: return 1.0
        if y <= 720: return max(0.0, 1.0 - (y - 660) / 60.0)
        return 0.0
    torso_info = extract_part("torso", torso_mask_fn, sigma=1.2)

    # 3. Near Rear Leg & Haunch:
    # x < 225, y >= 410, with feathered rounded hip cap (y in [410, 450])
    def rear_near_mask_fn(x, y):
        if arr[y, x, 3] <= 30: return 0.0
        if x < 225 and y >= 450: return 1.0
        if x < 225 and y >= 410: return max(0.0, 1.0 - (450 - y) / 40.0)
        return 0.0
    rear_near_info = extract_part("leg_rear_near", rear_near_mask_fn)

    # 4. Far Rear Leg:
    # 220 <= x <= 395, y >= 520, with rounded hip cap
    def rear_far_mask_fn(x, y):
        if arr[y, x, 3] <= 30: return 0.0
        if 220 <= x <= 395 and y >= 560: return 1.0
        if 220 <= x <= 395 and y >= 520: return max(0.0, 1.0 - (560 - y) / 40.0)
        return 0.0
    rear_far_info = extract_part("leg_rear_far", rear_far_mask_fn)

    # 5. Near Front Leg:
    # 430 <= x <= 610, y >= 510, with rounded shoulder cap under chest ruff
    def front_near_mask_fn(x, y):
        if arr[y, x, 3] <= 30: return 0.0
        if 430 <= x <= 610 and y >= 550: return 1.0
        if 430 <= x <= 610 and y >= 510: return max(0.0, 1.0 - (550 - y) / 40.0)
        return 0.0
    front_near_info = extract_part("leg_front_near", front_near_mask_fn)

    # 6. Far Front Leg:
    # 600 <= x <= 770, y >= 500, with rounded shoulder cap
    def front_far_mask_fn(x, y):
        if arr[y, x, 3] <= 30: return 0.0
        if 600 <= x <= 770 and y >= 540: return 1.0
        if 600 <= x <= 770 and y >= 500: return max(0.0, 1.0 - (540 - y) / 40.0)
        return 0.0
    front_far_info = extract_part("leg_front_far", front_far_mask_fn)

    # 7. Head & Face (with natural closed smiling canine mouth)
    head_info = extract_part("head", lambda x, y: 1.0 if (x >= 320 and y <= 450) else 0.0)

    # Generate closed mouth on head.png and extract mouth_open.png
    head_file = os.path.join(out_dir, "head.png")
    head_img = Image.open(head_file).convert("RGBA")
    h_arr = np.array(head_img)
    hh, hw = h_arr.shape[:2]

    # Open cavity and tongue region: y in [250..355], x in [375..520]
    mouth_mask = np.zeros((hh, hw), dtype=bool)
    for my in range(250, 355):
        for mx in range(375, 520):
            if h_arr[my, mx, 3] > 40:
                rgb = h_arr[my, mx, :3]
                is_cavity = (rgb[0] < 120) and (rgb[1] < 70) and (rgb[2] < 70)
                is_tongue = (rgb[0] > 165) and (rgb[1] < 145) and (rgb[2] < 145)
                if is_cavity or is_tongue:
                    mouth_mask[my, mx] = True

    mouth_mask = ndimage.binary_dilation(mouth_mask, iterations=2)
    mouth_arr = np.zeros_like(h_arr)
    mouth_arr[mouth_mask] = h_arr[mouth_mask]
    mouth_img = Image.fromarray(mouth_arr)
    mouth_file = os.path.join(out_dir, "mouth_open.png")
    mouth_img.save(mouth_file, "PNG")
    print(f"Extracted [mouth_open     ]: pixels={np.sum(mouth_mask)}")

    # Build closed mouth on head.png
    closed_arr = h_arr.copy()
    for my in range(hh):
        for mx in range(hw):
            if mouth_mask[my, mx]:
                sy = min(hh - 1, my + 48)
                closed_arr[my, mx] = h_arr[sy, mx]

    blend_mask = ndimage.gaussian_filter(mouth_mask.astype(np.float32), sigma=1.8)
    for c in range(3):
        closed_arr[:, :, c] = np.clip(
            h_arr[:, :, c].astype(np.float32) * (1.0 - blend_mask) + closed_arr[:, :, c].astype(np.float32) * blend_mask,
            0, 255
        ).astype(np.uint8)

    from PIL import ImageDraw
    img_closed = Image.fromarray(closed_arr)
    draw = ImageDraw.Draw(img_closed)
    lip_col = (48, 24, 12, 240)
    lip_soft = (85, 45, 20, 160)
    draw.line([(475, 277), (440, 287), (385, 284)], fill=lip_soft, width=3)
    draw.line([(488, 268), (475, 276)], fill=lip_col, width=2)
    draw.line([(475, 276), (440, 286), (385, 283)], fill=lip_col, width=2)
    draw.arc([380, 278, 392, 288], start=90, end=270, fill=lip_col, width=2)
    img_closed.save(head_file, "PNG")
    print("Updated [head.png] with natural closed canine mouth.")

    # 8. Near Ear: x in [430, 620], y in [40, 340]
    ear_near_info = extract_part("ear_near", lambda x, y: 1.0 if (430 <= x <= 620 and 40 <= y <= 340) else 0.0)

    # 9. Chest Ruff: forward chest fur
    chest_info = extract_part("chest_ruff", lambda x, y: 1.0 if (400 <= x <= 750 and 260 <= y <= 580) else 0.0)

    parts_meta = {
        "tail": tail_info,
        "leg_rear_far": rear_far_info,
        "leg_rear_near": rear_near_info,
        "leg_front_far": front_far_info,
        "leg_front_near": front_near_info,
        "head": head_info,
        "ear_near": ear_near_info,
        "torso": torso_info,
        "chest": chest_info,
        "full_size": cropped_puppy.size
    }

    return cropped_puppy, parts_meta

def main():
    src_asset = r"C:\Users\GOD\.gemini\antigravity-ide\brain\f11096d8-aa34-4fb5-8fec-4fa1d32d07a6\golden_puppy_asset_1789746566832.jpg"
    out_dir = r"d:\Projects\FocusCat_Extracted\BotPet\desktop\assets\skins\puppy_parts"
    full_path = os.path.join(out_dir, "puppy_full.png")

    if os.path.exists(full_path):
        cropped_puppy = Image.open(full_path).convert("RGBA")
        dog_mask = np.array(cropped_puppy)[:, :, 3] > 10
        _, parts_meta = segment_and_save_parts(cropped_puppy, dog_mask, out_dir)
    elif os.path.exists(src_asset):
        rgba_img, dog_mask = create_transparent_puppy(src_asset)
        cropped_puppy, parts_meta = segment_and_save_parts(rgba_img, dog_mask, out_dir)
    else:
        print("Error: No puppy source asset found.")
        sys.exit(1)

    # Save puppy_full.png to desktop/assets/skins/puppy.png
    dest_skin = r"d:\Projects\FocusCat_Extracted\BotPet\desktop\assets\skins\puppy.png"
    cropped_puppy.save(dest_skin, "PNG")
    print(f"Updated primary desktop skin: {dest_skin}")

    # Generate base64 data strings for direct SVG inclusion
    data_uris = {}
    for part_name in ["puppy_full", "tail", "leg_rear_far", "leg_rear_near", "leg_front_far", "leg_front_near", "head", "ear_near", "torso", "chest_ruff", "mouth_open"]:
        pfile = os.path.join(out_dir, f"{part_name}.png")
        if os.path.exists(pfile):
            with open(pfile, "rb") as f:
                b64 = base64.b64encode(f.read()).decode("ascii")
                data_uris[part_name] = f"data:image/png;base64,{b64}"

    # Compute SVG coordinates (viewBox 0 0 200 150)
    scale = 0.133
    ox = 40.5
    oy = 17.8
    coords = {}
    for name, p in parts_meta.items():
        if name == "full_size" or not p:
            continue
        x1, y1, x2, y2 = p["bbox"]
        coords[name] = {
            "x": round(ox + x1 * scale, 2),
            "y": round(oy + y1 * scale, 2),
            "width": round((x2 - x1) * scale, 2),
            "height": round((y2 - y1) * scale, 2)
        }
    coords["puppy_full"] = {
        "x": round(ox, 2),
        "y": round(oy, 2),
        "width": round(cropped_puppy.size[0] * scale, 2),
        "height": round(cropped_puppy.size[1] * scale, 2)
    }

    # Generate a lightweight JS data module
    js_data_path = r"d:\Projects\FocusCat_Extracted\BotPet\js\puppy-data.js"
    with open(js_data_path, "w", encoding="utf-8") as f:
        f.write("// Auto-generated by build_puppy_parts.py\n")
        f.write("if (typeof window !== 'undefined') {\n")
        import json
        f.write("  window.PUPPY_PARTS = " + json.dumps(data_uris, indent=2) + ";\n")
        f.write("  window.PUPPY_COORDS = " + json.dumps(coords, indent=2) + ";\n")
        f.write("}\n")
    print(f"Generated puppy parts data module: {js_data_path}")
    print("Puppy parts build completed successfully!")

if __name__ == "__main__":
    main()
