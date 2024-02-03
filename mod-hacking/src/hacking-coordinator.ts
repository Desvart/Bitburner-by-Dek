import { AutocompleteData, NS as INs } from '@ns';

export function autocomplete(data: AutocompleteData, args: string[]): string[] {
   return [...data.servers].filter((server: string) => !args.includes(server));
}

/** @param {NS} ns */
export async function main(ns: INs): Promise<void> {
   ns.tail();
   ns.setTitle('Hacking coordinator');
   ns.disableLog('ALL');
   ns.clearLog();

   const targetName: string = ns.args[0] as string;




}
