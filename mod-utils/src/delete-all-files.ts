/**
 * This script helps its user to clean up its network by deleting files on servers (remote or not).
 *
 * @param {hostnames: string[]} - The list of hostnames to clean-up. If empty, all servers but home are cleaned-up. If "ALL", then home is included.
 * @param {-contracts || -c: boolean} Flags - Whether to clean-up contracts or not. Default: false.
 * @param {-logs || -l: boolean} Flags - Whether to display logs or not. Default: false.
 *
 * @example: `run delete-all-files -l -c
 * @example: `run delete-all-files ALL -l -c
 * @example: `run delete-all-files foodnstuff sigma-cosmetics -l -c
 */

import { AutocompleteData, NS as INs } from '@ns';

/** @param {NS} ns */
export async function main(ns: INs): Promise<void> {
   const [targetToCleanUp, keepContract, displayLog] = processInputs(ns);

   console.log(`START cleaning up servers from all their files.`);
   console.log(`${buildWarningLog(targetToCleanUp, keepContract)}`);

   const serversToCleanUp: string[] = identifyServersToCleanUp(ns, targetToCleanUp);
   const fileDeletedCount: number = cleanUpServers(ns, serversToCleanUp, keepContract);

   displayProcessCompletionStatus(ns, displayLog, serversToCleanUp, keepContract, fileDeletedCount);
   console.log(`COMPLETION of cleaning up process.`);
}

export function autocomplete(data: AutocompleteData): string[] {
   return [...data.servers];
}

function processInputs(ns: INs): [string[], boolean, boolean] {
   const input = ns.flags([
      ['contracts', false],
      ['c', false],
      ['log', false],
      ['l', false],
   ]);

   const targetToCleanUp: string[] = input._ as string[];

   let keepContract: boolean = true;
   if (input.contracts || input.c) {
      keepContract = false;
   }

   let displayLog: boolean = false;
   if (input.log || input.l) {
      displayLog = true;
   }

   return [targetToCleanUp, keepContract, displayLog];
}

function buildWarningLog(targetToCleanup: string[], keepContrat: boolean): string {
   return `${buildContractWarningLog(keepContrat)} ${buildHomeWarningLog(targetToCleanup)}.`;
}

function buildContractWarningLog(keepContract: boolean): string {
   let contractWarningLog: string = 'Contracts will be KEPT.';
   if (!keepContract) {
      contractWarningLog = `Contracts will be DELETED.`;
   }
   return contractWarningLog;
}

function buildHomeWarningLog(targetToCleanup: string[]): string {
   let homeWarningLog: string = 'Home is OUT OF SCOPE.';
   if (targetToCleanup.includes('ALL') || targetToCleanup.includes('home')) {
      homeWarningLog = `Home is IN SCOPE.`;
   }
   return homeWarningLog;
}

function identifyServersToCleanUp(ns: INs, targetToCleanUp: string[]): string[] {
   const allHostnames: string[] = getAllHostnames(ns);

   let hostnamesToCleanUp: string[] = [];

   // if hostnames is "ALL", then delete all files on all servers, home included
   if (targetToCleanUp.includes('ALL')) {
      hostnamesToCleanUp = moveHomeToLastPosition(allHostnames);
   }

   // if hostnames is known, then delete all files on said servers
   if (targetToCleanUp.length > 0 && !targetToCleanUp.includes('ALL')) {
      return checkSpecificHostnamesExists(targetToCleanUp, allHostnames);
   }

   // if hostnames is empty, then delete all files on all servers, home excluded
   if (targetToCleanUp.length === 0) {
      return removeServerFromList(allHostnames, 'home');
   }

   return hostnamesToCleanUp;
}

function getAllHostnames(ns: INs, currentServer = 'home', scannedServer = ['home']): string[] {
   const neighbourServers: string[] = ns.scan(currentServer);
   const serversToScan: string[] = getUnscannedServers(neighbourServers, scannedServer);
   serversToScan.forEach((server: string): void => {
      scannedServer.push(server);
      getAllHostnames(ns, server, scannedServer);
   });
   return scannedServer;
}

function getUnscannedServers(hostnames: string[], scannedServer: string[]): string[] {
   return hostnames.filter((hostname: string) => !scannedServer.includes(hostname));
}

function moveHomeToLastPosition(allHostnames: string[]): string[] {
   const hostnamesToCleanUp: string[] = removeServerFromList(allHostnames, 'home');
   hostnamesToCleanUp.push('home');
   return hostnamesToCleanUp;
}
function removeServerFromList(hostnames: string[], server: string): string[] {
   return hostnames.filter((hostname: string): boolean => hostname !== server);
}

