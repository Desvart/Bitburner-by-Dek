/**
 * The script will help the player in buying and upgrading new custom servers.
 * If the server name already exists and the ram size is superior to the existing one, the script will upgrade the server.
 * If the server name already exists and the ram size is inferior to the existing one, the script will create a new server.
 * If the server name doesn't exist, the script will create a new server.
 *
 * @param {serverName: string}
 * @param {ramSize: number}
 * @param {--logs: boolean}
 */

import { AutocompleteData, NS as INs } from '@ns';
import { InputsProcessor, Operation } from '/mod-utils/src/buy-server/inputs-processor';

export function autocomplete(data: AutocompleteData, args: string[]): string[] {
   return InputsProcessor.autocomplete(data, args);
}

/** @param {NS} ns */
export async function main(ns: INs): Promise<void> {
   const { serverName, ramSize, operation, nsConsole } = new InputsProcessor(ns);

   if (operation === Operation.BUY)
      ns.purchaseServer(serverName, ramSize) === ''
         ? nsConsole.log(`Server purchase: FAILED`)
         : nsConsole.log(`Server purchase: SUCCESS (${serverName}, ${ramSize})`);

   if (operation === Operation.UPGRADE)
      ns.upgradePurchasedServer(serverName, ramSize)
         ? nsConsole.log(`Server upgrade: SUCCESS (${serverName}, ${ramSize})`)
         : nsConsole.log(`Server upgrade: FAILED`);
}
