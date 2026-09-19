import os
import shutil
import base64
import numpy as np
from PIL import Image

pdir = r'd:\Projects\FocusCat_Extracted\BotPet\desktop\assets\skins\puppy_parts'
scratch = r'C:\Users\GOD\.gemini\antigravity-ide\brain\f11096d8-aa34-4fb5-8fec-4fa1d32d07a6\scratch'

# Ensure puppy_full_closed.png is present
src_full = os.path.join(scratch, 'puppy_full_closed.png')
dst_full = os.path.join(pdir, 'puppy_full_closed.png')
shutil.copyfile(src_full, dst_full)
shutil.copyfile(src_full, r'd:\Projects\FocusCat_Extracted\BotPet\desktop\assets\skins\puppy.png')

parts = [
    'tail',
    'leg_rear_far',
    'leg_rear_near',
    'leg_front_far',
    'leg_front_near',
    'head',
    'ear_near',
    'torso',
    'chest_ruff',
    'mouth_open',
    'puppy_full_closed'
]

data_js = r'd:\Projects\FocusCat_Extracted\BotPet\js\puppy-data.js'
entries = []
for p in parts:
    fpath = os.path.join(pdir, f'{p}.png')
    with open(fpath, 'rb') as f:
        b64 = base64.b64encode(f.read()).decode('ascii')
        entries.append(f'    "{p}": "data:image/png;base64,{b64}"')

content = '/* Auto-generated base64 assets for Puppy companion modular rig */\n'
content += '(function (global) {\n'
content += '  global.PUPPY_PARTS = {\n'
content += ',\n'.join(entries) + '\n'
content += '  };\n'
content += '})(typeof window !== "undefined" ? window : globalThis);\n'

with open(data_js, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated js/puppy-data.js with all updated part assets including puppy_full_closed')
