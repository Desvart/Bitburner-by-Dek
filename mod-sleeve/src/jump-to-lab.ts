import { NS as INs } from '@ns';
import { PageManipulator } from '/mod-utils/src/lib/page-manipulator';

export async function main(ns: INs): Promise<void> {
   const pageManipulator: PageManipulator = new PageManipulator(ns);
   await pageManipulator.securedClick("//div[(@role = 'button') and (contains(., 'City'))]");
   await pageManipulator.securedClick("//span[@aria-label = 'VitaLife']");
   await pageManipulator.securedClick("//button[contains(., 'secret lab')]");
   await pageManipulator.securedClick("//p[contains(., 'Augmented Targeting I')]/../../div[2][(@role='button')]");
   await pageManipulator.securedClick("//button[contains(., 'Graft Augmentation (')]");
   await pageManipulator.securedClick("//button[contains(., 'Confirm')]");
   await pageManipulator.securedClick("//button[contains(., 'Do something else simultaneously')]");
   pageManipulator.sendCommandToTerminal(`warp --days 1;`);
   await ns.sleep(20);
   pageManipulator.sendCommandToTerminal(`j`);
}
