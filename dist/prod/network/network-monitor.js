export async function main(ns) {
    ns.tail();
    ns.setTitle('Network Monitor');
    ns.resizeTail(151, 1085);
    ns.moveTail(1734, 325);
    ns.disableLog('ALL');
    ns.clearLog();
    const refreshRate = ns.args[0] || 1000;
    const display = new Display(ns, refreshRate);
    await display.build();
    await display.show(new Network(ns));
}
class Display {
    ns;
    refreshRate;
    doc;
    anchor;
    anchorId = 'scanAnchor';
    tag;
    constructor(ns, refreshRate) {
        this.ns = ns;
        this.refreshRate = refreshRate;
        // eslint-disable-next-line no-eval
        this.doc = eval('document');
        this.anchor = `Refreshing every ${this.refreshRate / 1000} seconds...`;
        this.tag = this.doc.createElement('p');
    }
    async injectAnchorInLogWindow() {
        this.ns.print(this.anchor);
        await this.ns.sleep(200);
    }
    injectEmptyContainerBeforeAnchor() {
        const container = `<p class="MuiTypography-root MuiTypography-body1 css-cxl1tz" id="${this.anchorId}"></p>`;
        const xpath = `//span[contains(text(), "${this.anchor}")]`;
        const matchingElement = (this.doc.evaluate(xpath, this.doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue);
        matchingElement.insertAdjacentHTML('beforebegin', container);
        this.tag = this.doc.querySelector(`#${this.anchorId}`);
    }
    async build() {
        await this.injectAnchorInLogWindow();
        this.injectEmptyContainerBeforeAnchor();
    }
    updateDisplay(content) {
        this.tag.innerHTML = content;
    }
    async show(network) {
        const exitCondition = false;
        const networkHtml = new ConverterNetworkToHtml(network);
        do {
            this.updateDisplay(networkHtml.buildHTMLContent());
            // eslint-disable-next-line no-await-in-loop
            await this.ns.sleep(this.refreshRate);
        } while (!exitCondition);
    }
}
export class Network {
    ns;
    servers;
    constructor(ns) {
        this.ns = ns;
        this.servers = this.getServers();
    }
    getServers() {
        const serverNames = this.getServersName();
        return serverNames.map((serverName) => new Server(this.ns, serverName));
    }
    getServersName(currentNode = 'home', scannedServer = new Set()) {
        const neighbourServers = this.ns.scan(currentNode);
        const serversToScan = this.keepOnlyUnscannedServers(neighbourServers, scannedServer);
        serversToScan.forEach((serverName) => {
            scannedServer.add(serverName);
            this.getServersName(serverName, scannedServer);
        });
        return this.transformSetIntoArray(scannedServer);
    }
    keepOnlyUnscannedServers(serversName, scannedServer) {
        return serversName.filter((serverName) => !scannedServer.has(serverName));
    }
    transformSetIntoArray(scannedServer) {
        return Array.from(scannedServer.keys());
    }
}
export var AdminStatus;
(function (AdminStatus) {
    AdminStatus["BACKDOOR"] = "BACKDOOR";
    AdminStatus["ROOT"] = "ROOT";
    AdminStatus["HACKABLE"] = "HACKABLE";
    AdminStatus["LOCKED"] = "LOCKED";
})(AdminStatus || (AdminStatus = {}));
class Server {
    name;
    hackingLevel;
    totalPortCount;
    maxRam;
    minSecurity;
    maxMoney;
    growthFactor;
    #openPortCount = Infinity;
    #currentSecurity = Infinity;
    #currentMoney = 0;
    #hackDuration = Infinity;
    #hackChance = 0;
    #contractCount = 0;
    #adminStatus = AdminStatus.LOCKED;
    #hasRootAccess = false;
    #ns;
    constructor(ns, name) {
        this.#ns = ns;
        const serverData = this.#ns.getServer(name);
        this.name = name;
        this.hackingLevel = serverData.requiredHackingSkill ?? Infinity;
        this.totalPortCount = serverData.numOpenPortsRequired ?? Infinity;
        this.maxRam = serverData.maxRam ?? 0;
        this.minSecurity = serverData.minDifficulty ?? Infinity;
        this.maxMoney = serverData.moneyMax ?? 0;
        this.growthFactor = serverData.serverGrowth ?? 0;
    }
    get openPortCount() {
        this.#openPortCount = this.#ns.getServer(this.name).openPortCount ?? Infinity;
        return this.#openPortCount;
    }
    get currentSecurty() {
        this.#currentSecurity = this.#ns.getServer(this.name).hackDifficulty ?? Infinity;
        return this.#currentSecurity;
    }
    get currentMoney() {
        this.#currentMoney = this.#ns.getServer(this.name).moneyAvailable ?? 0;
        return this.#currentMoney;
    }
    get hackDuration() {
        this.#hackDuration = this.#ns.getHackTime(this.name);
        return this.#hackDuration;
    }
    get hackChance() {
        this.#hackChance = this.#ns.hackAnalyzeChance(this.name);
        return this.#hackChance;
    }
    get contractCount() {
        this.#contractCount = this.#ns.ls(this.name, '.cct').length;
        return this.#contractCount;
    }
    getHasRootAccess() {
        this.#hasRootAccess = this.#ns.getServer(this.name).hasAdminRights;
        return this.#hasRootAccess;
    }
    get adminStatus() {
        this.#adminStatus = AdminStatus.LOCKED;
        if (this.#ns.getHackingLevel() >= this.hackingLevel && getPortOpennerCount(this.#ns) >= this.totalPortCount)
            this.#adminStatus = AdminStatus.HACKABLE;
        if (this.getHasRootAccess())
            this.#adminStatus = AdminStatus.ROOT;
        if (this.#ns.getServer(this.name).backdoorInstalled || this.name === 'home')
            this.#adminStatus = AdminStatus.BACKDOOR;
        return this.#adminStatus;
    }
}
function getPortOpennerCount(ns) {
    let portOpennerCount = 0;
    if (ns.fileExists('BruteSSH.exe', 'home'))
        portOpennerCount += 1;
    if (ns.fileExists('FTPCrack.exe', 'home'))
        portOpennerCount += 1;
    if (ns.fileExists('relaySMTP.exe', 'home'))
        portOpennerCount += 1;
    if (ns.fileExists('HTTPWorm.exe', 'home'))
        portOpennerCount += 1;
    if (ns.fileExists('SQLInject.exe', 'home'))
        portOpennerCount += 1;
    return portOpennerCount;
}
class ConverterNetworkToHtml {
    servers;
    constructor(network) {
        this.servers = network.getServers();
    }
    buildHTMLContent() {
        this.sortNetworkForDisplayPurpose();
        return `<div style='font-size: 10px'>${this.buildServersContent()}</div>`;
    }
    sortNetworkForDisplayPurpose() {
        this.servers.sort((a, b) => {
            const aIsHome = a.name === 'home' ? 1 : 0;
            const bIsHome = b.name === 'home' ? 1 : 0;
            return bIsHome - aIsHome || a.hackingLevel - b.hackingLevel || a.maxMoney - b.maxMoney;
        });
    }
    buildServersContent() {
        let output = `<div style='font-size: 10px'>`;
        this.servers.forEach((server) => {
            const hackColor = this.getHackColor(server);
            const nameColor = this.getFactionColor(server);
            const hoverText = this.buildHoverText(server);
            let contractText = '';
            if (server.contractCount > 0) {
                contractText = `${server.contractCount}`;
            }
            output += this.buildServerHTML(server, hackColor, nameColor, hoverText, contractText);
        });
        return `${output}</div>`;
    }
    getHackColor(server) {
        // Color of the square in front of the server name.
        let hackColor = 'red'; // Red = no admin rights and not nukable
        hackColor = server.adminStatus === AdminStatus.HACKABLE ? '#FFD700' : hackColor; // Yellow = no admin rights but nukable
        hackColor = server.adminStatus === AdminStatus.ROOT ? '#00BFFF' : hackColor; // Blue = admin but not backdoor
        hackColor = server.adminStatus === AdminStatus.BACKDOOR ? 'lime' : hackColor; // Green = admin and backdoor
        return hackColor;
    }
    getFactionColor(server) {
        // Color the server names based on the factions
        const facServers = {
            CSEC: 'yellow',
            'avmnite-02h': 'yellow',
            'I.I.I.I': 'yellow',
            run4theh111z: 'yellow',
            'The-Cave': 'orange',
            w0r1d_d43m0n: 'red',
        };
        return facServers[server.name] ? facServers[server.name] : 'white';
    }
    buildHoverText(server) {
        // Provide technical information about the server when hovering the mouse
        const moneyRatio = Math.round((server.currentMoney / server.maxMoney) * 100);
        return [
            `Req Level: ${server.hackingLevel}&#10;`,
            `Req Ports: ${server.openPortCount} / ${server.totalPortCount}&#10;`,
            `Memory: ${server.maxRam} GB&#10;`,
            `Security: ${server.currentSecurty} / ${server.minSecurity}&#10;`,
            `Money: ${this.toEngineeringNotation(server.currentMoney)} / ${this.toEngineeringNotation(server.maxMoney)} (${moneyRatio}%)&#10;`,
            `Growth: ${server.growthFactor}&#10;`,
            `Hacking Chance: ${this.roundPercent(server.hackChance)} %&#10;`,
            `Hacking Time: ${this.formatMilliseconds(server.hackDuration)} &#10;`,
        ].join('');
    }
    toEngineeringNotation(num) {
        if (num === 0)
            return '0e+0';
        const exponent = Math.floor(Math.log10(Math.abs(num)));
        const normalizedExponent = Math.floor(exponent / 3) * 3;
        let mantissa = num / 10 ** normalizedExponent;
        // Adjust mantissa to avoid floating-point issues
        mantissa = +mantissa.toFixed(3);
        return `${mantissa}e${normalizedExponent >= 0 ? '+' : ''}${normalizedExponent}`;
    }
    formatMilliseconds(milliseconds) {
        const hours = Math.floor(milliseconds / 3600000); // 1 hour = 3600000 milliseconds
        const minutes = Math.floor((milliseconds % 3600000) / 60000); // 1 minute = 60000 milliseconds
        const seconds = Math.floor((milliseconds % 60000) / 1000); // 1 second = 1000 milliseconds
        const millis = Math.round(milliseconds % 1000);
        // Pad the values to the desired format
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');
        const formattedMillis = millis.toString().padStart(3, '0');
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMillis}`;
    }
    roundPercent(num) {
        return Math.floor(Math.round(num * 10000) / 100).toString();
    }
    buildServerHTML(server, hackColor, nameColor, hoverText, contractText) {
        return [
            // `<span style="color: black">` + "--".repeat(server.depth) + `</span>`, // For display indentation
            `<span style="color: black">--</span>`, // For display indentation
            `<span style='color:${hackColor}'>■ </span>`,
            `<a class='scan-analyze-link' title='${hoverText}'
      onClick="(function() { // On click connect directly to the server. Requires connect.js script and goto alias to work
          const doc = eval('document');
          const terminalInput = doc.getElementById('terminal-input');
          terminalInput.value='home; goto ${server.name}';
          const handler = Object.keys(terminalInput)[1];
          terminalInput[handler].onChange({target:terminalInput});
          terminalInput[handler].onKeyDown({key:'Enter',preventDefault:()=>null});
      })();"
      style='color:${nameColor}'>${server.name}</a> `,
            `<span style='color:fuchsia'>${contractText}</span>`,
            '<br>',
        ].join('');
    }
}
