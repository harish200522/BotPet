from PIL import Image
import numpy as np

pdir = r'd:\Projects\FocusCat_Extracted\BotPet\desktop\assets\skins\puppy_parts'
scratch = r'C:\Users\GOD\.gemini\antigravity-ide\brain\f11096d8-aa34-4fb5-8fec-4fa1d32d07a6\scratch'

full = np.array(Image.open(scratch + r'\puppy_full_closed.png'))
fh, fw = full.shape[:2]

s = 0.1327634
x0 = 40.57
y0 = 17.80

parts = [
    'head', 'ear_near', 'tail', 'torso', 'chest_ruff',
    'leg_rear_near', 'leg_rear_far', 'leg_front_near', 'leg_front_far'
]

for name in parts:
    im = np.array(Image.open(f'{pdir}\\{name}.png'))
    ph, pw = im.shape[:2]
    
    nz = np.argwhere(im[:, :, 3] > 200)
    if len(nz) == 0:
        nz = np.argwhere(im[:, :, 3] > 50)
    sy, sx = nz[len(nz)//2]
    val = im[sy, sx]
    
    found = False
    for dy in range(0, fh - ph + 1):
        for dx in range(0, fw - pw + 1):
            if np.all(full[dy+sy, dx+sx] == val):
                # test patch
                patch_f = full[dy+sy:dy+sy+5, dx+sx:dx+sx+5]
                patch_p = im[sy:sy+5, sx:sx+5]
                if np.all(patch_f == patch_p):
                    x_svg = dx * s + x0
                    y_svg = dy * s + y0
                    w_svg = pw * s
                    h_svg = ph * s
                    print(f'{name:15s}: full bbox=({dx:3d}, {dy:3d}), size=({pw:3d}, {ph:3d})')
                    print(f'                 svg: x="{x_svg:.2f}" y="{y_svg:.2f}" width="{w_svg:.2f}" height="{h_svg:.2f}"')
                    found = True
                    break
        if found:
            break
    if not found:
        print(f'{name:15s}: NOT FOUND directly')
