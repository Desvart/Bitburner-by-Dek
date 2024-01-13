import { AutocompleteData, NS as INs } from '@ns';

/** @param {NS} ns */
export async function main(ns: INs): Promise<void> {
   ns.tail();
   ns.setTitle('Farm hacking XP');
   ns.clearLog();
   ns.disableLog('ALL');

   ns.print('ATTEMPTING TO BUY FARMING SERVER... ');
   ns.print(' ');

   // if (!ns.scan('home').includes('psrv-hxp')) {
   //    ns.print('Farming server not found. Attempt to purchase one...');
   //    const maxRam: number = ns.getPurchasedServerMaxRam();
   //    if (ns.getServerMoneyAvailable('home') < ns.getPurchasedServerCost(maxRam)) {
   //       ns.print('ERROR: Not enough money to purchase a server.');
   //       return;
   //    }
   //    ns.purchaseServer('psrv-hxp', maxRam);
   //    ns.print('Farming server purchased.');
   //    ns.print('Setting up server....');
   //    ns.scp('xp/expl-wk.js', 'psrv-hxp', 'home');
   //    ns.mv('psrv-hxp', 'xp/expl-wk.js', 'expl-wk.js');
   //    ns.print('Server ready.');
   //    ns.print(' ');
   // }

   const targetName: string = (ns.args[0] as string) || 'foodnstuff';
   // const runnerName: string = 'psrv-hxp';
   const runnerName: string = 'home';

   const runnerMaxRam: number = ns.getServerMaxRam(runnerName);
   const maxWkThreads: number = Math.floor(runnerMaxRam / 1.75);
   const threadCountPerRun: number = Math.floor(maxWkThreads * 0.1);

   ns.print('XP farming started (infinite loop)...');

   while (true) {
      ns.exec('xp/expl-wk.js', runnerName, threadCountPerRun, targetName, threadCountPerRun);
      // eslint-disable-next-line no-await-in-loop
      await ns.sleep(50);
   }
}

export function autocomplete(data: AutocompleteData): string[] {
   return [...data.servers];
}
