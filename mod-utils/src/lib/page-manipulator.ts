import { NS as INs } from '@ns';

export class PageManipulator {
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
      let objKey: string = '';
      try {
         objKey = Object.keys(obj)[1];
      } catch (e) {
         console.log(e);
         console.log(obj);
         debugger;
      }
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

   refreshPage(): void {
      eval('window').location.reload();
   }
}

interface IPageReactComponent {
   onChange: (obj: object) => void;
   onKeyDown: (obj: object) => void;
   onClick: (obj: object) => Promise<void>;
}
