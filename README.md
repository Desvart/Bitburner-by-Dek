# Bitburner's scripts by Desvart

[![license](https://img.shields.io/github/license/desvart/dekburner?color=blue)](https://github.com/desvart/dekburner/blob/master/LICENSE)
[![Bitburner Version](https://img.shields.io/badge/game_version-2.5.2-blue)](https://github.com/bitburner-official/bitburner-src/releases/tag/v2.5.2)

## Description
This repository contains all the scripts I use in the game [Bitburner](https://danielyxie.github.io/bitburner/).
Some are written by me from scratch, some are directly taken as is from internet and most are internet script more or 
less modified to fit my needs. I try to keep track of the source of the original/inspirational scripts in the header of 
"my" scripts.

Each module has been implemented to be fully independent of each others. If some kind of orchestration could
be found inside some modules, there is none between the modules. This is a personal choice. I want to use them as tools
while I fidget through the game and still enjoy actively playing the game. I am not looking for a fully automated game, 
but for a game that I can play while developing tools to improve my experience (while learning js/ts/web development at 
the same time). 

I fully acknowledge that some of the scripts are overpowered and could be considered by some as cheating since they 
highly skew the balance difficulty-playability toward nearly no difficulty at all. I do not consider them as cheats 
since the game itself pushes the player to hack as much as possible, even outside the "normal" framework of the game.
For the sake of transparency, I have flagged these scripts in the description below with the tag "**[OP]**".

## Repository structure
The repository contains 4 types of modules:
* `dist/prod`: contains the javascript scripts that can be directly downloaded into Bitburner and used in the game.
* `mod-*/`: contains the typescript source code at the origin of the `dist/prod` javascript scripts.  
  (see below for a more detailed description of each module)
* `build/`: contains the scripts needed to run the CI/CD pipeline I use for my development process  
  (more details on that in `build/README.md`).

## Installation

### For players that develop inside the game IDE or simply want to take the scripts as is
Download the content of the `dist/prod` folder and copy/paste the content of each file in the game. 
Then, create the following aliases:
```
alias do='run utils/run-in-terminal.js';
alias buyDarkweb='run utils/buy-from-darkweb.js';
alias buyServer='run utils/buy-custom-server.js';
alias del='run utils/cleanup-server.js';
alias warp='run utils/warp-time.js';
alias bootstrap='run utils/bootstrap-new-iteration.js';
```

### For players that develop in an external IDE
Clone the full repository into your IDE and follow the instructions in `build/README.md` to set up the CI/CD pipeline.


## Modules usage

### mod-utils
This module contains various utility scripts not specifically related to a specific mechanic. This module contains 3 
capabilities:
* buying items from the Darkweb even without the singularity  
  Command: `buyDarkweb --tor --portBypass --formulas --all --logs`
* buying custom servers
  Command: `buyServer <name> <ram> --logs`
* delete remote files easily  
  Command: `del <targets>`, `del --home --deleteContracts --logs`
* run any javascript instruction (even with ns) directly in the terminal (do not put spaces in the code)  
  Command: `do <code>`
* **[OP]** "warping" time by fast forwarding days into the future or by speeding up the time flow  
  Command: `warp --days <days> --speed <speed> --reset --status`
* **[OP]** bootstrap a new game iteration by highly raising the player's combat stats and money  
  Command: `bootstrap`


