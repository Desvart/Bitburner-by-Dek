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
/** @param {NS} ns */
export async function main(ns) {
    const targetName = String(ns.args[0]);
    const REFRESH_RATE = Number(ns.args[1] ?? 1000); // ms
    ns.tail();
    ns.setTitle(`Server Monitor - ${targetName}`);
    ns.resizeTail(500, 230);
    ns.moveTail(1215, 0);
    ns.disableLog('ALL');
    // Server static data
    let server = ns.getServer(targetName);
    const maxMoney = server.moneyMax;
    const maxMoneyStr = ns.formatNumber(maxMoney, 3, 1000, true);
    const minSec = server.minDifficulty;
    const minSecStr = minSec.toFixed(2);
    while (!exitCondidition()) {
        server = ns.getServer(targetName);
        const homeCoresCount = ns.getServer('home').cpuCores;
        const money = Math.max(server.moneyAvailable, 1);
        const moneyStr = ns.formatNumber(money, 3, 1000, true);
        const moneyRatioStr = `${((money / maxMoney) * 100).toFixed(2)}%`;
        const sec = server.hackDifficulty;
        const secStr = sec.toFixed(2);
        const secDeltaStr = (sec - minSec).toFixed(2);
        const hackDuration = ns.getHackTime(targetName);
        const hackTimeStr = formatDuration(hackDuration);
        const hackThreadsStr = ns.hackAnalyzeThreads(targetName, money).toFixed();
        const growTimeStr = formatDuration(hackDuration * 3.2);
        const growThreadsStr = ns.growthAnalyze(targetName, maxMoney / money).toFixed();
        const growThreadsHomeStr = ns.growthAnalyze(targetName, homeCoresCount).toFixed();
        const weakenTimeStr = formatDuration(hackDuration * 4);
        const secDeltaPerWeaken = ns.weakenAnalyze(1);
        const weakenThreadsStr = ((sec - minSec) / secDeltaPerWeaken).toFixed();
        const secDeltaPerWeakenHome = ns.weakenAnalyze(1, homeCoresCount);
        const weakenThreadsHomeStr = ((sec - minSec) / secDeltaPerWeakenHome).toFixed();
        const ramRatioStr = `${((server.ramUsed / server.maxRam) * 100).toFixed(2)}%`;
        const hackChance = `${(ns.hackAnalyzeChance(targetName) * 100).toFixed(2)}%`;
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
function exitCondidition() {
    return false;
}
function formatDuration(milliseconds) {
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
export function autocomplete(data) {
    return [...data.servers];
}
