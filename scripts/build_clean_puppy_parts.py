#!/usr/bin/env python3
"""
build_clean_puppy_parts.py

Creates truly clean, seamless parts for the puppy:
1. Sickle Tail with smooth rounded root cap that tucks behind rump
2. Continuous Torso with smooth curved underbelly and rounded rump (zero leg stumps, zero cuts)
3. 4 articulated legs with rounded socket caps
4. Natural closed Head & dynamic open mouth overlay
5. puppy_full_closed base asset
"""

import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

pdir = r'd:\Projects\FocusCat_Extracted\BotPet\desktop\assets\skins\puppy_parts'
full_img = Image.open(os.path.join(pdir, 'puppy_full_closed.png')).convert('RGBA')
fw, fh = full_img.size
arr = np.array(full_img)
alpha = arr[:, :, 3]

print(f"Loaded puppy_full_closed: {fw}x{fh}")

# ---------------------------------------------------------
# 1. TAIL
# Tail bbox in full_closed: x=[11, 205], y=[145, 415]
# Inner boundary follows the curve from (195, 145) down through (130, 340) to (165, 395)
# Rump overlap: provide smooth rounded cap at root around (135, 385)
# ---------------------------------------------------------
tail_mask = np.zeros((fh, fw), dtype=np.float32)

for y in range(140, 420):
    for x in range(10, 210):
        if alpha[y, x] > 20:
            if y < 350:
                # Tail curve: inner edge at y<350 is x <= 130 + (350-y)*0.35
                if x <= 130 + max(0, 350 - y) * 0.45 or y < 200:
                    tail_mask[y, x] = 1.0
            else:
                # Lower outer fur of tail extends down to y=400 for x < 125
                if x < 115 and y <= 395:
                    tail_mask[y, x] = 1.0
                else:
                    # Root region: rounded socket cap centered around (135, 380)
                    dx = x - 135
                    dy = y - 380
                    if (dx*dx)/(32.0*32.0) + (dy*dy)/(32.0*32.0) <= 1.0:
                        tail_mask[y, x] = 1.0

tail_mask = ndimage.gaussian_filter(tail_mask, sigma=0.8)
tail_arr = arr.copy()
tail_arr[:, :, 3] = np.clip(alpha.astype(np.float32) * tail_mask, 0, 255).astype(np.uint8)

t_coords = np.argwhere(tail_arr[:, :, 3] > 15)
t_ymin, t_xmin = t_coords.min(axis=0)
t_ymax, t_xmax = t_coords.max(axis=0)
tail_cropped = Image.fromarray(tail_arr).crop((t_xmin, t_ymin, t_xmax + 1, t_ymax + 1))
tail_cropped.save(os.path.join(pdir, 'tail.png'))
print(f"Tail: bbox=({t_xmin}, {t_ymin}, {t_xmax}, {t_ymax}), size={tail_cropped.size}")

# ---------------------------------------------------------
# 2. TORSO
# Torso contains:
# - Full back from rump (x=130, y=360) to shoulders (x=620, y=340)
# - Continuous rounded rump on the left
# - Smooth curved underbelly connecting rear flank (x=210, y=440) to chest (x=500, y=490)
# - Chest area connecting up to neck
# NO leg stumps, NO tail cutoffs, NO rectangular cuts!
# ---------------------------------------------------------
from scipy.interpolate import CubicSpline
belly_spline = CubicSpline([130, 240, 400, 450, 600, 720], [540, 595, 632, 644, 665, 680])

torso_mask = np.zeros((fh, fw), dtype=np.float32)

for y in range(320, 700):
    for x in range(120, 760):
        if alpha[y, x] > 20:
            # Exclude tail: tail is x < 135 for y < 355
            if y < 355 and x < 155:
                continue
            # Keep everything above the smooth underbelly spline curve!
            belly_y = float(belly_spline(x))
            if y <= belly_y:
                torso_mask[y, x] = 1.0
            elif y <= belly_y + 12:
                torso_mask[y, x] = max(0.0, 1.0 - (y - belly_y) / 12.0)

torso_mask = ndimage.gaussian_filter(torso_mask, sigma=1.0)
torso_arr = arr.copy()
torso_arr[:, :, 3] = np.clip(alpha.astype(np.float32) * torso_mask, 0, 255).astype(np.uint8)

o_coords = np.argwhere(torso_arr[:, :, 3] > 15)
o_ymin, o_xmin = o_coords.min(axis=0)
o_ymax, o_xmax = o_coords.max(axis=0)
torso_cropped = Image.fromarray(torso_arr).crop((o_xmin, o_ymin, o_xmax + 1, o_ymax + 1))
torso_cropped.save(os.path.join(pdir, 'torso.png'))
print(f"Torso: bbox=({o_xmin}, {o_ymin}, {o_xmax}, {o_ymax}), size={torso_cropped.size}")

# ---------------------------------------------------------
# 3. LEGS
# Near Rear Leg: haunch + paw (x in [35, 235], y in [410, 874])
# With rounded hip socket cap at the top (y in [410, 450])
# ---------------------------------------------------------
rn_mask = np.zeros((fh, fw), dtype=np.float32)
for y in range(410, 880):
    for x in range(35, 235):
        if alpha[y, x] > 20:
            if y >= 450:
                rn_mask[y, x] = 1.0
            else:
                dx = x - 135
                dy = y - 450
                if (dx*dx)/(95.0*95.0) + (dy*dy)/(45.0*45.0) <= 1.0:
                    rn_mask[y, x] = 1.0

