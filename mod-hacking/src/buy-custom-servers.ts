import { NS as INs } from '@ns';

const SERVER_ROOT_NAME: string = 'pserv-hack';

/** @param {NS} ns */
export function main(ns: INs): void {
   const purchaseLimit: number = ns.getPurchasedServerLimit();
   const purchaseCount: number = ns.getPurchasedServers().length;
   const serversToBuyCount: number = purchaseLimit - purchaseCount;

   const maxRam: number = ns.getPurchasedServerMaxRam();

   for (let id = 0; id < serversToBuyCount; id++) {
      ns.purchaseServer(SERVER_ROOT_NAME + id, maxRam);
   }
}
