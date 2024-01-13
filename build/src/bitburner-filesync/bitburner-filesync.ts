#!/usr/bin/env -S node

/** This whole module is a nearly untouched copy of the original [bitburner-filesync](https://www.npmjs.com/package/bitburner-filesync)
 * package. The only changes are to the config.ts file, which now is able to read different config files depending on an
 * input parameter. Useful to distinguish between different environments (integration, production, etc.).
 * The version from which this package was copied is 1.2.0-beta4.
 */

import { start } from './index.js';

await start();
