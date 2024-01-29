# Infiltration module

This module automate the infiltration mechanism of the game.

## Main features

infiltrate-daemon.js is the core of the module. Once activated, this script waits for an infiltration display to be 
open. As soon as this display is detected, the script takes over and solves all the infiltration puzzles by itself 
before give back the control on the final infiltration page, where the player can choose to what to do with the
stolen information (sell it or trade it).

loopInfiltration.js is an add-in script that works in addition to the infiltrate-daemon.js script. It automates the 
opening of the infiltration home page before releasing the control to the daemon script. Once the daemon has finished
its job, the loopInfiltration script takes back the control and sell or trade the stolen information base on the script
configuration. Once done, it stats the process again, automatically.

## Remarks
Based on the data collected on the version 2.5.2 of the game, the infiltration rewards are more interesting at higher 
level of difficulty. The increase of reward is not linear and highly favour the highest level of difficulty. 
Interestingly, the average resolution time per puzzle is the same, whatever the level of difficulty. This means that
the average reward per minute is higher at higher level of difficulty.

In addition, the Shadow of Anarchy augmentation called "Phyzical WKS harmonizer" is very useful to greatly improve the
infiltration rewards. It lowers a little bit the average time required to solve a puzzle and, more importantly, greatly 
increase the rewards. Here, once again, the improvement is even more visible at higher level of difficulty.

For instance, without the SoA augmentation, infiltrating the MegaCorp company yield 8.9e9 $ in total (and on my computer 
this means 1.4e8 $/s). With the SoA augmentation, the total reward is 1.3e10 $ (2.4e8 $/s).

## Sources
The infiltrate-daemon.js script is based on the work of 
[tomdunning](https://github.com/tomdunning/bitburner-solutions/blob/main/infiltrate.js).

The loopInfiltration.js script is based on the work of 
[akelopes](https://github.com/akelopes/bitburner_scripts/blob/master/src/loopInfiltrate.js).


### mod-infiltration [OP]
This module contains all the scripts related to the infiltration mechanic. This module contains two capabilities:
* Fully automating the resolution of a single infiltration mission once you reach the first infiltration screen.   
  Command: `run infiltration/infiltrate.daemon.js`
* Automatically repeating automated infiltration missions to gain money or reputation depending on the player choice.  
  Command: `spy --money --target <target>`, `spy --faction <faction> --target <target>`