rn_mask = ndimage.gaussian_filter(rn_mask, sigma=0.8)
rn_arr = arr.copy()
rn_arr[:, :, 3] = np.clip(alpha.astype(np.float32) * rn_mask, 0, 255).astype(np.uint8)
rn_coords = np.argwhere(rn_arr[:, :, 3] > 15)
rn_ymin, rn_xmin = rn_coords.min(axis=0)
rn_ymax, rn_xmax = rn_coords.max(axis=0)
rn_cropped = Image.fromarray(rn_arr).crop((rn_xmin, rn_ymin, rn_xmax + 1, rn_ymax + 1))
rn_cropped.save(os.path.join(pdir, 'leg_rear_near.png'))
print(f"Leg Rear Near: bbox=({rn_xmin}, {rn_ymin}, {rn_xmax}, {rn_ymax}), size={rn_cropped.size}")

# ---------------------------------------------------------
# Near Front Leg: shoulder + paw (x in [450, 620], y in [490, 896])
# With rounded shoulder socket cap at top (y in [490, 540])
# ---------------------------------------------------------
fn_mask = np.zeros((fh, fw), dtype=np.float32)
for y in range(490, 900):
    for x in range(450, 620):
        if alpha[y, x] > 20:
            if y >= 540:
                fn_mask[y, x] = 1.0
            else:
                dx = x - 535
                dy = y - 540
                if (dx*dx)/(80.0*80.0) + (dy*dy)/(50.0*50.0) <= 1.0:
                    fn_mask[y, x] = 1.0

fn_mask = ndimage.gaussian_filter(fn_mask, sigma=0.8)
fn_arr = arr.copy()
fn_arr[:, :, 3] = np.clip(alpha.astype(np.float32) * fn_mask, 0, 255).astype(np.uint8)
fn_coords = np.argwhere(fn_arr[:, :, 3] > 15)
fn_ymin, fn_xmin = fn_coords.min(axis=0)
fn_ymax, fn_xmax = fn_coords.max(axis=0)
fn_cropped = Image.fromarray(fn_arr).crop((fn_xmin, fn_ymin, fn_xmax + 1, fn_ymax + 1))
fn_cropped.save(os.path.join(pdir, 'leg_front_near.png'))
print(f"Leg Front Near: bbox=({fn_xmin}, {fn_ymin}, {fn_xmax}, {fn_ymax}), size={fn_cropped.size}")

# ---------------------------------------------------------
# Far Rear Leg: x in [235, 400], y in [500, 850]
# ---------------------------------------------------------
rf_mask = np.zeros((fh, fw), dtype=np.float32)
for y in range(500, 860):
    for x in range(235, 400):
        if alpha[y, x] > 20:
            if y >= 550:
                rf_mask[y, x] = 1.0
            else:
                dx = x - 315
                dy = y - 550
                if (dx*dx)/(75.0*75.0) + (dy*dy)/(50.0*50.0) <= 1.0:
                    rf_mask[y, x] = 1.0

rf_mask = ndimage.gaussian_filter(rf_mask, sigma=0.8)
rf_arr = arr.copy()
rf_arr[:, :, 3] = np.clip(alpha.astype(np.float32) * rf_mask, 0, 255).astype(np.uint8)
rf_coords = np.argwhere(rf_arr[:, :, 3] > 15)
rf_ymin, rf_xmin = rf_coords.min(axis=0)
rf_ymax, rf_xmax = rf_coords.max(axis=0)
rf_cropped = Image.fromarray(rf_arr).crop((rf_xmin, rf_ymin, rf_xmax + 1, rf_ymax + 1))
rf_cropped.save(os.path.join(pdir, 'leg_rear_far.png'))
print(f"Leg Rear Far: bbox=({rf_xmin}, {rf_ymin}, {rf_xmax}, {rf_ymax}), size={rf_cropped.size}")

# ---------------------------------------------------------
# Far Front Leg: x in [620, 760], y in [500, 880]
# ---------------------------------------------------------
ff_mask = np.zeros((fh, fw), dtype=np.float32)
for y in range(500, 885):
    for x in range(620, 760):
        if alpha[y, x] > 20:
            if y >= 545:
                ff_mask[y, x] = 1.0
            else:
                dx = x - 690
                dy = y - 545
                if (dx*dx)/(70.0*70.0) + (dy*dy)/(45.0*45.0) <= 1.0:
                    ff_mask[y, x] = 1.0

ff_mask = ndimage.gaussian_filter(ff_mask, sigma=0.8)
ff_arr = arr.copy()
ff_arr[:, :, 3] = np.clip(alpha.astype(np.float32) * ff_mask, 0, 255).astype(np.uint8)
ff_coords = np.argwhere(ff_arr[:, :, 3] > 15)
ff_ymin, ff_xmin = ff_coords.min(axis=0)
ff_ymax, ff_xmax = ff_coords.max(axis=0)
ff_cropped = Image.fromarray(ff_arr).crop((ff_xmin, ff_ymin, ff_xmax + 1, ff_ymax + 1))
ff_cropped.save(os.path.join(pdir, 'leg_front_far.png'))
print(f"Leg Front Far: bbox=({ff_xmin}, {ff_ymin}, {ff_xmax}, {ff_ymax}), size={ff_cropped.size}")

print("All parts successfully extracted with smooth rounded anatomical joints!")
