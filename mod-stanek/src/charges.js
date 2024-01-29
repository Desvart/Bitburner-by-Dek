/** @param {NS} ns */
export async function main(ns) {

   const runnerName = 'pserv-stanek';

   ns.scp('stanek/charge-stanek.js', runnerName, 'home');
   ns.mv(runnerName, 'stanek/charge-stanek.js', 'charge-stanek.js')

   const maxRam = ns.getServerMaxRam(runnerName);
   const scriptRam = ns.getScriptRam('stanek/charge-stanek.js');
   const threadPerCharge = Math.floor(maxRam / scriptRam / 5);

   ns.exec('charge-stanek.js', runnerName, threadPerCharge, 0, 4);
   ns.exec('charge-stanek.js', runnerName, threadPerCharge, 3, 5);
   ns.exec('charge-stanek.js', runnerName, threadPerCharge, 5, 2);
   ns.exec('charge-stanek.js', runnerName, threadPerCharge, 1, 2);
   ns.exec('charge-stanek.js', runnerName, threadPerCharge, 1, 0);
}