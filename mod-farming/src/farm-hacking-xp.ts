import { AutocompleteData, NS as INs } from '@ns';
import { ArgSchemaType, FlagType } from '/resources/src/common-types';
import { NsConsole } from '/mod-utils/src/lib/ns-console';

/** @param {NS} ns */
export async function main(ns: INs): Promise<void> {
   const args: FlagType = ns.flags(argsSchema);
   const nsConsole: NsConsole = new NsConsole(ns, 'Farmin XP', args.logs as boolean);

   const runnerName: string = (ns.args[1] as string) || 'psrv-xp01';
   const targetName: string = (ns.args[0] as string) || 'foodnstuff';

   if (!ns.scan('home').includes(runnerName)) {
      nsConsole.log('Farming server not found.');

      nsConsole.log('Attempt to purchase one...');
      const maxRam: number = ns.getPurchasedServerMaxRam();
      if (ns.getServerMoneyAvailable('home') < ns.getPurchasedServerCost(maxRam)) {
         nsConsole.log('ERROR: Not enough money to purchase a server.');
         return;
      }

      ns.purchaseServer(runnerName, maxRam);
      nsConsole.log('Farm server purchased.');

      nsConsole.log('Setting up server....');
      ns.scp('xp/expl-wk.js', runnerName, 'home');
      ns.mv(runnerName, 'xp/expl-wk.js', 'expl-wk.js');
      nsConsole.log('Server setup complete');
   }

   const runnerMaxRam: number = ns.getServerMaxRam(runnerName);
   const maxWkThreads: number = Math.floor(runnerMaxRam / 1.75);
   const threadCountPerRun: number = Math.floor(maxWkThreads * 0.1);

   const initTime: number = ns.getWeakenTime(targetName);
   nsConsole.tlog(`Initial warmup time: ${initTime / 1000} seconds`);
   nsConsole.log('XP farming started (infinite loop)...');

   while (true) {
      ns.exec('expl-wk.js', runnerName, threadCountPerRun, targetName, threadCountPerRun);
      // eslint-disable-next-line no-await-in-loop
      await ns.sleep(50);
   }
}

const argsSchema: ArgSchemaType[] = [['logs', false]];

export function autocomplete(data: AutocompleteData): string[] {
   return [...data.servers];
}
