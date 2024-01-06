/**
 * This script provide the capability to run any NetScript command or js code directly through the terminal.
 * Very useful when used in combination with an alias: `alias do="run utils/run-in-terminal.js"`.
 *
 * @param {command: string} - The command to run.
 *
 * @example: do 2+3
 * @example: do ns.getServer("foodnstuff")
 */

import { NS as INs } from '@ns';

/** @param {NS} ns */
export async function main(ns: INs): Promise<void> {
   const { args } = ns;
   if (args.length === 0) {
      ns.tprint('You must run this script with an argument that is the code to run.');
      return;
   }

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
