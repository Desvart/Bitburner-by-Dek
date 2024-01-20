/**
 * If the player has enough money, this script will automatically buy the TOR router, all worm software and the
 * Formulas.exe software.
 *
 * Based on script by akelopes (https://github.com/akelopes/bitburner_scripts/blob/master/src/starters/buyExecutables.js)
 *
 * @param {--tor: boolean}
 * @param {--portBypass: boolean}
 * @param {--formulas: boolean}
 * @param {--all: boolean}
 * @param {--logs: boolean}
 */

import { AutocompleteData, NS as INs } from '@ns';
import { InputsProcessor } from '/mod-utils/src/buy-from-darkweb/inputs-processor';
import { Darkweb } from '/mod-utils/src/buy-from-darkweb/darkweb';

export function autocomplete(data: AutocompleteData, args: string[]): string[] {
   return InputsProcessor.autocomplete(data, args);
}

/** @param {NS} ns */
export async function main(ns: INs): Promise<void> {
   const inputs: InputsProcessor = new InputsProcessor(ns);
   const { purchaseTorRouter, purchasePortBypass, purchaseFormulas } = inputs;
   const { nsConsole } = inputs;

   const darkweb = new Darkweb(ns, nsConsole);
   if (purchaseTorRouter) await darkweb.attemptToPurchaseTorRouter();
   if (purchasePortBypass) await darkweb.attemptToPurchasePortBypass();
   if (purchaseFormulas) await darkweb.attemptToPurchaseFormulas();
}
