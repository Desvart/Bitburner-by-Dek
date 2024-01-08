/**
 * If the player has enough money, this script will automatically buy the TOR router, all worm software and the
 * Formulas.exe software.
 *
 * Based on script by akelopes (https://github.com/akelopes/bitburner_scripts/blob/master/src/starters/buyExecutables.js)
 */

/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NS as INs } from '@ns';

/** @param {NS} ns */
export async function main(ns: INs): Promise<void> {
   ns.tail();
   ns.setTitle('Darkweb Purchases');
   ns.disableLog('ALL');
   ns.clearLog();

   const pageManipulator: PageManipulator = new PageManipulator(ns);

   if (ns.getServerMoneyAvailable('home') < 289e6) {
      ns.print('WARNING - Not enough money to buy TOR and all worms.');
   }

   await attemptToBuyTorRouter(ns, pageManipulator);
   await attemptToBuyWorms(ns, pageManipulator);

   if (ns.getServerMoneyAvailable('home') < 5e9) {
      ns.print('WARNING - Not enough money to buy Formulas.exe.');
   }

   await attemptToBuyFormulas(ns, pageManipulator);

   pageManipulator.sendCommandToTerminal(`cls;`);
   pageManipulator.sendCommandToTerminal(`do ns.ls('home','.exe');`);
}

async function attemptToBuyTorRouter(ns: INs, pageManipulator: PageManipulator): Promise<void> {
   ns.print('Attempting to purchase TOR router...');

   if (await checkIfTorPurchased(ns)) {
      ns.print('TOR router already purchased.');
      ns.print(' ');
      return;
   }

   const torRouterCost: number = 200e3;
   await waitForMoney(ns, torRouterCost);

   await pageManipulator.securedClick("//div[(@role = 'button') and (contains(., 'City'))]");
   await pageManipulator.securedClick("//span[@aria-label = 'Alpha Enterprises']");
   await pageManipulator.securedClick("//button[contains(., 'Purchase TOR router')]");
   await pageManipulator.securedClick('/html/body/div[3]/div[3]/button');
   await pageManipulator.securedClick("//div[(@role = 'button') and (contains(., 'Terminal'))]");

   if (!(await checkIfTorPurchased(ns))) {
      throw new Error("TOR router couldn't be purchased.");
   }
   ns.print('TOR router purchased.');
   ns.print(' ');
}

async function checkIfTorPurchased(ns: INs): Promise<boolean> {
   const neighbourHostnames: string[] = ns.scan('home');
   return neighbourHostnames.includes('darkweb');
}

async function waitForMoney(ns: INs, purchaseCost: number): Promise<void> {
   let money: number = ns.getServerMoneyAvailable('home');
   if (money < purchaseCost) {
      ns.print('WARNING - Not enough money.');
      ns.print(`Waiting to get ${purchaseCost} $ available...`);
      do {
         money = ns.getServerMoneyAvailable('home');
         // eslint-disable-next-line no-await-in-loop
         await ns.sleep(1e3);
      } while (money < purchaseCost);
      ns.print('Money now available.');
   }
}

async function attemptToBuyWorms(ns: INs, pageManipulator: PageManipulator): Promise<void> {
   ns.print('Attempting to purchase all worm software...');

   const purchasableWorms: string[] = getPurchasableWorms(ns);

   const wormsCost: number = 500e3 + 1.5e6 + 5e6 + 30e6 + 250e6;
   await waitForMoney(ns, wormsCost);

   // eslint-disable-next-line no-restricted-syntax
   for (const worm of purchasableWorms) {
      // do {
      pageManipulator.sendCommandToTerminal(`home; connect darkweb; buy ${worm}; home;`);
      // } while (!ns.fileExists(worm));
      ns.print(`${worm} purchased.`);
   }

   ns.print('All worms purchased.');
   ns.print(' ');
}

function getPurchasableWorms(ns: INs): string[] {
   const allWorms: string[] = [
      'NUKE.exe',
      'BruteSSH.exe',
      'FTPCrack.exe',
      'relaySMTP.exe',
      'HTTPWorm.exe',
      'SQLInject.exe',
   ];

   const ownedExe: string[] = ns.ls('home', '.exe');

   const purchasableWorms: string[] = [];
   allWorms.forEach((worm: string): void => {
      if (ownedExe.includes(worm)) {
         ns.print(`${worm} already purchased.`);
         return;
      }
      purchasableWorms.push(worm);
   });
   return purchasableWorms;
}

