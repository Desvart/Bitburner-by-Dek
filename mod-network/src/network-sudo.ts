/**
 * Will seek out and root, copy files to all servers in the networks.
 *
 * @param {targetNames: string[]} - List of servers to attempt to root. If empty, will target all valid servers in the network.
 *
 * Based on script by Zharay (https://github.com/Zharay/BitburnerBotnet/blob/main/corpo.js)
 */

import { NS as INs, Server as INsServer } from '@ns';

/** @param {NS} ns */
export function main(ns: INs): void {
   ns.tail();
   ns.setTitle('Network sudo');
   ns.clearLog();
   ns.disableLog('ALL');

   ns.print('ATTEMPTING TO ROOT SERVERS... ');
   ns.print(' ');

   if (!checkAvailableHackingTools(ns)) {
      return;
   }

   const servers: Server[] = getTargetServers(ns);

   const serversToSetup: string[] = [];
   servers.forEach((server: Server): void => {
      ns.print(`Server found: ${server.hostname}`);
      const serverHacker: ServerHacker = new ServerHacker(ns);
      serverHacker.openPorts(server);
      const operationStatus: boolean = serverHacker.getRootAccess(server);
      if (operationStatus) serversToSetup.push(server.hostname);
   });

   ns.print(' ');
   ns.print('ATTEMPTING TO SETUP ROOTED SERVERS... ');
   ns.print(' ');

   serversToSetup.forEach((server: string): void => {
      new ServerSetuper(ns).setup(server);
   });
}

function checkAvailableHackingTools(ns: INs): boolean {
   if (!ns.fileExists('NUKE.exe', 'home')) {
      ns.print('ERROR: Missing NUKE.exe.');
      return false;
   }

   if (new ServerHacker(ns).portOpenerCount === 0) {
      ns.print('ERROR: Not enough (at least 1) port opener tools available');
      return false;
   }

   return true;
}

function getTargetServers(ns: INs): Server[] {
   const targetServerNames: string[] = ns.args as string[];
   const allServers: Server[] = new Network(ns).servers;

   if (targetServerNames.length === 0) return allServers.filter((server: Server) => !server.owned && !server.rooted);

   const allServerNames: string[] = allServers.map((server: Server) => server.hostname);
   const checkedTargetServers: string[] = targetServerNames.filter((server: string) => allServerNames.includes(server));

   const targetServers: Server[] = checkedTargetServers.map((server: string) => new Server(ns, server));

   const cleanedTargetServers: Server[] = targetServers.filter((server: Server) => !server.rooted);
   targetServers.forEach((server: Server): void => {
      if (server.rooted) {
         ns.print(`[${server.hostname}] Already rooted.`);
      }
   });
   return cleanedTargetServers;
}

class Network {
   servers: Server[];

   readonly #ns: INs;

   constructor(ns: INs) {
      this.#ns = ns;
      this.servers = this.getServers();
   }

