# BotPet Desktop

Desktop focus companion application built with Electron.

## Overview

BotPet monitors foreground distraction dwell time according to customizable rules and triggers playful companion interventions when timers expire.

## Structure

- `main.js`: Main process, transparent overlay manager, and settings window
- `pet.html` / `pet.js`: Transparent screen companion layer
- `widget.html` / `widget.js`: Companion card and interactive floating widget
- `rules.js`: Rule matching engine and default config
- `monitor.js`: Foreground window detection
- `enforcer.js`: Window/tab close execution
- `cli.js`: Command-line controller (`botpet <command>`)

## Quick Launch

```bash
npm start
```