function checkSpecificHostnamesExists(targetToCleanUp: string[], allHostnames: string[]): string[] {
   const hostnamesToCleanUp: string[] = [];

   targetToCleanUp.forEach((hostname: string): void => {
      if (!allHostnames.includes(hostname)) {
         console.warn(`${hostname} is not a valid server.`);
         return;
      }
      hostnamesToCleanUp.push(hostname);
   });

   return hostnamesToCleanUp;
}

function cleanUpServers(ns: INs, serversToCleanUp: string[], keepContract: boolean): number {
   let fileDeletedCount: number = 0;
   serversToCleanUp.forEach((hostname: string): void => {
      fileDeletedCount += cleanUpServer(ns, hostname, keepContract);
   });
   return fileDeletedCount;
}

function cleanUpServer(ns: INs, hostname: string, keepContract: boolean): number {
   console.log(`Deleting all files on ${hostname}.`);

   const [filesToDelete, filesToKeep] = classifyFilesBetweenKeepAndDelete(ns, hostname, keepContract);

   if (filesToDelete.length === 0) {
      console.log(`Server is already clean.`);
      return 0;
   }

   const filesDeletedCount: number = deleteFiles(ns, hostname, filesToDelete);

   checkProcessResolution(ns, hostname, filesToKeep);
   return filesDeletedCount;
}

function classifyFilesBetweenKeepAndDelete(ns: INs, hostname: string, keepContract: boolean): [string[], string[]] {
   const filesToKeep: string[] = getFileToPreserve(ns, hostname, keepContract);

   const allFiles: string[] = getAllFilesOnServer(ns, hostname);
   const filesToDelete: string[] = identifyFileToDelete(allFiles, filesToKeep);

   return [filesToDelete, filesToKeep];
}

function getFileToPreserve(ns: INs, hostname: string, keepContracts: boolean): string[] {
   if (keepContracts) {
      return ns.ls(hostname, 'cct');
   }
   return [];
}

function getAllFilesOnServer(ns: INs, hostname: string): string[] {
   return ns.ls(hostname);
}

function identifyFileToDelete(allFiles: string[], contracts: string[]): string[] {
   return allFiles.filter((file: string): boolean => !contracts.includes(file));
}

function deleteFiles(ns: INs, hostname: string, filesToDelete: string[]): number {
   let filesDeletedCount: number = 0;
   filesToDelete.forEach((file: string): void => {
      const deletionStatus: boolean = ns.rm(file, hostname);
      if (!deletionStatus) {
         ns.print(`WARNING - Could not deleting file ${file} on ${hostname}.`);
         return;
      }
      filesDeletedCount += 1;
   });
   return filesDeletedCount;
}

function checkProcessResolution(ns: INs, hostname: string, fileToKeep: string[]): void {
   const remainingFiles: string[] = ns.ls(hostname);
   const remainingFilesCount: number = remainingFiles.length;
   const fileToKeepCount: number = fileToKeep.length;

   if (remainingFilesCount === fileToKeepCount) {
      console.log(`${hostname} is now clean.`);
      return;
   }

   if (remainingFilesCount > fileToKeepCount) {
      const fileNotDeleted: string[] = remainingFiles.filter((file: string): boolean => !fileToKeep.includes(file));
      const fileNotDeletedCount: number = fileNotDeleted.length;
      const fileNotDeletedStr: string = fileNotDeleted.join(', ');
      console.warn(`${hostname} could not be cleansed. ${fileNotDeletedCount} files remaining: ${fileNotDeletedStr}.`);
   }

   if (remainingFilesCount < fileToKeepCount) {
      const missingFilesCount: number = fileToKeepCount - remainingFilesCount;
      console.error(`${hostname} could not be cleansed. ${missingFilesCount} contracts are missing.`);
   }
   ns.print(' ');
}

function displayProcessCompletionStatus(
   ns: INs,
   displayLog: boolean,
   serversToCleanUp: string[],
   keepContract: boolean,
   fileDeletedCount: number
): void {
   if (!displayLog) {
      return;
   }

   ns.tail();
   ns.disableLog('ALL');
   ns.clearLog();

   let contractMsg: string = '0 contracts deleted.';
   if (!keepContract) contractMsg = 'All contracts deleted.';
   ns.print(`Clean up process completed on ${serversToCleanUp.length} servers:`);
   ns.print(`${serversToCleanUp.join(', ')}`);
   ns.print(`${fileDeletedCount} files deleted; ${contractMsg}`);
}