   private getServers(): Server[] {
      const serverNames: string[] = this.getAllHostnames();
      return serverNames.map((serverName: string) => new Server(this.#ns, serverName));
   }

   private getAllHostnames(currentServer: string = 'home', scannedServer: string[] = ['home']): string[] {
      const neighbourServers: string[] = this.#ns.scan(currentServer);
      const serversToScan: string[] = this.getUnscannedServers(neighbourServers, scannedServer);
      serversToScan.forEach((server: string): void => {
         scannedServer.push(server);
         this.getAllHostnames(server, scannedServer);
      });
      return scannedServer;
   }

   private getUnscannedServers(hostnames: string[], scannedServer: string[]): string[] {
      return hostnames.filter((hostname: string) => !scannedServer.includes(hostname));
   }
}

class Server {
   readonly hostname: string;
   readonly portCount: number;
   readonly securityLevel: number;
   readonly owned: boolean = false;
   readonly rooted: boolean;

   #closedPortCount: number = Infinity;
   readonly #ns: INs;

   constructor(ns: INs, hostname: string) {
      this.#ns = ns;
      this.hostname = hostname;
      this.portCount = this.#ns.getServerNumPortsRequired(this.hostname);
      this.securityLevel = this.#ns.getServerSecurityLevel(this.hostname);
      this.owned = this.isServerOwned();
      this.rooted = this.#ns.hasRootAccess(this.hostname);
   }

   get closedPortCount(): number {
      const server: INsServer = this.#ns.getServer(this.hostname);

      if (server.openPortCount === undefined) {
         console.warn(`Server ${this.hostname} has no openPortCount property.`);
         return Infinity;
      }

      this.#closedPortCount = this.portCount - server.openPortCount;
      return this.#closedPortCount;
   }

   isServerOwned(): boolean {
      if (this.hostname === 'home') return true;

      return this.#ns.getPurchasedServers().includes(this.hostname);
   }
}

class ServerHacker {
   readonly portOpenerCount: number;

   readonly #ns: INs;

   constructor(ns: INs) {
      this.#ns = ns;
      this.portOpenerCount = this.getPortOpenerCount();
   }
   getPortOpenerCount(): number {
      let maxPorts: number = 0;
      if (this.#ns.fileExists('BruteSSH.exe', 'home')) maxPorts += 1;
      if (this.#ns.fileExists('FTPCrack.exe', 'home')) maxPorts += 1;
      if (this.#ns.fileExists('relaySMTP.exe', 'home')) maxPorts += 1;
      if (this.#ns.fileExists('HTTPWorm.exe', 'home')) maxPorts += 1;
      if (this.#ns.fileExists('SQLInject.exe', 'home')) maxPorts += 1;
      return maxPorts;
   }

   openPorts(server: Server): void {
      if (server.portCount > this.portOpenerCount) {
         this.#ns.print(
            `[${server.hostname}] Cannot be rooted at this time. (Open ports: ${this.portOpenerCount} / ${server.portCount})`
         );
         return;
      }

      this.#ns.print(`[${server.hostname}] Opening ports...`);
      let portsOpened: number = 0;

      if (this.#ns.fileExists('BruteSSH.exe', 'home')) {
         this.#ns.brutessh(server.hostname);
         portsOpened += 1;
      }

      if (this.#ns.fileExists('FTPCrack.exe', 'home')) {
         this.#ns.ftpcrack(server.hostname);
         portsOpened += 1;
      }

      if (this.#ns.fileExists('relaySMTP.exe', 'home')) {
         this.#ns.relaysmtp(server.hostname);
         portsOpened += 1;
      }

      if (this.#ns.fileExists('HTTPWorm.exe', 'home')) {
         this.#ns.httpworm(server.hostname);
         portsOpened += 1;
      }

      if (this.#ns.fileExists('SQLInject.exe', 'home')) {
         this.#ns.sqlinject(server.hostname);
         portsOpened += 1;
      }

      this.#ns.print(`[${server.hostname}] Ports ${portsOpened} / ${server.portCount} opened.`);
   }

   getRootAccess(server: Server): boolean {
      if (server.closedPortCount > 0) {
         this.#ns.print(
            `[${server.hostname}] Cannot be rooted at this time. (Open ports: ${this.portOpenerCount} / ${server.portCount})`
         );
         return false;
      }
      this.#ns.print(`[${server.hostname}] Sudo...`);
      this.#ns.nuke(server.hostname);
      this.#ns.print(`[${server.hostname}] Root access granted.`);
      return true;
   }
}

class ServerSetuper {
   readonly #ns: INs;

   constructor(ns: INs) {
      this.#ns = ns;
   }

   setup(targetName: string): void {
      this.#ns.print(`[${targetName}] Setting it up...`);
      this.killAllExistingProcess(targetName);
      this.copyFilesToServer(targetName);
      this.#ns.print(`[${targetName}] Setup completed.`);
   }

   killAllExistingProcess(targetName: string): void {
      this.#ns.print(`[${targetName}] KillAll command sent.`);
      this.#ns.killall(targetName);
   }

   copyFilesToServer(targetName: string): void {
      this.#ns.print(`[${targetName}] Uploading files...`);

      const files: string[] = [''];
      const status: boolean = this.#ns.scp(files, targetName, 'home');

      if (!status) {
         this.#ns.print(`[${targetName}] ERROR: File transfer failed!`);
         return;
      }
      this.#ns.print(`[${targetName}] Files uploaded.`);
   }
}
