import { AutocompleteData, NS as INs } from '@ns';
import { ArgSchemaType, FlagType } from '/resources/src/common-types';
import { NsConsole } from '/mod-utils/src/lib/ns-console';

export class InputsProcessor {
   static readonly argsSchema: ArgSchemaType[] = [
      ['tor', false],
      ['portBypass', false],
      ['formulas', false],
      ['all', false],
      ['logs', false],
   ];

   readonly purchaseTorRouter: boolean = false;
   readonly purchasePortBypass: boolean = false;
   readonly purchaseFormulas: boolean = false;
   readonly nsConsole: NsConsole;

   constructor(ns: INs) {
      const args: FlagType = ns.flags(InputsProcessor.argsSchema);
      this.nsConsole = new NsConsole(ns, 'Darkweb purchase', args.logs as boolean);

      this.purchaseTorRouter = args.tor as boolean;
      this.purchasePortBypass = args.portBypass as boolean;
      this.purchaseFormulas = args.formulas as boolean;

      if (args.all as boolean) {
         this.purchaseTorRouter = true;
         this.purchasePortBypass = true;
         this.purchaseFormulas = true;
      }

      this.nsConsole.log('CLEANUP CONFIG ---------\n\n');
      this.nsConsole.log(
         `Purchase basket: ${this.purchaseTorRouter ? 'TOR Router' : ''}${
            this.purchasePortBypass ? ', 5 ports bypass' : ''
         }${this.purchaseFormulas ? ', Formulas package' : ''}\n\n`
      );
   }

   static autocomplete(_: AutocompleteData, args: string[]): string[] {
      const flags: string[] = InputsProcessor.argsSchema.map(([flag]: ArgSchemaType): string => `--${flag}`);
      const fullAutocomplete: string[] = [...flags];

      if (args.includes('--all') && !args.includes('--logs')) return ['--logs'];
      if (args.includes('--all') && args.includes('--logs')) return [''];
      return fullAutocomplete.filter((elem: string) => !args.includes(elem));
   }
}
