## Build module
* Split two config, one for PROD (Teams) and one for INTG (Firefox)
* Split the code between the release branch and the dev branch
* Add a script in the build folder to copy/update code of specific module from intg to prod folders
* Develop a script to automatically download the prod code to the game
  https://github.com/moriakaice/bitburner/blob/master/src/initHacking.js
* Write the README.md file

## Contract module

## Hacking module
* Convert to TS

## Infiltration module
* Convert to TS
* Add the loop script to take additional parameters:
  * approximate duration of the execution
  * target money to reach
* Add the number of remaining loops (or time) in the HUD
* Add a log to explain the reason of the unexpected stops

## Market module
* Convert to TS

## Network module
* Fix the path determination script

## XP module

## Casino module
* Find one that does the job, without restarting the game

## Corporation module
* Build an algo that buy bonus material following the optimized path

## Utils module
* Build an improved HUD
* FIX [buy-tor-and-worms] for some unknown mechanics, the tor router is created only once the buying script has been 
released. Therefore, once the router bought and before to buy the worms, we need to kill the script and launch another.
* Adapt alias command to not display log but with --log option but to pop an error if needed.
* Add a script to download all the scripts from the GitHub repository to the game itself (and set up the aliased on the 
  fly)


### Reference
* [Injecting HTML in game](https://bitburner.readthedocs.io/en/latest/netscript/advancedfunctions/inject_html.html)
* [Custom autocomplete](https://bitburner.readthedocs.io/en/latest/netscript/advancedfunctions/autocomplete.html)
* [Improve HUD](https://github.com/bitburner-official/bitburner-scripts/blob/master/custom-stats.js)
* [Improve HUD2](https://steamcommunity.com/sharedfiles/filedetails/?id=2680734426)



https://github.com/xxxsinx/bitburner

https://github.com/alainbryden/bitburner-scripts/blob/main/casino.js#L110

https://github.com/alainbryden/bitburner-scripts/blob/main/daemon.js