import { ActiveFragment, NS as INs } from '@ns';

const CHARGE_SCRIPT_NAME: string = 'charge-stanek.js';
const CHARGE_SCRIPT_PATH: string = `stanek/${CHARGE_SCRIPT_NAME}`;
const SERVER_ROOT_NAME: string = 'pserv-stanek';
const HOME_SERVER_NAME: string = 'home';
const STANEK_ID_THRESHOLD: number = 100;

/** @param {NS} ns */
export function main(ns: INs): void {
   if (ns.stanek.activeFragments().length === 0) fillStanek(ns);
   const fragmentsToCharge: ActiveFragment[] = getFragmentsToCharge(ns);

   const runners: string[] = ns.scan(HOME_SERVER_NAME);
   fragmentsToCharge.forEach((fragment: ActiveFragment): void => {
      const runnerName: string = `${SERVER_ROOT_NAME}${fragment.id}`;
      buyRunnerIfMissing(ns, runnerName, runners);
      const threadPerCharge: number = getMaxAvailableThreads(ns, runnerName);
      ns.exec(CHARGE_SCRIPT_NAME, runnerName, threadPerCharge, fragment.x, fragment.y);
   });
}

function fillStanek(ns: INs) {
   hackingSpec7x7.forEach((fragment) => {
      ns.stanek.placeFragment(fragment.x, fragment.y, fragment.rotation, fragment.id);
   });
}

function getFragmentsToCharge(ns: INs): ActiveFragment[] {
   return ns.stanek.activeFragments().filter((fragment: ActiveFragment): boolean => fragment.id < STANEK_ID_THRESHOLD);
}

function buyRunnerIfMissing(ns: INs, runnerName: string, runners: string[]): void {
   if (!runners.includes(runnerName)) {
      ns.purchaseServer(runnerName, ns.getPurchasedServerMaxRam());
      ns.scp(CHARGE_SCRIPT_PATH, runnerName, HOME_SERVER_NAME);
      ns.mv(runnerName, CHARGE_SCRIPT_PATH, CHARGE_SCRIPT_NAME);
   }
}

function getMaxAvailableThreads(ns: INs, runnerName: string): number {
   const maxRam: number = ns.getServerMaxRam(runnerName);
   const scriptRam: number = ns.getScriptRam(CHARGE_SCRIPT_PATH);
   return Math.floor(maxRam / scriptRam);
}

const hackingSpec7x7 = [
   { id: 7, x: 0, y: 4, rotation: 0, effect: '+x% grow() power' },
   { id: 20, x: 3, y: 5, rotation: 0, effect: '+x% hacknet production' },
   { id: 25, x: 5, y: 2, rotation: 3, effect: '+x% reputation from factions and companies' },
   { id: 103, x: 0, y: 3, rotation: 2, effect: '1.1x adjacent fragment power' },
   { id: 107, x: 3, y: 2, rotation: 2, effect: '1.1x adjacent fragment power' },
   { id: 5, x: 1, y: 2, rotation: 0, effect: '+x% faster hack(), grow(), and weaken()' },
   { id: 101, x: 0, y: 1, rotation: 0, effect: '1.1x adjacent fragment power' },
   { id: 100, x: 4, y: 0, rotation: 0, effect: '1.1x adjacent fragment power' },
   { id: 6, x: 1, y: 0, rotation: 0, effect: '+x% hack() power' },
];
