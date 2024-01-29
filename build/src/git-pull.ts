import { AutocompleteData, NS as INs } from '@ns';
import { ArgSchemaType, FlagType } from '/resources/common-types';

const argsSchema: ArgSchemaType[] = [
   ['all', true],
   ['utils', false],
   ['network', false],
   ['xp', false],
   ['hacknet', false],
   ['hacking', false],
   ['contracts', false],
   ['market', false],
   ['infiltration', false],
   ['corporation', false],
];

export function autocomplete(data: AutocompleteData, args: string[]): string[] {
   const flags: string[] = argsSchema.map(([flag]: ArgSchemaType): string => `--${flag}`);
   return [...flags].filter((flag) => !args.includes(flag));
}

export function main(ns: INs): void {
   const flags: FlagType = ns.flags(argsSchema);

   if (flags.all) {
      for (const prop in flags) {
         if (typeof flags[prop] === 'boolean') {
            flags[prop] = true;
         }
      }
   }
}
