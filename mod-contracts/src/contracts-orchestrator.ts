/* eslint-disable  @typescript-eslint/no-explicit-any */
import { AutocompleteData, CodingContractData, NS as INs } from '@ns';

/** @param {NS} ns */
export async function main(ns: INs): Promise<void> {
   ns.tail();
   ns.setTitle('Sherlock Holmes');
   ns.disableLog('ALL');
   ns.clearLog();

   ns.print('ATTEMPTING TO SOLVE CONTRACTS... ');
   ns.print(' ');

   const [serverNames, globalCountractCount] = getTargetServerNames(ns);
   ns.print(`${globalCountractCount} contracts detected on ${serverNames.length} servers.`);
   ns.print(` `);
   if (serverNames.length === 0) {
      return;
   }

   const contracts: Contract[] = new ContractScrapper(ns).getContracts(serverNames);

   const contractProcessor: ContractProcessor = new ContractProcessor(ns);
   const contractSubmitter: ContractSubmitter = new ContractSubmitter(ns);

   contracts.forEach((contract: Contract): void => {
      const solvedContract: Contract = contractProcessor.solve(contract);
      if (solvedContract.solution === 'UNKNOWN') {
         return;
      }
      contractSubmitter.submit(solvedContract);
   });
}

export function autocomplete(data: AutocompleteData): string[] {
   return [...data.servers];
}

function getTargetServerNames(ns: INs): [string[], number] {
   const targetServerNames: string[] = ns.args as string[];
   const allServerNames: string[] = new Network(ns).getAllHostnames();

   let validTargetServerNames: string[] = allServerNames;
   if (targetServerNames.length > 0) {
      validTargetServerNames = targetServerNames.filter((serverName: string) => allServerNames.includes(serverName));
      targetServerNames.forEach((serverName: string): void => {
         if (!allServerNames.includes(serverName)) {
            ns.print(`[${serverName}] Invalid server name.`);
         }
      });
      ns.print(`Scope narrowed to servers: ${validTargetServerNames.join(', ')}`);
   }

   const targetServerNamesWithContracts: string[] = validTargetServerNames.filter(
      (serverName: string) => getContractCount(ns, serverName) > 0
   );
   let globalContractCount: number = 0;
   validTargetServerNames.forEach((serverName: string): void => {
      const serverContractCount: number = getContractCount(ns, serverName);
      globalContractCount += serverContractCount;
   });
   return [targetServerNamesWithContracts, globalContractCount];
}

function getContractCount(ns: INs, server: string): number {
   const contractFiles: string[] = ns.ls(server, '.cct');
   return contractFiles.length;
}

class Network {
   hostnames: string[];

   readonly #ns: INs;

   constructor(ns: INs) {
      this.#ns = ns;
      this.hostnames = this.getAllHostnames();
   }

