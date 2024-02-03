import { NS as INs } from '@ns';

export class NsConsole {
   readonly #active: boolean;
   readonly #ns: INs;

   constructor(ns: INs, title: string, active: boolean = false) {
      this.#ns = ns;
      this.#active = active;

      if (active) {
         this.activate(title);
      }
   }

   activate(title: string): void {
      this.#ns.disableLog('ALL');
      this.#ns.clearLog();
      this.#ns.setTitle(title);
      this.#ns.tail();
   }

   log(...args: string[]): void {
      if (!this.#active) return;

      this.#ns.print(...args);
      console.log(...args);
   }

   tlog(...args: string[]): void {
      this.#ns.tprint(...args);

      if (!this.#active) return;
      this.#ns.print(...args);
      console.log(...args);
   }
}