async function attemptToBuyFormulas(ns: INs, pageManipulator: PageManipulator): Promise<void> {
   ns.print('Attempting to purchase Formulas software...');

   const softName: string = 'Formulas.exe';

   const ownedExe: string[] = ns.ls('home', '.exe');

   if (ownedExe.includes(softName)) {
      ns.print(`${softName} already purchased.`);
      ns.print(' ');
      return;
   }

   const formulasCost: number = 5e9;
   await waitForMoney(ns, formulasCost);

   pageManipulator.sendCommandToTerminal(`home; connect darkweb; buy ${softName}; home;`);
   ns.print(`${softName} purchased.`);
   ns.print(' ');
}

class PageManipulator {
   #maxRetries: number = 10;
   readonly #initialRetryDelayMs: number = 50;
   readonly #backoffRate: number = 3;

   // eslint-disable-next-line no-eval, @typescript-eslint/dot-notation
   readonly #doc = eval('window')['document'];
   readonly #ns: INs;

   constructor(ns: INs) {
      this.#ns = ns;
   }

   async securedClick(xpath: string, expectFailure: boolean = false): Promise<void> {
      const component: IPageReactComponent = await this.findRetry(xpath, expectFailure);
      await this.click(component);
   }

   private async click(component: IPageReactComponent): Promise<void> {
      await component.onClick({ isTrusted: true });
   }

   private async findRetry(xpath: string, expectFailure: boolean): Promise<IPageReactComponent> {
      let errorContext: string = `Could not find the element with xpath: ${xpath}\nSomething may have re-routed the UI`;
      if (expectFailure) errorContext = `It's looking like the element with xpath: ${xpath} isn't present...`;

      try {
         return await this.autoRetry(() => this.find(xpath), expectFailure, errorContext);
      } catch (e) {
         if (!expectFailure) throw e;
      }

      return {} as IPageReactComponent;
   }

   private async autoRetry(
      fnFunctionThatMayFail: () => IPageReactComponent,
      expectFailure: boolean = false,
      errorContext: string = 'Success condition not met'
   ): Promise<IPageReactComponent> {
      if (expectFailure) {
         this.#maxRetries = 3;
      }

      let retryDelayMs: number = this.#initialRetryDelayMs;
      let attempts: number = 0;

      do {
         attempts += 1;

         const result: IPageReactComponent = fnFunctionThatMayFail();
         if (result !== undefined) {
            return result;
         }

         // eslint-disable-next-line no-await-in-loop
         retryDelayMs = await this.autoRetryManageError(attempts, retryDelayMs, errorContext);
      } while (attempts <= this.#maxRetries);

      return {} as IPageReactComponent;
   }

   private async autoRetryManageError(attempts: number, retryDelayMs: number, errorContext: string): Promise<number> {
      let errorMsg: string = `INFO - Attempt ${attempts} of ${this.#maxRetries} failed. Trying again in ${retryDelayMs}ms...`;
      const fatal: boolean = attempts >= this.#maxRetries;
      if (fatal) errorMsg = `FATAL - Attempt ${attempts} of ${this.#maxRetries} failed. ${errorContext}`;
      console.log(errorMsg);

      if (fatal) throw new Error(errorContext);

      await this.#ns.sleep(retryDelayMs);
      return retryDelayMs * this.#backoffRate;
   }

   private find(xpath: string): IPageReactComponent {
      const obj = this.#doc.evaluate(xpath, this.#doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      const objKey: string = Object.keys(obj)[1];
      if (!(objKey in obj)) {
         throw new Error(`Could not find terminal key: ${objKey}`);
      }
      return obj[objKey];
   }

   sendCommandToTerminal(command: string): void {
      this.sendCommandToTerminal0(command);
      this.sendCommandToTerminal0('');
   }

   private sendCommandToTerminal0(command: string): void {
      const terminalInput = this.#doc.getElementById('terminal-input');
      terminalInput.value = command;

      const terminalKey: string = Object.keys(terminalInput)[1];
      if (!(terminalKey in terminalInput)) {
         throw new Error(`Could not find terminal key: ${terminalKey}`);
      }
      const terminal: IPageReactComponent = terminalInput[terminalKey];

      terminal.onChange({ target: terminalInput });
      terminal.onKeyDown({ key: 'Enter', preventDefault: () => null });
   }
}

interface IPageReactComponent {
   onChange: (obj: object) => void;
   onKeyDown: (obj: object) => void;
   onClick: (obj: object) => Promise<void>;
}
