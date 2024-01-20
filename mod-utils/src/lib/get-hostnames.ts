import { NS as INs } from '@ns';

export function getAllHostnames(ns: INs, currentServer: string = 'home', scannedServer: string[] = ['home']): string[] {
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
