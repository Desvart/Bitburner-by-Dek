import { NS as INs } from '@ns';

export class NsConsole {
   readonly #active: boolean;
   readonly #ns: INs;

   constructor(ns: INs, active: boolean = false) {
      this.#ns = ns;
      this.#active = active;

      if (active) {
         this.activate();
      }
   }

   activate(): void {
      this.#ns.disableLog('ALL');
      this.#ns.clearLog();
      this.#ns.setTitle('Server Cleanup');
      this.#ns.tail();
   }

   log(...args: string[]): void {
      if (!this.#active) return;

      this.#ns.print(...args);
      console.log(...args);
   }
}
