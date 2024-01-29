/**
 * This script is used to bootstrap the player's initial money available and combat stat.
 * It does that by starting a small job at FoodNStuff, then warping time forward to accumulate a lot of money. Once done
 * the script reset the warp time, stops working and refresh the game to start anew with a bootstrapped initial
 * situation.
 */

import { NS as INs } from '@ns';
import { PageManipulator } from '/mod-utils/src/lib/page-manipulator';

export async function main(ns: INs): Promise<void> {
   const pageManipulator: PageManipulator = new PageManipulator(ns);
   await pageManipulator.securedClick("//div[(@role = 'button') and (contains(., 'City'))]");
   await pageManipulator.securedClick("//span[@aria-label = 'FoodNStuff']");
   await pageManipulator.securedClick("//button[contains(., 'Apply to be an Employee')]");
   await ns.sleep(500);
   await pageManipulator.securedClick("//span[contains(., 'Congratulation')]/ancestor::div/button");
   await ns.sleep(500);
   await pageManipulator.securedClick("//button[contains(., 'Work')]");
   await pageManipulator.securedClick("//button[contains(., 'Do something else simultaneously')]");
   await pageManipulator.securedClick("//div[(@role = 'button') and (contains(., 'Terminal'))]");
   pageManipulator.sendCommandToTerminal(`warp --days 900000`);
   await ns.sleep(1000);
   await pageManipulator.securedClick("//button[contains(., 'Decide later')]");
   await pageManipulator.securedClick("//button[contains(., 'Focus')]");
   await pageManipulator.securedClick("//button[contains(., 'Stop working')]");
   await ns.sleep(500);
   await pageManipulator.securedClick("//span[contains(., 'finished working')]/ancestor::div/button");
   await ns.sleep(500);
   await pageManipulator.securedClick("//button[contains(., 'Quit')]");
   await pageManipulator.securedClick("//button[1][contains(., 'Quit')]");
   await pageManipulator.securedClick("//button[@aria-label = 'save game']");
   await ns.sleep(1000);
   pageManipulator.refreshPage();
   await ns.sleep(2000);
   await pageManipulator.securedClick("//span[contains(., 'Offline for')]/ancestor::div/button");
}
