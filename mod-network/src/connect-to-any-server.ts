/**
 * This script identifies the path to go from home to a target server. By default, the script automatically tries to
 * reach the target server once the path identified. The script has been integrated with the autocomplete feature of
 * BitBurner.
 * Very useful when used in combination with an alias: `alias connect="run utils/connect-to-any-server.js"`.
 *
 * @param {targetServer: string} - The hostname of the server we try to reach.
 * @param {--print: boolean} Flag - If true only print the path without trying to reach it. Default: false.
 *
 * @example: connect aerocorp
 */

import { AutocompleteData, NS as INs } from '@ns';

const FLAGS: [string, boolean][] = [['print', false]];

/** @param {NS} ns */
export async function main(ns: INs): Promise<void> {
   ns.tail();
   ns.disableLog('ALL');
   const flags = ns.flags(FLAGS);
   const path: string[] = [];
   const targetServer: string = (flags._ as string[])[0];

   buildPathToServer(ns, '', 'home', targetServer, path);

   ns.print(path.join(' -> '));

   const command: string = `${path.join('; connect ')}; backdoor;`;

   if (!flags.print) {
      // eslint-disable-next-line no-eval
      const doc: Document = eval('document');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const terminalInput: any = doc.getElementById('terminal-input');
      terminalInput.value = command;
      const handler: string = Object.keys(terminalInput)[1];
      terminalInput[handler].onChange({ target: terminalInput });
      terminalInput[handler].onKeyDown({ key: 'Enter', preventDefault: () => null });
   } else {
      ns.tprint(command);
   }
}

function buildPathToServer(
   ns: INs,
   parentServer: string,
   sourceServer: string,
   targetServer: string,
   path: string[]
): boolean {
   const childrenServers: string[] = ns.scan(sourceServer);
   let output: boolean = false;
   childrenServers.forEach((childServer: string): void => {
      if (childServer === parentServer) return;

      if (childServer === targetServer) {
         path.unshift(childServer);
         path.unshift(sourceServer);
         output = true;
         return;
      }

      if (buildPathToServer(ns, sourceServer, childServer, targetServer, path)) {
         ns.print(sourceServer);
         path.unshift(sourceServer);
         output = true;
         return;
      }
      output = false;
   });
   return output;
}

export function autocomplete(data: AutocompleteData): string[] {
   return [...data.servers];
}