   getAllHostnames(currentServer: string = 'home', scannedServer: string[] = ['home']): string[] {
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

class ContractScrapper {
   readonly #ns: INs;

   constructor(ns: INs) {
      this.#ns = ns;
   }

   getContracts(serverNames: string[]): Contract[] {
      const contracts: Contract[] = [];
      serverNames.forEach((serverName: string): void => {
         const serverContracts: Contract[] = this.getServerContracts(serverName);
         contracts.push(...serverContracts);
      });
      return contracts;
   }

   getServerContracts(serverName: string): Contract[] {
      const contracts: Contract[] = [];
      const contractFiles: string[] = this.#ns.ls(serverName, '.cct');
      contractFiles.forEach((contractFile: string): void => {
         contracts.push(new Contract(this.#ns, serverName, contractFile));
      });
      return contracts;
   }
}

class ContractProcessor {
   readonly #ns: INs;
   constructor(ns: INs) {
      this.#ns = ns;
   }
   solve(contract: Contract): Contract {
      const contractSolver: ContractSolver = this.findSolver(contract.type);
      const solvedContract: Contract = contractSolver.solve(contract);

      if (solvedContract.solution === 'UNKNOWN') {
         this.#ns.print(`Contract type "${contract.type}" (on ${contract.hostname}) has no resolver known yet.`);
      }
      return solvedContract;
   }

   private findSolver(contractType: string): ContractSolver {
      const foundSolver: ContractSolver | undefined = this.ContractSolvers.find(
         (contractSolver: ContractSolver): boolean => contractSolver.contractName === contractType
      );

      if (!foundSolver) {
         return new ContractSolver('UNKNOWN', new SolverEmpty());
      }

      return foundSolver;
   }

   private ContractSolvers: ContractSolver[] = [
      new ContractSolver('Find Largest Prime Factor', new SolverFindLargestPrimeNumber()),
      new ContractSolver('Subarray with Maximum Sum', new SolverSubarrayWithMaximumSum()),
      new ContractSolver('Total Ways to Sum', new SolverTotalWaysToSum(), (data) => [
         data,
         [...Array.from({ length: data - 1 }, (_, i) => i + 1)],
      ]),
      new ContractSolver('Total Ways to Sum II', new SolverTotalWaysToSum()),
      new ContractSolver('Spiralize Matrix', new SolverSpiralizeMatrix()),
      new ContractSolver('Array Jumping Game', new SolverArrayJumpingGame()),
      new ContractSolver('Array Jumping Game II', new SolverArrayJumpingGameII()),
      new ContractSolver('Merge Overlapping Intervals', new SolverMergeOverlappingIntervals()),
      new ContractSolver('Generate IP Addresses', new SolverGenerateIpAddresses()),
      new ContractSolver('Algorithmic Stock Trader I', new SolverAlgorithmicStockTrader(), (data) => [1, data]),
      new ContractSolver('Algorithmic Stock Trader II', new SolverAlgorithmicStockTrader(), (data) => [
         data.length,
         data,
      ]),
      new ContractSolver('Algorithmic Stock Trader III', new SolverAlgorithmicStockTrader(), (data) => [2, data]),
      new ContractSolver('Algorithmic Stock Trader IV', new SolverAlgorithmicStockTrader()),
      new ContractSolver('Minimum Path Sum in a Triangle', new SolverMinimumPathSumInATriangle()),
      new ContractSolver('Unique Paths in a Grid I', new SolverUniquePathInAGrid(), (data) =>
         Array(data[0])
            .fill(null)
            .map(() => Array(data[1]).fill(0))
      ),
      new ContractSolver('Unique Paths in a Grid II', new SolverUniquePathInAGrid()),
      new ContractSolver('Shortest Path in a Grid', new SolverShortestPathInAGrid()),
      new ContractSolver('Sanitize Parentheses in Expression', new SolverSanitizeParenthesesInExpression()),
      new ContractSolver('Find All Valid Math Expressions', new SolverFindAllValidMathExpressions()),
      new ContractSolver('HammingCodes: Integer to Encoded Binary', new SolverHammingcodeEncodedIntegerToBinary()),
      new ContractSolver('HammingCodes: Encoded Binary to Integer', new SolverHammingcodeEncodedBinarytoInteger()),
      new ContractSolver('Proper 2-Coloring of a Graph', new SolverProper2ColoringOfAGraph()),
      new ContractSolver('Compression I: RLE Compression', new SolverCompressionI()),
      new ContractSolver('Compression II: LZ Decompression', new SolverCompressionII()),
      new ContractSolver('Compression III: LZ Compression', new SolverCompressionIII()),
      new ContractSolver('Encryption I: Caesar Cipher', new SolverEncryptionICaesar()),
      new ContractSolver('Encryption II: Vigenère Cipher', new SolverEncryptionIIVigenere()),
   ];
}

class ContractSubmitter {
   readonly #ns: INs;

   constructor(ns: INs) {
      this.#ns = ns;
   }

   async submit(contract: Contract): Promise<void> {
      this.#ns.print(
         `Submitting solution of "${contract.type}" contract ([${contract.hostname}] ${contract.fileName})...`
      );

      const reward: string = this.#ns.codingcontract.attempt(
         contract.solution as any,
         contract.fileName,
         contract.hostname
      );

      if (!reward) {
         const logMsg: string = `ERROR - Solution rejected.\n 
          Contract type: ${contract.type}\n
          Data: ${contract.data}\n
          Solution attempted: ${contract.solution}`;
         this.#ns.print(logMsg);
         throw new Error(logMsg);
      }

      this.#ns.print(`Solution accepted. Reward: ${reward}.`);
      this.#ns.print(` `);
   }
}

class Contract {
   readonly hostname: string;
   readonly fileName: string;
   readonly type: string;

   readonly data: CodingContractData;

   #solution: SolutionType = 'UNKNOWN';
   readonly #ns: INs;

   constructor(ns: INs, serverName: string, contractFile: string) {
      this.#ns = ns;
      this.hostname = serverName;
      this.fileName = contractFile;
      this.type = this.#ns.codingcontract.getContractType(contractFile, serverName);
      this.data = this.#ns.codingcontract.getData(contractFile, serverName);
   }

   setSolution(solution: SolutionType): void {
      this.#solution = solution;
   }

   get solution(): SolutionType {
      return this.#solution;
   }
}

type SolutionType = number | number[] | number[][] | string | string[] | boolean | boolean[];

interface ISolver {
   solve(data: CodingContractData): SolutionType;
}

class ContractSolver {
   readonly contractName: string;
   readonly #solver: ISolver;
   readonly #formatInput: (data: CodingContractData) => CodingContractData;

   constructor(
      contractName: string,
      solver: ISolver,
      formatInput: (data: CodingContractData) => CodingContractData = (data) => data
   ) {
      this.contractName = contractName;
      this.#solver = solver;
      this.#formatInput = formatInput;
   }

   solve(contract: Contract): Contract {
      const input: CodingContractData = this.#formatInput(contract.data);
      const solution: SolutionType = this.#solver.solve(input);
      contract.setSolution(solution);
      return contract;
   }
}

// SOLVERS

class SolverEmpty implements ISolver {
   solve(): string {
      return 'UNKNOWN';
   }
}

class SolverFindLargestPrimeNumber implements ISolver {
   /* A prime factor is a factor that is a prime number. What is the largest prime factor of 251187194?
    */

   solve(input: number): number {
      let largestFactor = 1;

      // Remove factors of 2
      while (input % 2 === 0) {
         largestFactor = 2;
         input /= 2;
      }

      // Check odd factors
      let factor = 3;
      const maxFactor = Math.sqrt(input);
      while (input > 1 && factor <= maxFactor) {
         while (input % factor === 0) {
            largestFactor = factor;
            input /= factor;
         }
         factor += 2;
      }

      // If X is a prime number greater than 2
      if (input > 2) {
         largestFactor = input;
      }

      return largestFactor;
   }
}

class SolverSubarrayWithMaximumSum implements ISolver {
   /* Given the following integer array, find the contiguous subarray (containing at least one number) which has the
     largest sum and return that sum. 'Sum' refers to the sum of all the numbers in the subarray. */

   solve(input: number[]): number {
      // Solution: Kadane's algorithm

      if (input.length === 0) return 0;

      let maxCurrent: number = input[0];
      let maxGlobal: number = input[0];

      for (let i: number = 1; i < input.length; i++) {
         maxCurrent = Math.max(input[i], maxCurrent + input[i]);
         if (maxCurrent > maxGlobal) {
            maxGlobal = maxCurrent;
         }
      }

      return maxGlobal;
   }
}

class SolverTotalWaysToSum implements ISolver {
   /* Total Ways to Sum I
      It is possible write four as a sum in exactly four different ways:
        3 + 1  ;  2 + 2  ;  2 + 1 + 1  ;  1 + 1 + 1 + 1
      How many different distinct ways can the number 72 be written as a sum of at least two positive integers? */

   /* Total Ways to Sum II
      How many different distinct ways can the number 87 be written as a sum of integers contained in the set:
        [3,4,7,8,9,10,11,13]?
      You may use each integer in the set zero or more times.
   */

   solve(input: [number, number[]]): number {
      // Solution: dynamic programming approach

      // Split the input into n and the numbers to adapt for problem I and II
      const n: number = input[0];
      const numbers: number[] = input[1];

      // Create a 1D array for dynamic programming (dp)
      let dp: number[] = new Array(n + 1).fill(0);
      dp[0] = 1; // Base case: one way to sum up to 0

      // Fill the dynamic programming table
      for (let num of numbers) {
         for (let i = num; i <= n; i++) {
            dp[i] += dp[i - num];
         }
      }

      // The number of ways to write 'input' using numbers up to 'input' or numbers in the given set
      return dp[n];
   }
}

class SolverSpiralizeMatrix implements ISolver {
   /* Given an array of arrays of numbers representing a 2D matrix, return the elements of the matrix as an array in spiral order:
      Here is an example of what spiral order should be:
       [ [1, 2, 3],
         [4, 5, 6],
         [7, 8, 9]  ]

      Answer: [1, 2, 3, 6, 9, 8 ,7, 4, 5]
      Note that the matrix will not always be square:
   */

   solve(input: number[][]): number[] {
      let result: number[] = [];

      while (input.length) {
         result = this.addTheFirstRow(input, result);
         result = this.addTheLastElementOfEachRow(input, result);
         result = this.addTheLastRowInReverseOrder(input, result);
         result = this.addFirstElementOfEachRowInReverseOrder(input, result);
      }

      return result;
   }

   private addFirstElementOfEachRowInReverseOrder(input: number[][], result: number[]) {
      let firstElements: number[] = [];
      for (let i = 0; i < input.length; i++) {
         let row = input[i];
         if (row.length) {
            firstElements.push(row.shift() as number);
         }
      }
      return result.concat(firstElements.reverse());
   }

   private addTheLastRowInReverseOrder(input: number[][], result: number[]) {
      if (input.length) {
         let lastRow = input.pop() as number[];
         result = result.concat(lastRow.reverse());
      }
      return result;
   }

   private addTheLastElementOfEachRow(input: number[][], result: number[]) {
      for (let i = 0; i < input.length; i++) {
         let row = input[i];
         if (row.length) {
            result.push(row.pop() as number);
         }
      }
      return result;
   }

   private addTheFirstRow(input: number[][], result: number[]): number[] {
      return result.concat(input.shift() as number[]);
   }
}

class SolverArrayJumpingGame implements ISolver {
   /* You are given the following array of integers:
      0,7,10,5,1,0,1,0,0,1,0,10,2,1,7,0,5,9,3,6,10,0,0,6
      Each element in the array represents your MAXIMUM jump length at that position. This means that if you are at
      position i and your maximum jump length is n, you can jump to any position from i to i+n.
      Assuming you are initially positioned at the start of the array, determine whether you are able to reach the last
      index. Your answer should be submitted as 1 or 0, representing true and false respectively
   */

   solve(input: number[]): number {
      let maxReach = 0;
      const n = input.length;

      for (let i = 0; i < n; i++) {
         if (this.isTheCurrentIndexBeyondTheMaximumReachableIndex(i, maxReach)) {
            return 0;
         }

         maxReach = this.updateMaximumReachableIndex(maxReach, i, input[i]);

         if (this.isTheMaximumReachableIndexBeyondTheEndOfTheArray(maxReach, n)) {
            return 1;
         }
      }

      return 0; // If we finish the loop without reaching the end, we cannot reach the end
   }

   private isTheCurrentIndexBeyondTheMaximumReachableIndex(
      currentIndex: number,
      maximumReachableIndex: number
   ): boolean {
      return currentIndex > maximumReachableIndex;
   }

   private updateMaximumReachableIndex(
      maximumReachableIndex: number,
      currentIndex: number,
      jumpLength: number
   ): number {
      return Math.max(maximumReachableIndex, currentIndex + jumpLength);
   }

   private isTheMaximumReachableIndexBeyondTheEndOfTheArray(
      maximumReachableIndex: number,
      arrayLength: number
   ): boolean {
      return maximumReachableIndex >= arrayLength - 1;
   }
}

class SolverArrayJumpingGameII implements ISolver {
   /* You are given the following array of integers: 2,1,2,3,2,2,3,2,3
      Each element in the array represents your MAXIMUM jump length at that position. This means that if you are at
      position i and your maximum jump length is n, you can jump to any position from i to i+n.
      Assuming you are initially positioned at the start of the array, determine the minimum number of jumps to reach
      the end of the array. If it's impossible to reach the end, then the answer should be 0.
   */

   solve(input: number[]): number {
      let jumps = 0;
      let currentEnd = 0;
      let farthest = 0;

      for (let i = 0; i < input.length - 1; i++) {
         farthest = Math.max(farthest, i + input[i]);

         // If we've reached the end of the current jump,
         // increase the jump count and update the current end
         if (i === currentEnd) {
            jumps++;
            currentEnd = farthest;

            // If the current end is still at or before the current position,
            // it means we can't move further, so return 0
            if (currentEnd <= i) return 0;
         }
      }

      return jumps;
   }
}

class SolverMergeOverlappingIntervals implements ISolver {
   /* Given the following array of arrays of numbers representing a list of intervals, merge all overlapping intervals.
   [[14,24],[21,24],[18,22],[17,21],[19,24],[10,13]]
   Example: [[1, 3], [8, 10], [2, 6], [10, 16]] would merge into [[1, 6], [8, 16]].
   The intervals must be returned in ASCENDING order. You can assume that in an interval, the first number will always
   be smaller than the second.
   */

   solve(input: number[][]): number[][] {
      if (input.length <= 1) {
         return input;
      }

      // Sort intervals based on the start time
      input.sort((a, b) => a[0] - b[0]);

      const merged: number[][] = [];
      let currentInterval = input[0];

      for (let i = 1; i < input.length; i++) {
         const [currentStart, currentEnd] = currentInterval;
         const [nextStart, nextEnd] = input[i];

         if (currentEnd >= nextStart) {
            // Merge overlapping intervals
            currentInterval = [currentStart, Math.max(currentEnd, nextEnd)];
         } else {
            // Add the non-overlapping interval to the result and update the current interval
            merged.push(currentInterval);
            currentInterval = input[i];
         }
      }

      // Add the last interval
      merged.push(currentInterval);

      return merged;
   }
}

class SolverGenerateIpAddresses implements ISolver {
   /* Given the following string containing only digits, return an array with all possible valid IP address combinations
      that can be created from the string: 16413453
      Note that an octet cannot begin with a '0' unless the number itself is actually 0. For example, '192.168.010.1' is
      not a valid IP.
      Examples:
      25525511135 -> ["255.255.11.135", "255.255.111.35"]
      1938718066 -> ["193.87.180.66"]
   */

   solve(input: string): string[] {
      const result: string[] = [];

      function backtrack(start: number, path: string[], parts: number): void {
         if (parts === 4 && start === input.length) {
            result.push(path.join('.'));
            return;
         }

         if (parts === 4 || start === input.length) {
            return;
         }

         for (let len = 1; len <= 3; len++) {
            if (start + len > input.length) break; // Avoid going past the string length

            const segment = input.substring(start, start + len);

            // Check if the segment is a valid IP octet
            if ((segment.length > 1 && segment.startsWith('0')) || Number(segment) > 255) {
               break;
            }

            path.push(segment);
            backtrack(start + len, path, parts + 1);
            path.pop(); // Backtrack
         }
      }

      backtrack(0, [], 0);
      return result;
   }
}

class SolverAlgorithmicStockTrader implements ISolver {
   solve(input: [number, number[]]): number {
      const maxTransactions = input[0];
      const prices = input[1];

      if (prices.length < 2) {
         // Not enough prices to transact. Maximum profit is 0.
         return 0;
      }

      if (maxTransactions > prices.length / 2) {
         // Is this valid if the input array hasn't been optimized?
         let sum = 0;
         for (let day = 1; day < prices.length; day++) {
            sum += Math.max(prices[day] - prices[day - 1], 0);
         }
         return sum;
         // More transactions available than can be used. Maximum profit is ${sum}
      }

      const rele = Array<number>(maxTransactions + 1).fill(0);
      const hold = Array<number>(maxTransactions + 1).fill(Number.MIN_SAFE_INTEGER);

      for (let day = 0; day < prices.length; day++) {
         const price = prices[day];
         for (let i = maxTransactions; i > 0; i--) {
            rele[i] = Math.max(rele[i], hold[i] + price);
            hold[i] = Math.max(hold[i], rele[i - 1] - price);
         }
      }

      return rele[maxTransactions];
   }
}

class SolverMinimumPathSumInATriangle implements ISolver {
   /* Given a triangle, find the minimum path sum from top to bottom. In each step of the path, you may only move to
   adjacent numbers in the row below. The triangle is represented as a 2D array of numbers:
   [
        [1],
       [2,9],
      [9,2,2],
     [4,8,7,5]
   ]
   Example: If you are given the following triangle:
   [
        [2],
       [3,4],
      [6,5,7],
     [4,1,8,3]
   ]
   The minimum path sum is 11 (2 -> 3 -> 5 -> 1).
   */

   solve(input: number[][]): number {
      const n = input.length;
      const dp: number[] = input[n - 1].slice(); // Copy the last row

      // Start from the second-to-last row and move upwards
      for (let row = n - 2; row >= 0; row--) {
         for (let col = 0; col <= row; col++) {
            // Update the path sum for each element in the current row
            dp[col] = input[row][col] + Math.min(dp[col], dp[col + 1]);
         }
      }

      return dp[0]; // The top element contains the minimum path sum
   }
}

class SolverUniquePathInAGrid implements ISolver {
   solve(input: number[][]): number {
      const rows = input.length;
      const cols = input[0].length;

      const grid = this.initializeGrid(rows, cols);
      this.calculatePaths(input, grid, rows, cols);

      return grid[0][0];
   }

   private initializeGrid(rows: number, cols: number): number[][] {
      const grid = Array<number[]>(rows)
         .fill([])
         .map(() => Array<number>(cols).fill(-1));
      grid[rows - 1][cols - 1] = 1;
      return grid;
   }

   private calculatePaths(input: number[][], grid: number[][], rows: number, cols: number): void {
      for (let y = rows - 1; y >= 0; y--) {
         for (let x = cols - 1; x >= 0; x--) {
            grid[y][x] = this.calculateCellValue(input, grid, y, x, rows, cols);
         }
      }
   }

   private calculateCellValue(
      input: number[][],
      grid: number[][],
      y: number,
      x: number,
      rows: number,
      cols: number
   ): number {
      if (y === rows - 1 && x === cols - 1) {
         return grid[y][x];
      }
      if (input[y][x] === 1) {
         return 0;
      }

      let val = 0;
      if (y < rows - 1) {
         val += grid[y + 1][x];
      }
      if (x < cols - 1) {
         val += grid[y][x + 1];
      }
      return val;
   }
}

class SolverShortestPathInAGrid implements ISolver {
   /* You are located in the top-left corner of the following grid:

     [[0,0,0,0,0,0,1,0,0,1,1],
      [0,0,1,0,1,1,0,0,0,0,0],
      [0,0,0,1,0,0,1,1,0,0,0],
      [1,0,0,0,0,0,0,1,0,0,0],
      [0,1,0,0,1,0,1,1,1,1,1],
      [0,0,0,0,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0]]

     You are trying to find the shortest path to the bottom-right corner of the grid, but there are obstacles on the grid
     that you cannot move onto. These obstacles are denoted by '1', while empty spaces are denoted by 0.

     Determine the shortest path from start to finish, if one exists. The answer should be given as a string of UDLR
     characters, indicating the moves along the path

     NOTE: If there are multiple equally short paths, any of them is accepted as answer. If there is no path, the answer
     should be an empty string.
     NOTE: The data returned for this contract is an 2D array of numbers representing the grid.

     Examples:

         [[0,1,0,0,0],
          [0,0,0,1,0]]

     Answer: 'DRRURRD'

         [[0,1],
          [1,0]]

     Answer: ''
   */

   solve(input: number[][]): string {
      const rows = input.length;
      const cols = input[0].length;
      const directions: [number, number, string][] = [
         [1, 0, 'D'],
         [-1, 0, 'U'],
         [0, 1, 'R'],
         [0, -1, 'L'],
      ];
      const queue: Array<[number, number, string]> = [[0, 0, '']];
      const seen = new Set<string>();

      while (queue.length > 0) {
         const [row, col, path] = queue.shift()!;

         if (row === rows - 1 && col === cols - 1) {
            return path;
         }

         for (const [dr, dc, dir] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            const newPath = path + dir;
            const pos = `${newRow},${newCol}`;

            if (
               newRow >= 0 &&
               newRow < rows &&
               newCol >= 0 &&
               newCol < cols &&
               input[newRow][newCol] === 0 &&
               !seen.has(pos)
            ) {
               queue.push([newRow, newCol, newPath]);
               seen.add(pos);
            }
         }
      }

      return '';
   }
}

class SolverSanitizeParenthesesInExpression implements ISolver {
   /* Given the following string: (()((a)a))()())a(
      remove the minimum number of invalid parentheses in order to validate the string. If there are multiple minimal
      ways to validate the string, provide all of the possible results. The answer should be provided as an array of
      strings. If it is impossible to validate the string the result should be an array with only an empty string.
      IMPORTANT: The string may contain letters, not just parentheses. Examples:
      "()())()" -> ["()()()", "(())()"]
      "(a)())()" -> ["(a)()()", "(a())()"]
      ")(" -> [""]
   */

   results = new Set<string>();

   solve(input: string): string[] {
      this.results = new Set<string>();

      // Count the number of misplaced left and right parentheses
      let lremove = 0,
         rremove = 0;
      for (let char of input) {
         if (char === '(') lremove++;
         else if (char === ')') {
            if (lremove > 0) lremove--;
            else rremove++;
         }
      }

      this.backtrack(0, lremove, rremove, input);
      return Array.from(this.results);
   }

   isValid(str: string): boolean {
      let balance = 0;
      for (let char of str) {
         if (char === '(') balance++;
         else if (char === ')') balance--;
         if (balance < 0) return false; // More closing parentheses
      }
      return balance === 0; // Perfectly balanced
   }

   backtrack(start: number, lremove: number, rremove: number, str: string): void {
      if (lremove === 0 && rremove === 0) {
         if (this.isValid(str)) {
            this.results.add(str);
         }
         return;
      }

      for (let i = start; i < str.length; i++) {
         // Skip duplicates
         if (i !== start && str[i] === str[i - 1]) continue;

         if (str[i] === '(' && lremove > 0) {
            // Remove the current left parenthesis
            this.backtrack(i, lremove - 1, rremove, str.substring(0, i) + str.substring(i + 1));
         }

         if (str[i] === ')' && rremove > 0) {
            // Remove the current right parenthesis
            this.backtrack(i, lremove, rremove - 1, str.substring(0, i) + str.substring(i + 1));
         }
      }
   }
}

class SolverFindAllValidMathExpressions implements ISolver {
   /* You are given the following string which contains only digits between 0 and 9: 844148866399
      You are also given a target number of -2. Return all possible ways you can add the +(add), -(subtract), and
      *(multiply) operators to the string such that it evaluates to the target number. (Normal order of operations
      applies.)
      The provided answer should be an array of strings containing the valid expressions. The data provided by this
      problem is an array with two elements. The first element is the string of digits, while the second element is the
      target number: ["844148866399", -2]
      NOTE: The order of evaluation expects script operator precedence
      NOTE: Numbers in the expression cannot have leading 0's. In other words, "1+01" is not a valid expression
      Examples:

       Input: digits = "123", target = 6
       Output: [1+2+3, 1*2*3]

       Input: digits = "105", target = 5
       Output: [1*0+5, 10-5]
    */

   solve(input: [string, number]): string[] {
      const digits = input[0];
      const target = input[1];

      function helper(
         res: string[],
         path: string,
         digits: string,
         target: number,
         pos: number,
         evaluated: number,
         multed: number
      ) {
         if (pos === digits.length) {
            if (target === evaluated) {
               res.push(path);
            }
            return;
         }
         for (let i = pos; i < digits.length; ++i) {
            if (i != pos && digits[pos] == '0') {
               break;
            }
            const cur = parseInt(digits.substring(pos, i + 1));
            if (pos === 0) {
               helper(res, path + cur, digits, target, i + 1, cur, cur);
            } else {
               helper(res, path + '+' + cur, digits, target, i + 1, evaluated + cur, cur);
               helper(res, path + '-' + cur, digits, target, i + 1, evaluated - cur, -cur);
               helper(res, path + '*' + cur, digits, target, i + 1, evaluated - multed + multed * cur, multed * cur);
            }
         }
      }

      if (digits == null || digits.length === 0) {
         return [];
      }
      const result: string[] = [];
      helper(result, '', digits, target, 0, 0, 0);
      return result;
   }
}

class SolverHammingcodeEncodedIntegerToBinary implements ISolver {
   /* You are given the following decimal Value:
 6390
 Convert it to a binary representation and encode it as an 'extended Hamming code'. Eg:
 Value 8 is expressed in binary as '1000', which will be encoded with the pattern 'pppdpddd', where p is a parity bit and d a data bit. The encoding of
 8 is 11110000. As another example, '10101' (Value 21) will result into (pppdpdddpd) '1001101011'.
 The answer should be given as a string containing only 1s and 0s.
 NOTE: the endianness of the data bits is reversed in relation to the endianness of the parity bits.
 NOTE: The bit at index zero is the overall parity bit, this should be set last.
 NOTE 2: You should watch the Hamming Code video from 3Blue1Brown, which explains the 'rule' of encoding, including the first index parity bit mentioned in the previous note.

 Extra rule for encoding:
 There should be no leading zeros in the 'data bit' section
   */

   solve(value: number): string {
      const binaryData = value.toString(2).split('');
      const totalParityBits = this.calculateTotalParityBits(binaryData.length);
      const encoded = this.initializeEncodedArray(binaryData, totalParityBits);

      // Calculate parity for each parity bit position
      const parityBitPositions = this.getParityBitPositions(encoded);
      for (const index of parityBitPositions) {
         encoded[index] = this.calculateParity(encoded, index).toString();
      }

      // Calculate and set the overall parity bit
      encoded.unshift(this.calculateOverallParity(encoded).toString());
      return encoded.join('');
   }

   private calculateTotalParityBits(lengthOfDataBits: number): number {
      // Implement the Hamming sum of parity bits calculation
      if (lengthOfDataBits < 3) {
         return lengthOfDataBits + 1;
      }

      const doubleLength = lengthOfDataBits * 2;
      const log2Double = Math.ceil(Math.log2(doubleLength));
      const log2Single = Math.ceil(Math.log2(1 + lengthOfDataBits + Math.ceil(Math.log2(lengthOfDataBits))));

      return log2Double <= log2Single
         ? Math.ceil(Math.log2(lengthOfDataBits) + 1)
         : Math.ceil(Math.log2(lengthOfDataBits));
   }

   private initializeEncodedArray(data: string[], totalParityBits: number): string[] {
      // Initialize encoded array with placeholders for parity bits
      let encoded = ['x', 'x', ...data.splice(0, 1)];
      for (let i = 2; i < totalParityBits; i++) {
         encoded.push('x', ...data.splice(0, Math.pow(2, i) - 1));
      }
      return encoded;
   }

   private getParityBitPositions(encoded: string[]): number[] {
      // Get indices of parity bits in the encoded array
      return encoded.map((element, index) => (element === 'x' ? index : -1)).filter((index) => index !== -1);
   }

   private calculateParity(encoded: string[], parityIndex: number): number {
      // Calculate parity for a given parity bit position
      let count = 0;
      for (let i = parityIndex; i < encoded.length; i += (parityIndex + 1) * 2) {
         for (let j = i; j < i + parityIndex + 1 && j < encoded.length; j++) {
            if (encoded[j] === '1') {
               count++;
            }
         }
      }
      return count % 2;
   }

   private calculateOverallParity(encoded: string[]): number {
      // Calculate overall parity for the encoded data
      return encoded.filter((bit) => bit === '1').length % 2;
   }
}

class SolverHammingcodeEncodedBinarytoInteger implements ISolver {
   solve(data: string): number {
      const binaryArray = data.split('');
      const parityCheckResults = [];
      const totalParityBits = Math.ceil(Math.log2(data.length));

      let overallParity = binaryArray.splice(0, 1).join('');
      parityCheckResults.push(this.checkParity(overallParity, binaryArray));

      for (let i = 0; i < totalParityBits; i++) {
         parityCheckResults.push(this.checkParityAtIndex(binaryArray, i));
      }

      const correctedIndex = this.calculateCorrectionIndex(parityCheckResults, totalParityBits);
      binaryArray.unshift(overallParity);

      if (correctedIndex > 0 && !parityCheckResults[0]) {
         this.toggleBitAtIndex(binaryArray, correctedIndex);
      } else if (!parityCheckResults[0]) {
         overallParity = overallParity === '0' ? '1' : '0';
      } else if (parityCheckResults[0] && parityCheckResults.some((truth) => !truth)) {
         return 0; // ERROR: More than one altered bit detected.
      }

      this.removeParityBits(binaryArray, totalParityBits);
      return parseInt(binaryArray.join(''), 2);
   }

   private countBits(arr: string[], val: string): number {
      return arr.reduce((a, v) => (v === val ? a + 1 : a), 0);
   }

   private checkParity(overallParity: string, data: string[]): boolean {
      return overallParity === (this.countBits(data, '1') % 2).toString();
   }

   private checkParityAtIndex(data: string[], index: number): boolean {
      const parityBitIndex = Math.pow(2, index) - 1;
      const stepSize = parityBitIndex + 1;
      const parityData = [];

      for (let i = parityBitIndex; i < data.length; i += stepSize * 2) {
         parityData.push(...data.slice(i, i + stepSize));
      }

      const parityBit = parityData.shift();
      return parityBit === (this.countBits(parityData, '1') % 2).toString();
   }

   private calculateCorrectionIndex(checkResults: boolean[], totalParityBits: number): number {
      let correctionIndex = 0;
      for (let i = 1; i <= totalParityBits; i++) {
         correctionIndex += checkResults[i] ? 0 : Math.pow(2, i) / 2;
      }
      return correctionIndex;
   }

   private toggleBitAtIndex(arr: string[], index: number): void {
      arr[index] = arr[index] === '0' ? '1' : '0';
   }

   private removeParityBits(arr: string[], totalParityBits: number): void {
      for (let i = totalParityBits; i >= 0; i--) {
         arr.splice(Math.pow(2, i), 1);
      }
      arr.splice(0, 1); // Remove overall parity bit
   }
}

class SolverProper2ColoringOfAGraph implements ISolver {
   /* You are given the following data, representing a graph:
      [6,[[2,5],[3,5],[1,2],[3,4]]]
      Note that "graph", as used here, refers to the field of graph theory, and has no relation to statistics or
      plotting. The first element of the data represents the number of vertices in the graph. Each vertex is a unique
      number between 0 and 5. The next element of the data represents the edges of the graph. Two vertices u,v in a
      graph are said to be adjacent if there exists an edge [u,v]. Note that an edge [u,v] is the same as an edge [v,u],
      as order does not matter. You must construct a 2-coloring of the graph, meaning that you have to assign each vertex
      in the graph a "color", either 0 or 1, such that no two adjacent vertices have the same color. Submit your answer
      in the form of an array, where element i represents the color of vertex i. If it is impossible to construct a
      2-coloring of the given graph, instead submit an empty array.
      Examples:

      Input: [4, [[0, 2], [0, 3], [1, 2], [1, 3]]]
      Output: [0, 0, 1, 1]

      Input: [3, [[0, 1], [0, 2], [1, 2]]]
      Output: []
   */

   solve(input: [number, number[][]]): number[] {
      const numVertices = input[0];
      const graph = input[1];
      // Array to store colors assigned to each vertex
      // -1 means the vertex has not been colored yet
      const colors = new Array(numVertices).fill(-1);

      // DFS function to try to color a vertex
      function dfs(vertex: number, color: number): boolean {
         // If the vertex is already colored, check if the color matches
         if (colors[vertex] !== -1) {
            return colors[vertex] === color;
         }

         // Color the vertex
         colors[vertex] = color;

         // Check all adjacent vertices
         for (const [v1, v2] of graph) {
            if (v1 === vertex || v2 === vertex) {
               const adjacentVertex = v1 === vertex ? v2 : v1;
               if (!dfs(adjacentVertex, 1 - color)) {
                  return false; // If adjacent vertex can't be colored correctly, return false
               }
            }
         }

         return true;
      }

      // Try to color each component of the graph
      for (let i = 0; i < numVertices; i++) {
         if (colors[i] === -1) {
            if (!dfs(i, 0)) {
               return []; // If a component is not bipartite, return an empty array
            }
         }
      }

      return colors;
   }
}

class SolverCompressionI implements ISolver {
   solve(input: string): string {
      return input.replace(/([\w])\1{0,8}/g, (group, chr) => group.length + chr);
   }
}

class SolverCompressionII implements ISolver {
   solve(input: string): string {
      let answer = ``;

      let i = 0;
      while (i < input.length) {
         // type 1
         let length = parseInt(input[i]);
         i++;
         if (length > 0) {
            let data = input.substring(i, i + length);
            answer += data;
            i += length;
         }

         if (i >= input.length) break;

         // type 2
         length = parseInt(input[i]);
         i++;
         if (length > 0) {
            let offset = parseInt(input[i]);
            i++;

            for (let j = 0; j < length; j++) {
               answer += answer[answer.length - offset];
            }
         }
      }
      return answer;
   }
}

class SolverCompressionIII implements ISolver {
   solve(input: string): string {
      let cur_state = Array.from(Array(10), () => Array(10).fill(null));
      let new_state = Array.from(Array(10), () => Array(10));

      function set(state: string[][], i: number, j: number, str: string) {
         const current = state[i][j];
         if (current == null || str.length < current.length) {
            state[i][j] = str;
         } else if (str.length === current.length && Math.random() < 0.5) {
            // if two strings are the same length, pick randomly so that
            // we generate more possible inputs to Compression II
            state[i][j] = str;
         }
      }

      // initial state is a literal of length 1
      cur_state[0][1] = '';

      for (let i = 1; i < input.length; ++i) {
         for (const row of new_state) {
            row.fill(null);
         }
         const c = input[i];

         // handle literals
         for (let length = 1; length <= 9; ++length) {
            const string = cur_state[0][length];
            if (string == null) {
               continue;
            }

            if (length < 9) {
               // extend current literal
               set(new_state, 0, length + 1, string);
            } else {
               // start new literal
               set(new_state, 0, 1, string + '9' + input.substring(i - 9, i) + '0');
            }

            for (let offset = 1; offset <= Math.min(9, i); ++offset) {
               if (input[i - offset] === c) {
                  // start new backreference
                  set(new_state, offset, 1, string + length + input.substring(i - length, i));
               }
            }
         }

         // handle backreferences
         for (let offset = 1; offset <= 9; ++offset) {
            for (let length = 1; length <= 9; ++length) {
               const string = cur_state[offset][length];
               if (string == null) {
                  continue;
               }

               if (input[i - offset] === c) {
                  if (length < 9) {
                     // extend current backreference
                     set(new_state, offset, length + 1, string);
                  } else {
                     // start new backreference
                     set(new_state, offset, 1, string + '9' + offset + '0');
                  }
               }

               // start new literal
               set(new_state, 0, 1, string + length + offset);

               // end current backreference and start new backreference
               for (let new_offset = 1; new_offset <= Math.min(9, i); ++new_offset) {
                  if (input[i - new_offset] === c) {
                     set(new_state, new_offset, 1, string + length + offset + '0');
                  }
               }
            }
         }

         const tmp_state = new_state;
         new_state = cur_state;
         cur_state = tmp_state;
      }

      let result = null;

      for (let len = 1; len <= 9; ++len) {
         let string = cur_state[0][len];
         if (string == null) {
            continue;
         }

         string += len + input.substring(input.length - len, input.length);
         if (result == null || string.length < result.length) {
            result = string;
         } else if (string.length == result.length && Math.random() < 0.5) {
            result = string;
         }
      }

      for (let offset = 1; offset <= 9; ++offset) {
         for (let len = 1; len <= 9; ++len) {
            let string = cur_state[offset][len];
            if (string == null) {
               continue;
            }

            string += len + '' + offset;
            if (result == null || string.length < result.length) {
               result = string;
            } else if (string.length == result.length && Math.random() < 0.5) {
               result = string;
            }
         }
      }

      return result ?? '';
   }
}

class SolverEncryptionICaesar implements ISolver {
   /* Caesar cipher is one of the simplest encryption technique. It is a type of substitution cipher in which each
      letter in the plaintext is replaced by a letter some fixed number of positions down the alphabet. For example,
      with a left shift of 3, D would be replaced by A, E would become B, and A would become X (because of rotation).
      You are given an array with two elements: ["DEBUG LOGIN ARRAY TRASH QUEUE", 14]
      The first element is the plaintext, the second element is the left shift value.
      Return the ciphertext as uppercase string. Spaces remains the same.
   */

   solve(input: [string, number]): string {
      const [text, shift] = input;
      return text
         .split('')
         .map((char) => this.encryptCharacter(char, shift))
         .join('');
   }

   private encryptCharacter(char: string, shift: number): string {
      if (char === ' ') return char;

      const charCode = char.charCodeAt(0);
      if (charCode >= 65 && charCode <= 90) {
         // Uppercase A-Z in ASCII is 65-90
         return String.fromCharCode(((charCode - 65 - shift + 26) % 26) + 65);
      }
      return char; // Non-alphabetic characters are returned as is
   }
}

class SolverEncryptionIIVigenere implements ISolver {
   /* Vigenère cipher is a type of polyalphabetic substitution. It uses the Vigenère square to encrypt and decrypt
      plaintext with a keyword.

      Vigenère square:
          A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
        +----------------------------------------------------
      A | A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
      B | B C D E F G H I J K L M N O P Q R S T U V W X Y Z A
      C | C D E F G H I J K L M N O P Q R S T U V W X Y Z A B
      D | D E F G H I J K L M N O P Q R S T U V W X Y Z A B C
      E | E F G H I J K L M N O P Q R S T U V W X Y Z A B C D
                 ...
      Y | Y Z A B C D E F G H I J K L M N O P Q R S T U V W X
      Z | Z A B C D E F G H I J K L M N O P Q R S T U V W X Y

      For encryption each letter of the plaintext is paired with the corresponding letter of a repeating keyword. For
      example, the plaintext DASHBOARD is encrypted with the keyword LINUX:

      Plaintext: DASHBOARD
      Keyword:   LINUXLINU
      So, the first letter D is paired with the first letter of the key L. Therefore, row D and column L of the Vigenère
      square are used to get the first cipher letter O. This must be repeated for the whole ciphertext.

      You are given an array with two elements:
       ["FRAMELOGINPOPUPENTERLINUX", "REALTIME"]
      The first element is the plaintext, the second element is the keyword.

      Return the ciphertext as uppercase string.
   */

   solve(input: [string, string]): string {
      const plaintext = input[0].toUpperCase();
      let keyword = input[1].toUpperCase();
      let ciphertext = '';

      // Extend the keyword to match the length of the plaintext
      while (keyword.length < plaintext.length) {
         keyword += keyword;
      }
      keyword = keyword.substring(0, plaintext.length);

      for (let i = 0; i < plaintext.length; i++) {
         const plainChar = plaintext.charCodeAt(i) - 'A'.charCodeAt(0);
         const keyChar = keyword.charCodeAt(i) - 'A'.charCodeAt(0);
         if (plainChar >= 0 && plainChar < 26) {
            // Ensure character is a letter
            const cipherChar = (plainChar + keyChar) % 26;
            ciphertext += String.fromCharCode(cipherChar + 'A'.charCodeAt(0));
         } else {
            // Non-letter characters are copied as-is
            ciphertext += plaintext[i];
         }
      }

      return ciphertext;
   }
}
