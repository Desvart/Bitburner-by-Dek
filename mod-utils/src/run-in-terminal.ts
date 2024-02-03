/**
 * This script provide the capability to run any NetScript command or js code directly through the terminal.
 * Very useful when used in combination with an alias: `alias do="run utils/run-in-terminal.js"`.
 * Do not add spaces in the command instruction!
 *
 * Author: Derek Svart <https://github.com/Desvart>
 *
 * @param {command: string} - The command to run.
 *
 * @example: do 2+3
 * @example: do ns.getServer("foodnstuff")
 * @example: do ns.ls('home','.exe')
 */

import { NS as INs } from '@ns';

/** @param {NS} ns */
export async function main(ns: INs): Promise<void> {
   const args: string[] = ns.args as string[];
   if (args.length === 0) {
      ns.tprint('ERROR - You must run this script with an argument that is the code to run.');
      return;
   }

   args.forEach((arg: string): void => {
      if (arg.length === 1 && arg === ',') {
         ns.tprint('ERROR - You must not add spaces in the command instruction.');
         ns.exit();
      }
   });

   const command: string = String(args.join(''));
   const script: string = `
    export async function main(ns) { 
      ns.tprint(JSON.stringify(${command})); 
    }`;

   const tmpFileName: string = '/tmp/tmp-script.js';
   ns.write(tmpFileName, script, 'w');
   ns.run(tmpFileName, 1);

   await ns.sleep(500);
   ns.rm(tmpFileName);
}
