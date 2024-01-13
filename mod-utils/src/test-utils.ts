import { NS as INs } from '@ns';

/** @param {NS} ns */
export async function main(ns: INs) {
   ns.tail();
   ns.disableLog('ALL');
   ns.clearLog();

   ns.print('Hello World!');
}
