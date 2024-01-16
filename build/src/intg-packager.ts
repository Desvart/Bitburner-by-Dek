import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies
import chokidar from 'chokidar';

class Watcher {
   #importFixer: ImportFixer;
   #releaser: Releaser;

   constructor(importFixer: ImportFixer, releaser: Releaser) {
      this.#importFixer = importFixer;
      this.#releaser = releaser;
   }

   async watchSrcFolderForJs(): Promise<void> {
      chokidar
         .watch(`mod-**/src/**/*.js`)
         .on('add', (newFileSrcPath: string): void => {
            console.log(`New JS file detected: ${newFileSrcPath}.`);
            this.processJsFile(newFileSrcPath);
         })
         .on('change', (modifiedFileSrcPath: string): void => {
            console.log(`File JS modification detected: ${modifiedFileSrcPath}.`);
            this.processJsFile(modifiedFileSrcPath);
         });
   }

   async watchCiFolderForJs(): Promise<void> {
      const ciDirectoryPath: string = this.getCiDirectoryPath();

      chokidar
         .watch(`${ciDirectoryPath}/**/*.js`)
         .on('add', (newFileCiPath: string): void => {
            console.log(`New transpiled file detected: ${newFileCiPath}.`);
            this.processTsFile(newFileCiPath);
         })
         .on('change', (modifiedFileCiPath: string): void => {
            console.log(`File transpiled modification detected: ${modifiedFileCiPath}.`);
            this.processTsFile(modifiedFileCiPath);
         });

      chokidar
         .watch(`mod-**/src/**/*.js`)
         .on('add', (newFileSrcPath: string): void => {
            console.log(`New JS file detected: ${newFileSrcPath}.`);
            this.processJsFile(newFileSrcPath);
         })
         .on('change', (modifiedFileSrcPath: string): void => {
            console.log(`File JS modification detected: ${modifiedFileSrcPath}.`);
            this.processJsFile(modifiedFileSrcPath);
         });
   }

   private getCiDirectoryPath(): string {
      const directory: string = process.argv[2];
      if (!directory) {
         console.log('Please provide a directory to clean up.');
         process.exit(1);
      }
      return directory;
   }

   private processTsFile(fileCiPath: string): void {
      const modifiedContent: string = this.#importFixer.fixImportPaths(fileCiPath);
      const fileIntgPath: string = this.#releaser.determineIntgFilePath(fileCiPath);
      this.#releaser.release(modifiedContent, fileIntgPath);
   }

   private processJsFile(fileSrcPath: string): void {
      const fileIntgPath: string = this.#releaser.determineIntgFilePath(fileSrcPath);
      const fileContent: string = fs.readFileSync(fileSrcPath, 'utf8');
      this.#releaser.release(fileContent, fileIntgPath);
   }
}

class ImportFixer {
   #importRegex: RegExp = /import\s+({[^}]*})\s+from\s+['"]\/mod-(.*?)\/src\/(.*?)['"];/g;

   fixImportPaths(fileCiPath: string): string {
      const originalFileContent: string = fs.readFileSync(fileCiPath, 'utf8');
      return originalFileContent.replace(this.#importRegex, 'import $1 from "/$2/$3";');
   }
}

class Releaser {
   #tsFileRegex: RegExp = /dist[\\/]ci[\\/]/;
   #jsFileRegex: RegExp = /mod-(.*?)[\\/]src[\\/]/;

   determineIntgFilePath(filePath: string): string {
      let newPath: string = '';
      if (filePath.includes(path.join('dist', 'ci'))) {
         newPath = filePath.replace(this.#tsFileRegex, path.join('dist', 'intg') + path.sep);
      }

      if (filePath.includes(`mod-`)) {
         newPath = filePath.replace(this.#jsFileRegex, `${path.join('dist', 'intg') + path.sep}$1${path.sep}`);
      }

      if (!newPath) {
         throw new Error(`Cannot determine integration file path from ${filePath}.`);
      }

      const newDirectoryPath: string = path.dirname(newPath);
      this.ensureDirectoryExists(newDirectoryPath);
      return newPath;
   }

   release(content: string, fileIntgPath: string): void {
      this.ensureDirectoryExists(fileIntgPath);
      this.releaseFile(content, fileIntgPath);
   }

   private ensureDirectoryExists(fileIntgPath: string) {
      const fileIntgDirectoryPath: string = path.dirname(fileIntgPath);
      if (!fs.existsSync(fileIntgDirectoryPath)) {
         fs.mkdirSync(fileIntgDirectoryPath, { recursive: true });
      }
   }

   private releaseFile(modifiedContent: string, fileIntgPath: string): void {
      fs.writeFileSync(fileIntgPath, modifiedContent, 'utf8');
   }
}

/* START SCRIPT ----------- */

const watcher: Watcher = new Watcher(new ImportFixer(), new Releaser());
watcher.watchCiFolderForJs();
watcher.watchSrcFolderForJs();

/* END SCRIPT ------------- */
