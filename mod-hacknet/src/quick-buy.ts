import { NS as INs } from '@ns';

export async function main(ns: INs): Promise<void> {
   for (let i = 0; i < 12; i++) {
      ns.hacknet.purchaseNode();
      ns.hacknet.upgradeLevel(i, 200);
      ns.hacknet.upgradeRam(i, 64);
      ns.hacknet.upgradeCore(i, 16);
   }
}
