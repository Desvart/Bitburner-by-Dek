import { NS as INs } from '@ns';

/** @param {NS} ns */
export async function main(ns: INs): Promise<void> {
   const targetName: string = ns.args[0] as string;
   const threadCount: number = (ns.args[1] as number) || 1;
   const delay: number = (ns.args[2] as number) || 0;

   await ns.weaken(targetName, { threads: threadCount, additionalMsec: delay });
}
