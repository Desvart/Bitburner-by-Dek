import { NS as INs } from '@ns';
import { NsConsole } from '/mod-utils/src/lib/ns-console';
import { PageManipulator } from '/mod-utils/src/lib/page-manipulator';

export class Darkweb {
   readonly #torRouterCost: number = 200e3;
   readonly #portBypassesCost: number = 500e3 + 1.5e6 + 5e6 + 30e6 + 250e6;
   readonly #formulasCost: number = 5e9;

   readonly #nsConsole: NsConsole;
   readonly #ns: INs;

   constructor(ns: INs, nsConsole: NsConsole) {
      this.#ns = ns;
      this.#nsConsole = nsConsole;
   }

   async attemptToPurchaseTorRouter(): Promise<void> {
      this.#nsConsole.log('Attempting to purchase TOR router...');

      if (this.checkIfTorPurchased()) {
         this.#nsConsole.log('TOR router already purchased.');
         return;
      }

      await this.solvencyCheck(this.#torRouterCost);
      await this.purchaseTorRouter();
      await this.waitForTorRouterPurchaseConfirmation();
   }

   private checkIfTorPurchased(): boolean {
      const neighbourHostnames: string[] = this.#ns.scan('home');
      return neighbourHostnames.includes('darkweb');
   }

   private async purchaseTorRouter(): Promise<void> {
      const pageManipulator: PageManipulator = new PageManipulator(this.#ns);
      await pageManipulator.securedClick("//div[(@role = 'button') and (contains(., 'City'))]");
      await pageManipulator.securedClick("//span[@aria-label = 'Alpha Enterprises']");
      await pageManipulator.securedClick("//button[contains(., 'Purchase TOR router')]");
      await this.#ns.sleep(500);
      await pageManipulator.securedClick('/html/body/div[2]/div[3]/button');
      await this.#ns.sleep(500);
      await pageManipulator.securedClick("//div[(@role = 'button') and (contains(., 'Terminal'))]");
   }

   private async waitForTorRouterPurchaseConfirmation(callId: number = 1): Promise<void> {
      this.#nsConsole.log('Waiting for TOR router purchase confirmation...');

      if (callId > 9) {
         this.#nsConsole.log(`ERROR - Purchase couldn't be confirmed.`);
         this.#ns.exit();
      }

      if (!this.#ns.scan('home').includes('darkweb')) {
         await this.#ns.sleep(1e3);
         this.#nsConsole.log(`${callId}/9 - Purchase not confirmed yet...`);
         await this.waitForTorRouterPurchaseConfirmation(callId + 1);
      }

      if (this.#ns.scan('home').includes('darkweb')) {
         this.#nsConsole.log('Purchase confirmed.');
      }
   }

   async attemptToPurchasePortBypass(): Promise<void> {
      this.#nsConsole.log('Attempting to purchase 5 port bypasses...');

      if (this.getPurchasableWorms().length === 0) {
         this.#nsConsole.log('Port bypasses already purchased.');
         return;
      }

      await this.solvencyCheck(this.#portBypassesCost);
      this.purchasePortBypasses();
      await this.waitForPortBypassesPurchaseConfirmation();
   }

   private getPurchasableWorms(): string[] {
      const allWorms: string[] = [
         'NUKE.exe',
         'BruteSSH.exe',
         'FTPCrack.exe',
         'relaySMTP.exe',
         'HTTPWorm.exe',
         'SQLInject.exe',
      ];

      const ownedExe: string[] = this.#ns.ls('home', '.exe');

      const purchasableWorms: string[] = [];
      allWorms.forEach((worm: string): void => {
         if (ownedExe.includes(worm)) {
            this.#ns.print(`${worm} already purchased.`);
            return;
         }
         purchasableWorms.push(worm);
      });
      return purchasableWorms;
   }

   private purchasePortBypasses(): void {
      const pageManipulator: PageManipulator = new PageManipulator(this.#ns);
      const purchasableWorms: string[] = this.getPurchasableWorms();

      pageManipulator.sendCommandToTerminal(`home; connect darkweb;`);
      purchasableWorms.forEach((portBypass: string): void => {
         pageManipulator.sendCommandToTerminal(`buy ${portBypass};`);
         this.#nsConsole.log(`${portBypass} purchased.`);
      });
      pageManipulator.sendCommandToTerminal(`home;`);
   }

   private async waitForPortBypassesPurchaseConfirmation(callId: number = 1): Promise<void> {
      this.#nsConsole.log('Waiting for 5 port bypasses purchase confirmation...');

      if (callId > 9) {
         this.#nsConsole.log(`ERROR - Purchases couldn't be confirmed.`);
         this.#ns.exit();
      }

      if (this.getPurchasableWorms().length !== 0) {
         await this.#ns.sleep(1e3);
         this.#nsConsole.log(`${callId}/9 - Purchase not confirmed yet...`);
         await this.waitForTorRouterPurchaseConfirmation(callId + 1);
      }

      if (this.getPurchasableWorms().length === 0) {
         this.#nsConsole.log('Purchases confirmed.');
      }
   }

   async attemptToPurchaseFormulas(): Promise<void> {
      this.#nsConsole.log('Attempting to purchase formulas package...');

      if (this.#ns.ls('home', '.exe').includes('Formulas.exe')) {
         this.#nsConsole.log('Formulas package already purchased.');
         return;
      }

      await this.solvencyCheck(this.#formulasCost);
      this.purchaseFormulasPackage();
      await this.waitForFormulasPackagePurchaseConfirmation();
   }

   private purchaseFormulasPackage(): void {
      const pageManipulator: PageManipulator = new PageManipulator(this.#ns);
      const softName: string = 'Formulas.exe';

      pageManipulator.sendCommandToTerminal(`home; connect darkweb; buy ${softName}; home;`);
      this.#nsConsole.log(`${softName} purchased.`);
   }

   private async waitForFormulasPackagePurchaseConfirmation(callId: number = 1): Promise<void> {
      this.#nsConsole.log('Waiting for Formulas package purchase confirmation...');

      if (callId > 9) {
         this.#nsConsole.log(`ERROR - Purchases couldn't be confirmed.`);
         this.#ns.exit();
      }

      if (!this.#ns.ls('home', '.exe').includes('Formulas.exe')) {
         await this.#ns.sleep(1e3);
         this.#nsConsole.log(`${callId}/9 - Purchase not confirmed yet...`);
         await this.waitForTorRouterPurchaseConfirmation(callId + 1);
      }

      if (this.#ns.ls('home', '.exe').includes('Formulas.exe')) {
         this.#nsConsole.log('Purchases confirmed.');
      }
   }

   private async solvencyCheck(purchaseCost: number): Promise<void> {
      const moneyAvailable: boolean = this.moneyAvailabilityCheck(purchaseCost);
      if (!moneyAvailable) this.#ns.exit();
   }

   private moneyAvailabilityCheck(purchaseCost: number): boolean {
      this.#nsConsole.log('Check solvency...');
      const money: number = this.#ns.getServerMoneyAvailable('home');
      if (money < purchaseCost) {
         this.#nsConsole.log('WARNING - Not enough money.');
         return false;
      }
      this.#nsConsole.log('Solvency check passed.');
      return true;
   }
}
