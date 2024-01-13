import { AutocompleteData, NS as INs } from '@ns';

/** @param {NS} ns */
export async function main(ns: INs): Promise<void> {
   ns.tail();
   ns.setTitle('Hacking coordinator');
   ns.disableLog('ALL');
   ns.clearLog();
}

export function autocomplete(data: AutocompleteData): string[] {
   return [...data.servers];
}
