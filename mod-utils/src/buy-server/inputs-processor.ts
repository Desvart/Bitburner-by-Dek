import { AutocompleteData, NS as INs } from '@ns';
import { ArgSchemaType, FlagType } from '/resources/src/common-types';
import { NsConsole } from '/mod-utils/src/lib/ns-console';
import { getAllHostnames } from '/mod-utils/src/lib/get-hostnames';

export enum Operation {
   BUY = 'BUY',
   UPGRADE = 'UPGRADE',
}

export class InputsProcessor {
   static readonly argsSchema: ArgSchemaType[] = [['logs', false]];

   readonly serverName: string = '';
   readonly ramSize: number = 0;
   operation: Operation = Operation.BUY;
   readonly nsConsole: NsConsole;

   readonly #ns: INs;

   constructor(ns: INs) {
      this.#ns = ns;
      const args: FlagType = ns.flags(InputsProcessor.argsSchema);
      this.nsConsole = new NsConsole(ns, args.logs as boolean);

      const serverConfig: [string, string | number] = args._ as [string, string | number];
      [this.serverName, this.ramSize] = this.checkServerConfigurationValidity(serverConfig);
   }

   static autocomplete(_: AutocompleteData, args: string[]): string[] {
      const flags: string[] = InputsProcessor.argsSchema.map(([flag]: ArgSchemaType): string => `--${flag}`);
      const fullAutocomplete: string[] = [...flags];

      if (args.length === 0) {
         return ['psrv-hk01 2^20'];
      }

      return fullAutocomplete.filter((elem: string) => !args.includes(elem));
   }

   private checkServerConfigurationValidity(serverConfiguration: [string, string | number]): [string, number] {
      this.#ns.print(`Checking server configuration validity...`);

      const [proposedServerName, proposedRamSize]: [string, string | number] = serverConfiguration;

      let ramSize: number = this.convertRamSize(proposedRamSize);
      const isRamSizeValid: boolean = this.checkRamSizeValidity(ramSize);
      if (!isRamSizeValid) ramSize = this.fixRamSize(ramSize);

      let serverName: string = proposedServerName;
      const isNameValid: boolean = this.checkServerNameValidity(serverName, ramSize);
      if (!isNameValid) serverName = this.fixServerName(serverName);

      if (isNameValid && isRamSizeValid) {
         this.#ns.print(` Check server configuration: PASSED (${serverName}, ${ramSize})`);
      }

      if (!isNameValid && !isRamSizeValid) {
         this.#ns.print(` Check Server configuration: FAILED - WARNING auto updated to "${serverName}, ${ramSize}"`);
      }

      return [serverName, ramSize];
   }

   private checkServerNameValidity(proposedServerName: string, ramSize: number): boolean {
      const allHostnames: string[] = getAllHostnames(this.#ns);

      if (!allHostnames.includes(proposedServerName)) {
         this.#ns.print(` Check server name: PASSED (transaction: BUY)`);
         return true;
      }

      if (this.#ns.getPurchasedServerUpgradeCost(proposedServerName, ramSize) === -1) {
         this.#ns.print(` Check server name: FAILED - server name is not free.`);
         return false;
      }

      this.#ns.print(` Check server name: PASSED (transaction: UPGRADE)`);
      this.operation = Operation.UPGRADE;
      return true;
   }

   private fixServerName(proposedServerName: string): string {
      const allPurchasedServerNames: string[] = getAllHostnames(this.#ns).filter((hostname: string): boolean =>
         hostname.includes('psrv-')
      );

      const category: string = proposedServerName.split('-')[1].slice(0, 2);
      const sameCategoryServers: string[] = allPurchasedServerNames.filter((server: string) =>
         server.includes(category)
      );

      if (!sameCategoryServers.includes(proposedServerName)) {
         return proposedServerName;
      }

      const maxId: number = Math.max(
         ...sameCategoryServers.map((server: string) => parseInt(server.split('-')[1].slice(2), 10))
      );

      return `psrv-${category}${String(maxId + 1).padStart(2, '0')}`;
   }

   private convertRamSize(proposedRamSize: string | number): number {
      let ramSize: number = 0;
      if (typeof proposedRamSize === 'number') ramSize = proposedRamSize;

      if (typeof proposedRamSize === 'string' && !proposedRamSize.includes('^')) {
         this.nsConsole.log(` Check RAM size: FAILED - format is not valid.`);
         return 0;
      }

      if (typeof proposedRamSize === 'string' && proposedRamSize.includes('^')) {
         const radix: number = parseInt(proposedRamSize.split('^')[0], 10);
         const exponent: number = parseInt(proposedRamSize.split('^')[1], 10);
         ramSize = radix ** exponent;
      }

      return ramSize;
   }

   private checkRamSizeValidity(ramSize: number): boolean {
      const absMaxRam: number = this.#ns.getPurchasedServerMaxRam();
      const absExp: number = Math.log2(absMaxRam);

      if (!this.isPowerOfTwo(ramSize)) {
         this.nsConsole.log(` Check RAM size: FAILED - should be an exponent of 2.`);
         return false;
      }

      if (ramSize < 1 || ramSize > absMaxRam) {
         this.nsConsole.log(` Check RAM size: FAILED - should be between 1 and 2^${absExp} (${absMaxRam}) GB.`);
         return false;
      }

      this.nsConsole.log(` Check RAM size: PASSED`);
      return true;
   }

   private fixRamSize(proposedRamSize: number): number {
      let ramSize: number = 0;

      const absMaxRam: number = this.#ns.getPurchasedServerMaxRam();

      if (!this.isPowerOfTwo(proposedRamSize)) {
         ramSize = this.getNearestPowerOfTwo(proposedRamSize);
      }

      if (ramSize < 1 || ramSize > absMaxRam) {
         ramSize = absMaxRam;
      }

      if (proposedRamSize !== ramSize)
         this.#ns.print(
            `  WARNING - RAM size has been set to the nearest valid value: 2^${Math.log2(ramSize)} (${ramSize}) GB.`
         );

      return ramSize;
   }

   private isPowerOfTwo(n: number): boolean {
      // eslint-disable-next-line no-bitwise
      return n > 0 && (n & (n - 1)) === 0;
   }

   private getNearestPowerOfTwo(n: number): number {
      const exponent: number = Math.round(Math.log2(n));
      return 2 ** exponent;
   }
}
