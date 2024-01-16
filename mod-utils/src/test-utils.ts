import { AutocompleteData, NS as INs } from '@ns';

type ArgSchemaType = [string, string | number | boolean | string[]];
const argsSchema: ArgSchemaType[] = [
   ['deleteContracts', false],
   ['log', false],
];

export function autocomplete(data: AutocompleteData, args: string[]): string[] {
   const flags: string[] = argsSchema.map(([flag]: ArgSchemaType): string => `${flag}`);
   const formattedFlags: string[] = flags.map((flag: string): string => {
      return flag.length === 1 ? `-${flag}` : `--${flag}`;
   });
   const fullAutocomplete: string[] = [...data.servers, ...formattedFlags];
   return fullAutocomplete.filter((elem: string) => !args.includes(elem));
}

/** @param {NS} ns */
export async function main(ns: INs): Promise<void> {
   ns.tail();
   ns.disableLog('ALL');
   ns.clearLog();

   ns.print(`START TEST ---------\n\n`);
   ns.tprint(`START TEST ---------\n\n`);
   ns.print(ns.args);

   const arg = ns.flags(argsSchema);
   ns.print(arg);
}
