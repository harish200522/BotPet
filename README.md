# BotPet 🐾

**Your Playful AI Desktop Focus Companion.**

BotPet lives along the bottom of your screen. It watches active foreground windows, and when doomscrolling sites (Shorts, Reels, TikTok, or streaming platforms) hold your attention for longer than you allowed, your pet gets up, marches over, and playfully taps the distracting tab closed with its paw.

BotPet supports multiple delightful animated companion rigs:
1. 🐱 **Classic Cat**
2. 🐼 **Chibi Panda**
3. 🐶 **Playful Puppy**

---

## Key Features

- **Local Foreground Watch**: Evaluates the foreground window's title, process, and URL locally. No data ever leaves your computer.
- **Per-Site Rules & Grace Periods**: Set customizable countdown timers for specific websites and apps.
- **Action Choices**: Choose whether your pet closes the tab (`Ctrl+W`), closes the whole window, or *only complains* (playfully glares without closing).
- **Interactive Physics & Affection**: Pat your pet with hearts, pick it up, drag it across the screen, and watch it land on its feet.
- **Visual Settings & Rules Panel**: Full control over pets, detection rules, whitelists ("Never touch"), speeds, sizes, and skins.
- **Command-Line & Script Control**: Launch and control your companion seamlessly via CLI (`botpet <command>`).

---

## Project Structure

```
BotPet/
├── desktop/                  # Electron desktop application
│   ├── main.js               # Main process, background monitor & tray
│   ├── pet.html / pet.js     # Screen companion overlay window
│   ├── widget.html           # Free pet card / floating widget
│   ├── cli.js                # Command-line interface
│   └── rules.js              # Rule evaluation and config defaults
├── settings/                 # Visual Settings & Rules Panel
│   ├── settings.html         # Settings UI
│   ├── settings.css          # Design system & styles
│   └── settings.js           # Settings controller & live view
├── js/                       # Vector rigs & Character Manager
│   ├── character-manager.js  # Unified character delegation
│   ├── cat.js / cat-rig.js   # Classic Cat rig
│   ├── panda-rig.js          # Chibi Panda rig
│   └── puppy-rig.js          # Playful Puppy rig
├── tools/                    # Animation & Character Design Studio
│   └── character_studio.html # Live character studio
├── botpet.bat / botpet.ps1   # Quick CLI launch scripts
├── open-settings.bat         # Open the BotPet Settings Panel
└── start-screen-pet.bat      # Launch the Desktop Pet
```

---

## Quick Start

### 1. Launch the Desktop Companion
Double-click `start-screen-pet.bat` or run:
```bash
cd desktop
npm start
```

### 2. Open the Settings Panel
Double-click `open-settings.bat` or run:
```bash
botpet settings
```

### 3. CLI Commands
```bash
botpet wake           # Wake up pet and greet
botpet pat            # Pat pet (joyful celebration)
botpet sit            # Rest state
botpet walk           # Wander across screen
botpet skin panda     # Switch to Panda companion
botpet skin cat       # Switch to Cat companion
botpet status         # Check active rules and status
```

---

## License

MIT License.
