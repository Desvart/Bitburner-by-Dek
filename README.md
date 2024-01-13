# Bitburner's scripts by Desvart

[![license](https://img.shields.io/github/license/desvart/dekburner?color=blue)](https://github.com/desvart/dekburner/blob/master/LICENSE)
[![Bitburner Version](https://img.shields.io/badge/game_version-2.5.2-blue)](https://github.com/bitburner-official/bitburner-src/releases/tag/v2.5.2)

## Description
This repository contains all the scripts I use in the game [Bitburner](https://danielyxie.github.io/bitburner/).
Some are written by me from scratch, some are directly taken as is from internet and most are internet script more or 
less modified to fit my needs. I try to keep track of the source of the original/inspirational scripts in the header of 
"my" scripts.

Even if I do not support the practice of having big chunky JavaScript files, in the context of Bitburner, I find the 
pro's of having self-sufficient one file scripts to be greater than the con's (mostly in terms of readability 
and maintainability. Therefore, I will not split the scripts in multiple files until I find a better way to manage them.

Finally, each module has been implemented to be fully independent of each others. If some kind of orchestration could
be found inside some module, there is none between the modules. This is a personal choice. I want to use them as tools
while I fidget through the game and still enjoy playing the game. I am not looking for a fully automated game, but for 
a game that I can play while developing tools to improve my experience (while learning js/ts/web development at the 
same time). 

I fully acknowledge that some of the scripts are overpowered and could be considered by some as cheating. I do not 
consider them as such but for the sake of transparency, I have flagged them in the description below with the tag 
"[OP]".

## Repository structure
The repository contains 4 types of modules:
* `dist/prod`: contains the javascript scripts that can be directly downloaded into Bitburner and used in the game.
* `mod-*/`: contains the typescript source code addressing a specific mechanic.  
  (see below for a more detailed description of each module)
* `build/`: contains the scripts needed to run the CI/CD pipeline I use for my development process  
  (more details on that in `build/README.md`).

## Installation

### For players that develop inside the game IDE or simply want to take the scripts as is
Download the content of the `dist/prod` folder and copy/paste the content of each file in the game. 
Then, create the following aliases:
```
alias do='run utils/run-in-terminal.js';
alias buy='run utils/buy-items.js';
alias xp='run xp/orchestrator.js';
alias goto='run network/connect-to-any-server.js';
alias mon='run network/monitor-orchestrator.js';
alias sudo='run network/sudo.js';
alias wolfstreet='run market/original-stockmaster.js';
alias spy='run infiltration/loopInfiltrate.js';
alias sherlock='run contracts/orchestrator.js';
```

### For players that develop in an external IDE
Clone the full repository into your IDE and follow the instructions in `build/README.md` to set up the CI/CD pipeline.


## Modules usage
Modules that are present in the code but not described below should be considered as work in progress. If you are 
interested only in stable code, please refer to the release branch.

### mod-contracts
This module contains all the scripts related to the contracts mechanic. This module contains only one capability: 
* Finding all available contracts and resolving them on the fly. Once all contracts have been solved, the script will 
  end.  
  Command: `sherlock <servers>`, `sherlock --all` 

### mod-market
This module contains all the scripts related to the stock market mechanic. This module contains only one capability:
* Managing your stock portfolio to maximize your profit overtime by buying and selling stocks depending on the market 
  context and forecast. 
  The script handles by itself the buying of required TIX API. It is also able to work efficiently without the ability 
  to short stocks.    
  Command: `wallstreet`

### mod-infiltration [OP]
This module contains all the scripts related to the infiltration mechanic. This module contains two capabilities:
* Fully automating the resolution of a single infiltration mission once you reach the first infiltration screen.   
  Command: `run infiltration/infiltrate.daemon.js`
* Automatically repeating automated infiltration missions to gain money or reputation depending on the player choice.  
  Command: `spy --money --target <target>`, `spy --faction <faction> --target <target>`

### mod-xp
This module contains all the scripts related to the skills mechanic. This module contains only one capability:
* Automatically farm for the hacking skill experience  
  Command: `xp --hacking --buildServer`

### mod-network
This module contains all the scripts related to the network mechanic. This module contains 4 capabilities:
* [OP] Connecting directly to any server in the game without having to jump from server to server or to wait for the 
  singularity  
  Command: `connect --backdoor <server> `
* Monitoring the whole network at a glance  
  Command: `mon --network`
* Monitoring the inner characteristics of a specific server  
  Command: `mon <servers>`
* Getting elevated privileges (root) on a specific server or the whole network  
  Command: `sudo <servers>`, `sudo --all`

### mod-utils
This module contains various utility scripts not specifically related to a specific mechanic. This module contains 3 
capabilities:
* buying TOR router even without the singularity  
  Command: `buy --tor`
* delete remote files easily  
  Command: `del <targets>`, `del --all`
* run any javascript instruction (even with ns) directly in the terminal (do not put spaces in the code)  
  Command: `do <code>`


