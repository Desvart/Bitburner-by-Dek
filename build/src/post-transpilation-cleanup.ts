import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies
import chokidar from 'chokidar';

/* START SCRIPT ----------- */
await postTranspilationCleanup();
/* END SCRIPT ------------- */

async function postTranspilationCleanup(): Promise<void> {
   const directory: string = getModuleName();
   watchCiFolder(directory);
}

function getModuleName(): string {
   const directory: string = process.argv[2];
   if (!directory) {
      console.log('Please provide a directory to clean up.');
      process.exit(1);
   }
   return directory;
}

async function watchCiFolder(directory: string): Promise<void> {
   chokidar
      .watch(`${directory}/**/*.js`)
      .on('add', (path1: string): void => {
         console.log(`New file detected: ${path1}.`);
         processFile(path1);
      })
      .on('change', (path2: string): void => {
         console.log(`File modification detected: ${path2}.`);
         processFile(path2);
      });
}

function processFile(filePath: string): void {
   const modifiedContent: string = fixImportPaths(filePath);
   const newFilePath: string = determineNewFilePath(filePath);
   fs.writeFileSync(newFilePath, modifiedContent, 'utf8');
}

function fixImportPaths(filePath: string): string {
   const originalFileContent: string = fs.readFileSync(filePath, 'utf8');
   const importRegex: RegExp = /import\s+({[^}]*})\s+from\s+['"]\/mod-(.*?)\/src\/(.*?)['"];/g;
   return originalFileContent.replace(importRegex, 'import $1 from "/$2/$3";');
}

function determineNewFilePath(filePath: string): string {
   if (filePath.includes('test-')) {
      return moveTestFileToTestFolder(filePath);
   }
   return moveFileToIntgFolder(filePath);
}

function moveTestFileToTestFolder(filePath: string): string {
   const fileName: string = path.basename(filePath);
   const newFileName: string = fileName.replace(/test-/, '');

   const newDirectoryPath: string = 'dist\\intg\\test\\';
   return path.join(newDirectoryPath, newFileName);
}

function moveFileToIntgFolder(filePath: string): string {
   return filePath.replace(/dist\\ci\\/, 'dist\\intg\\');
}
