# TextBasedRpg

## Overview
Create an Infinite Ages character 
Play an rpg style game 
turn based combat 
Looting system
Leveling system 
Boss Fights 
Win condition

## Features
- as added


## Directory
├─ main.py              # super‑skinny now: just starts the game
│
├─ game/
│   ├─ __init__.py      # lets Python treat this folder as a package
│   ├─ loop.py          # the central turn / input loop
│   ├─ state.py         # global game state & helpers
│   ├─ events.py        # event dispatcher or message bus
│   └─ saves.py         # save / load functions
│
├─ world/
│   ├─ __init__.py
│   ├─ locations.py     # rooms / areas
│   ├─ items.py         # item classes & factories
│   ├─ characters.py    # NPC & player classes
│   └─ encounters.py    # combat / puzzle logic
│
├─ ui/
│   ├─ __init__.py
│   ├─ cli.py           # terminal I/O helpers
│   └─ render.py        # formatting, color, text wrappers
│
├─ data/                # JSON, txt, YAML content files
│