### Network module

This module contains all the scripts related to the network mechanic.

This module contains the following capabilities:

* Monitoring the whole network at a glance  
  Command: `run network/monitor-network.js`


* Monitoring the inner characteristics of a specific server  
  Command: `run network/monitor-server.js <servers>`


* Getting elevated privileges (root) on a specific server or the whole network      
  Command: `run network/sudo-server.js <servers> -backdoor -logs`
  Command: `run network/sudo-server.js -all -backdoor -logs`
* 

* **[OP]** Connecting directly to any server in the game without having to jump from server to server or to wait for the
  Singularity source file  
  Command: `run network/connect-to-any-server <server>`