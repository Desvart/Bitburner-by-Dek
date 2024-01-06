/**
 * This script continuously monitors a specific server on multiple parameters. Useful for creating hacking scripts.
 * Money: actual value / max value (% of actual value relative to the total value)
 * Sec.: actual security / minimum security
 * Hack: number of seconds to hack the server (number of threads to hack the total amount of actual money)
 * Grow: number of seconds to grow the server to its maximum amount from the actual value (number of threads to grow the server)
 * Weaken: number of seconds to weaken the server to its minimum amount from the actual value (number of threads to weaken the server)
 *
 * @param {targetName: string} - The hostname of the server to monitor
 * @param {refreshRate: number} - Refresh rate of the monitored information in milliseconds. Default: 1000 ms
 */

// TODO: refactor the script to extract the server data getter into a Server class and the formatting into a ServerToString class

import { AutocompleteData, NS as INs, Server as INsServer } from '@ns';

/** @param {NS} ns */
export async function main(ns: INs): Promise<void> {
   const targetName: string = String(ns.args[0]);
   const REFRESH_RATE: number = Number(ns.args[1] ?? 1000); // ms

   ns.tail();
   ns.setTitle(`Server Monitor - ${targetName}`);
   ns.resizeTail(500, 230);
   ns.moveTail(1215, 0);
   ns.disableLog('ALL');

   // Server static data
   let server: INsServer = ns.getServer(targetName);
   const maxMoney: number = server.moneyMax as number;
   const maxMoneyStr: string = ns.formatNumber(maxMoney, 3, 1000, true);
   const minSec: number = server.minDifficulty as number;
   const minSecStr: string = minSec.toFixed(2);

   while (!exitCondidition()) {
      server = ns.getServer(targetName);
      const homeCoresCount: number = ns.getServer('home').cpuCores;

      const money: number = Math.max(server.moneyAvailable as number, 1);
      const moneyStr: string = ns.formatNumber(money, 3, 1000, true);
      const moneyRatioStr: string = `${((money / maxMoney) * 100).toFixed(2)}%`;

      const sec: number = server.hackDifficulty as number;
      const secStr: string = sec.toFixed(2);
      const secDeltaStr: string = (sec - minSec).toFixed(2);

      const hackDuration: number = ns.getHackTime(targetName);
      const hackTimeStr: string = formatDuration(hackDuration);
      const hackThreadsStr: string = ns.hackAnalyzeThreads(targetName, money).toFixed();

      const growTimeStr: string = formatDuration(hackDuration * 3.2);
      const growThreadsStr: string = ns.growthAnalyze(targetName, maxMoney / money).toFixed();
      const growThreadsHomeStr: string = ns.growthAnalyze(targetName, homeCoresCount).toFixed();

      const weakenTimeStr: string = formatDuration(hackDuration * 4);
      const secDeltaPerWeaken: number = ns.weakenAnalyze(1);
      const weakenThreadsStr: string = ((sec - minSec) / secDeltaPerWeaken).toFixed();
      const secDeltaPerWeakenHome: number = ns.weakenAnalyze(1, homeCoresCount);
      const weakenThreadsHomeStr: string = ((sec - minSec) / secDeltaPerWeakenHome).toFixed();

      const ramRatioStr: string = `${((server.ramUsed / server.maxRam) * 100).toFixed(2)}%`;
      const hackChance: string = `${(ns.hackAnalyzeChance(targetName) * 100).toFixed(2)}%`;

      ns.clearLog();
      ns.print(server.hostname);
      ns.print(` money      : ${moneyStr} / ${maxMoneyStr} (${moneyRatioStr})`);
      ns.print(` sec.       : ${secStr} / ${minSecStr} (+${secDeltaStr})`);
      ns.print(` hack       : ${hackTimeStr} (threads = ${hackThreadsStr})`);
      ns.print(` grow       : ${growTimeStr} (threads = ${growThreadsStr} or ${growThreadsHomeStr})`);
      ns.print(` weaken     : ${weakenTimeStr} (threads = ${weakenThreadsStr} or ${weakenThreadsHomeStr})`);
      ns.print(` RAM (U/T)  : ${server.ramUsed}GB / ${server.maxRam}GB (${ramRatioStr})`);
      ns.print(` hackChance : ${hackChance}`);

      // eslint-disable-next-line no-await-in-loop
      await ns.sleep(REFRESH_RATE);
   }
}

function exitCondidition(): boolean {
   return false;
}

function formatDuration(milliseconds: number): string {
   const hours = Math.floor(milliseconds / 3600000); // 1 hour = 3600000 milliseconds
   const minutes = Math.floor((milliseconds % 3600000) / 60000); // 1 minute = 60000 milliseconds
   const seconds = Math.floor((milliseconds % 60000) / 1000); // 1 second = 1000 milliseconds
   const millis = Math.round(milliseconds % 1000);

   // Pad the values to the desired format
   const formattedHours = hours.toString().padStart(2, '0');
   const formattedMinutes = minutes.toString().padStart(2, '0');
   const formattedSeconds = seconds.toString().padStart(2, '0');
   const formattedMillis = millis.toString().padStart(3, '0');

   return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMillis}`;
}

export function autocomplete(data: AutocompleteData): string[] {
   return [...data.servers];
}
