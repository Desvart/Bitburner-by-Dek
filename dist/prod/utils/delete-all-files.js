/** This script helps its user to clean up its network by deleting files on servers (remote or not).
 *
 * @param {hostnames: string[]} - The list of hostnames to clean-up. If empty, all servers but home are cleaned-up. If "ALL", then home is included.
 * @flag {contracts, c: boolean} - Whether to clean-up contracts or not. Default: false.
 * @flag {logs, l: boolean} - Whether to display logs or not. Default: false.
 *
 * @example: `run delete-all-files -l -c
 * @example: `run delete-all-files ALL -l -c
 * @example: `run delete-all-files foodnstuff sigma-cosmetics -l -c
 */
/** @param {NS} ns */
export async function main(ns) {
    const [targetToCleanUp, keepContract, displayLog] = processInputs(ns);
    console.log(`START cleaning up servers from all their files.`);
    console.log(`${buildWarningLog(targetToCleanUp, keepContract)}`);
    const serversToCleanUp = identifyServersToCleanUp(ns, targetToCleanUp);
    const fileDeletedCount = cleanUpServers(ns, serversToCleanUp, keepContract);
    displayProcessCompletionStatus(ns, displayLog, serversToCleanUp, keepContract, fileDeletedCount);
    console.log(`COMPLETION of cleaning up process.`);
}
export function autocomplete(data) {
    return [...data.servers];
}
function processInputs(ns) {
    const input = ns.flags([
        ['contracts', false],
        ['c', false],
        ['log', false],
        ['l', false],
    ]);
    const targetToCleanUp = input._;
    let keepContract = true;
    if (input.contracts || input.c) {
        keepContract = false;
    }
    let displayLog = false;
    if (input.log || input.l) {
        displayLog = true;
    }
    return [targetToCleanUp, keepContract, displayLog];
}
function buildWarningLog(targetToCleanup, keepContrat) {
    return `${buildContractWarningLog(keepContrat)} ${buildHomeWarningLog(targetToCleanup)}.`;
}
function buildContractWarningLog(keepContract) {
    let contractWarningLog = 'Contracts will be KEPT.';
    if (!keepContract) {
        contractWarningLog = `Contracts will be DELETED.`;
    }
    return contractWarningLog;
}
function buildHomeWarningLog(targetToCleanup) {
    let homeWarningLog = 'Home is OUT OF SCOPE.';
    if (targetToCleanup.includes('ALL') || targetToCleanup.includes('home')) {
        homeWarningLog = `Home is IN SCOPE.`;
    }
    return homeWarningLog;
}
function identifyServersToCleanUp(ns, targetToCleanUp) {
    const allHostnames = getAllHostnames(ns);
    let hostnamesToCleanUp = [];
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
function getAllHostnames(ns, currentServer = 'home', scannedServer = ['home']) {
    const neighbourServers = ns.scan(currentServer);
    const serversToScan = getUnscannedServers(neighbourServers, scannedServer);
    serversToScan.forEach((server) => {
        scannedServer.push(server);
        getAllHostnames(ns, server, scannedServer);
    });
    return scannedServer;
}
function getUnscannedServers(hostnames, scannedServer) {
    return hostnames.filter((hostname) => !scannedServer.includes(hostname));
}
function moveHomeToLastPosition(allHostnames) {
    const hostnamesToCleanUp = removeServerFromList(allHostnames, 'home');
    hostnamesToCleanUp.push('home');
    return hostnamesToCleanUp;
}
function removeServerFromList(hostnames, server) {
    return hostnames.filter((hostname) => hostname !== server);
}
function checkSpecificHostnamesExists(targetToCleanUp, allHostnames) {
    const hostnamesToCleanUp = [];
    targetToCleanUp.forEach((hostname) => {
        if (!allHostnames.includes(hostname)) {
            console.warn(`${hostname} is not a valid server.`);
            return;
        }
        hostnamesToCleanUp.push(hostname);
    });
    return hostnamesToCleanUp;
}
function cleanUpServers(ns, serversToCleanUp, keepContract) {
    let fileDeletedCount = 0;
    serversToCleanUp.forEach((hostname) => {
        fileDeletedCount += cleanUpServer(ns, hostname, keepContract);
    });
    return fileDeletedCount;
}
function cleanUpServer(ns, hostname, keepContract) {
    console.log(`Deleting all files on ${hostname}.`);
    const [filesToDelete, filesToKeep] = classifyFilesBetweenKeepAndDelete(ns, hostname, keepContract);
    if (filesToDelete.length === 0) {
        console.log(`Server is already clean.`);
        return 0;
    }
    const filesDeletedCount = deleteFiles(ns, hostname, filesToDelete);
    checkProcessResolution(ns, hostname, filesToKeep);
    return filesDeletedCount;
}
function classifyFilesBetweenKeepAndDelete(ns, hostname, keepContract) {
    const filesToKeep = getFileToPreserve(ns, hostname, keepContract);
    const allFiles = getAllFilesOnServer(ns, hostname);
    const filesToDelete = identifyFileToDelete(allFiles, filesToKeep);
    return [filesToDelete, filesToKeep];
}
function getFileToPreserve(ns, hostname, keepContracts) {
    if (keepContracts) {
        return ns.ls(hostname, 'cct');
    }
    return [];
}
function getAllFilesOnServer(ns, hostname) {
    return ns.ls(hostname);
}
function identifyFileToDelete(allFiles, contracts) {
    return allFiles.filter((file) => !contracts.includes(file));
}
function deleteFiles(ns, hostname, filesToDelete) {
    let filesDeletedCount = 0;
    filesToDelete.forEach((file) => {
        const deletionStatus = ns.rm(file, hostname);
        if (!deletionStatus) {
            ns.print(`WARNING - Could not deleting file ${file} on ${hostname}.`);
            return;
        }
        filesDeletedCount += 1;
    });
    return filesDeletedCount;
}
function checkProcessResolution(ns, hostname, fileToKeep) {
    const remainingFiles = ns.ls(hostname);
    const remainingFilesCount = remainingFiles.length;
    const fileToKeepCount = fileToKeep.length;
    if (remainingFilesCount === fileToKeepCount) {
        console.log(`${hostname} is now clean.`);
        return;
    }
    if (remainingFilesCount > fileToKeepCount) {
        const fileNotDeleted = remainingFiles.filter((file) => !fileToKeep.includes(file));
        const fileNotDeletedCount = fileNotDeleted.length;
        const fileNotDeletedStr = fileNotDeleted.join(', ');
        console.warn(`${hostname} could not be cleansed. ${fileNotDeletedCount} files remaining: ${fileNotDeletedStr}.`);
    }
    if (remainingFilesCount < fileToKeepCount) {
        const missingFilesCount = fileToKeepCount - remainingFilesCount;
        console.error(`${hostname} could not be cleansed. ${missingFilesCount} contracts are missing.`);
    }
    ns.print(' ');
}
function displayProcessCompletionStatus(ns, displayLog, serversToCleanUp, keepContract, fileDeletedCount) {
    if (!displayLog) {
        return;
    }
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    let contractMsg = '0 contracts deleted.';
    if (!keepContract)
        contractMsg = 'All contracts deleted.';
    ns.print(`Clean up process completed on ${serversToCleanUp.length} servers:`);
    ns.print(`${serversToCleanUp.join(', ')}`);
    ns.print(`${fileDeletedCount} files deleted; ${contractMsg}`);
}
