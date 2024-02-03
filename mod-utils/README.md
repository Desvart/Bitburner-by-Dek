# Utils module

This module contains various utility scripts not specifically related to a specific mechanic. 

This module also contains a `lib` folder that contains all the common code used by the other modules.

This module contains the following capabilities:

* Buying the "viruses" from the Darkweb even without the Singularity source file. "Viruses" designates the 5 exe file
  that can be used to open servers ports.  
  Command: `run utils/buy-from-darkweb.js --viruses --logs`


* Buying the "formulas" file from the Darkweb even without the Singularity source file  
  Command: `run utils/buy-from-darkweb.js --formulas --logs`


* Buying custom servers  
  Command: `run utils/buy-custom-server.js <name> <ram> --logs`


* Erasing server content easily  
  Command: `run utils/erase-server-content.js <targets> --logs`   
  Command: `run utils/erase-server-content.js --home --deleteContracts --logs`


* Executing any JavaScript instruction (even with the ns object) directly into the terminal 
  (do not put spaces in the code)    
  Command: `run utils/eval-in-terminal.js <code-without-spaces>`


* **[OP]** "Warping" time by fast forwarding days into the future or by speeding up the time flow  
  Command: `run utils/warp-time.js --days <days>`  
  Command: `run utils/warp-time.js --speed <speed>`  
  Command: `run utils/warp-time.js --status`  


* **[OP]** Bootstraping a new game iteration by instantly raising the player's combat stats and money.
  Command: `run utils/bootstrap.js`


## Improvement ideas
* Enhance the buying capability by taking into account the existence of not of the Singularity source file.
* Enhance the buying capability by automatically buying the TOR router if not already owned.