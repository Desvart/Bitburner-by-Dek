<div style="text-align: center;"> 

# Bitburner's scripts by Desvart
[![license](https://img.shields.io/github/license/desvart/dekburner?color=blue)](https://github.com/desvart/dekburner/blob/master/LICENSE)
[![Bitburner Version](https://img.shields.io/badge/game_version-2.5.2-blue)](https://github.com/bitburner-official/bitburner-src/releases/tag/v2.5.2)
</div>

## Description
This repository contains all the scripts I use in the game [Bitburner](https://danielyxie.github.io/bitburner/).
Some are written by me from scratch, some are directly taken as is from internet and most are internet script more or 
less modified to fit my needs. I try to keep track of the source of the original/inspirational scripts in the header of 
"my" scripts.

Each module has been implemented to be fully independent of each others (with the exception to the `utils/lib` folder). 
If some kind of orchestration could be found inside some modules, there is none between the modules. This is a personal 
choice. I want to use them as tools while I fidget through the game and still enjoy actively playing the game. I am not 
looking for a fully automated game, but for a game that I can play while developing tools to improve my experience 
(while learning js/ts/web development at the same time). 

Some of this script will only work once the player has reached a certain level of progression in the game. Some are 
designed to automatically adapt to the player's progression but some are not. Be aware of that.

I fully acknowledge that some of the scripts are overpowered and could be considered by some as cheating since they 
highly skew the balance difficulty-playability toward nearly no difficulty at all. This is not a problem for me and I 
use them for my own purpose (testing or skipping parts of the game I do not like). To be used with caution to not spoil 
the whole game.   
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
* **Easy automated way**: execute the following script: `run utils/git-pull.js` in the game terminal.   
  This will download the latest version of the scripts into your BitBurner game and create the aliases used in the
  below descriptions.
* **Manual fallback way**: download the content of the `dist/prod` folder and copy/paste the content of each file in 
  the game.   
  Then, execute the following script to create the aliases used in the below descriptions: `run utils/create-aliases.js`
  If for any reason the script does not work, you can create the aliases manually. They are described in the 
  `create-aliases.js` script.

### For players that develop in an external IDE
Clone the full repository into your IDE and follow the instructions in `build/README.md` to set up the CI/CD pipeline.


## Modules description
A very high-level description of each module capabilities is given below. For a more detailed description, please refer
to the README.md file of each module.

| Module                                          | Description                                                              |
|-------------------------------------------------|--------------------------------------------------------------------------|
| [mod-utils](/mod-utils/README.md)               | Various utility scripts not specifically related to a specific mechanic. | 
| [mod-network](/mod-network/README.md)           | Scripts used to manage remote servers.                                   | 
| [mod-contracts](/mod-contracts/README.md)       | Scripts related to the contracts mechanic.                               |
| [mod-farming](/mod-farming/README.md)           | Scripts aiming at automatically farming XP to grow skills.               |
| [mod-hacking](/mod-hacking/README.md)           | Scripts related to the hacking mechanic.                                 |
| [mod-market](/mod-market/README.md)             | Scripts related to the stock market mechanic.                            |
| [mod-infiltration](/mod-infiltration/README.md) | Scripts related to the infiltration mechanic.                            |
| [mod-hacknet](/mod-hacknet/README.md)           | Scripts related to the hacknet mechanic.                                 |
| [mod-corporation](/mod-corporation/README.md)   | Scripts related to the corporation mechanic.                             |
| [mod-sleeve](/mod-sleeve/README.md)             | Scripts related to the sleeve mechanic.                                  |
| [mod-stanek](/mod-stanek/README.md)             | Scripts related to the Stanek mechanic.                                  |
| [mod-exploit](/mod-exploit/README.md)           | Scripts related to the "Source File -1" mechanic.                        |
