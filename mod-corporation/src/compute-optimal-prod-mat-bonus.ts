import { NS as INs } from '@ns';

/** @param {NS} ns */
export async function main(ns: INs): Promise<void> {
   let warehouses = getWarehouses(ns);
   console.log(`Warehouses:`, warehouses);
   const m = 100;

   const factors = getFactors(ns);
   console.log(`Factors:`, factors);
   const divMult = getDivMult(warehouses, factors);
   console.log(`Division multiplier: ${divMult}`);

   let updateWarehouses = JSON.parse(JSON.stringify(warehouses));

   const realEstateData = ns.corporation.getMaterialData('Real Estate');
   const aiCoresData = ns.corporation.getMaterialData('AI Cores');
   const robotsData = ns.corporation.getMaterialData('Robots');
   const hardwareData = ns.corporation.getMaterialData('Hardware');

   console.log(`Real estate:`, realEstateData);
   console.log(`AI cores`, aiCoresData);
   console.log(`Robots`, robotsData);
   console.log(`Hardware`, hardwareData);

   const iterations = (ns.args[0] as number) - warehouses.reduce((a, b) => a + b, 0);
   for (let i = 0; i < iterations; i++) {
      const optimalUpdate = getOptimalUpdate(updateWarehouses, factors);
      //console.log(`Optimal update: ${getLocationFromIndex(optimalUpdate)}`);
      updateWarehouses[optimalUpdate] += 1;
   }

   const updateDivMult = getDivMult(updateWarehouses, factors);
   console.log('Update warehouses:', updateWarehouses);
   console.log(`Division multiplier after update: ${updateDivMult}`);
   ns.tprint(`Division multiplier after update: ${updateDivMult}`);
   ns.tprint(updateWarehouses.slice(0, 4));
   ns.tprint(updateWarehouses.slice(4, 8));
   ns.tprint(updateWarehouses.slice(8, 12));
   ns.tprint(updateWarehouses.slice(12, 16));
   ns.tprint(updateWarehouses.slice(16, 20));
   ns.tprint(updateWarehouses.slice(20, 24));
   ns.tprint(' ');
}

function rdm(max: number, min: number = 0): number {
   return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getLocationFromIndex(idx: number): string {
   const cityIdx = Math.floor(idx / 4);
   const materialIdx = idx % 4;
   const city = ['Sector-12', 'Aevum', 'Chongqing', 'New Tokyo', 'Ishima', 'Volhaven'][cityIdx];
   const material = ['Hardware', 'Robots', 'AI Cores', 'Real Estate'][materialIdx];
   return `${city} ${material}`;
}

function getOptimalUpdate(warehouses: number[], factors: number[]): number {
   let maxDeltaBonus = 0;
   let bestWarehouseIdx = -1;

   const oldBonus = getDivMult(warehouses, factors);

   for (let i = 0; i < warehouses.length; i++) {
      const newWarehouses = JSON.parse(JSON.stringify(warehouses));
      newWarehouses[i] += 1;
      const newBonus = getDivMult(newWarehouses, factors);

      const deltaBonus: number = newBonus - oldBonus;
      if (deltaBonus > maxDeltaBonus) {
         bestWarehouseIdx = i;
         maxDeltaBonus = deltaBonus;
      }
   }
   return bestWarehouseIdx;
}

function getDivMult(warehouses: number[], factors: number[]): number {
   const cityMult: number[] = [];
   for (let i = 0; i < warehouses.length; i += 4) {
      const warehouse = warehouses.slice(i, i + 4);
      //console.log(`Iteration ${i}: ${warehouses} - ${warehouse}`);
      cityMult.push(calcCityMult(warehouse, factors));
   }
   return calcDivMult(cityMult);
}

function calcDivMult(cityMult: number[]): number {
   let multSum = 0;
   cityMult.forEach((city) => {
      multSum += city ** 0.73;
   });
   return Math.max(multSum, 1);
}

function calcCityMult(warehouse: number[], factors: number[]): number {
   return (
      (0.002 * warehouse[0] + 1) ** factors[0] *
      (0.002 * warehouse[1] + 1) ** factors[1] *
      (0.002 * warehouse[2] + 1) ** factors[2] *
      (0.002 * warehouse[3] + 1) ** factors[3]
   );
}

function getWarehouses(ns: INs): number[] {
   const warehouses: number[] = [];
   const corp = ns.corporation.getCorporation();
   console.log(`Corporation:`, corp);
   const div = ns.corporation.getDivision(corp.divisions[3]);
   console.log(`Division:`, div);
   div.cities.forEach((city) => {
      warehouses.push(ns.corporation.getMaterial(div.name, city, 'Hardware').stored);
      warehouses.push(ns.corporation.getMaterial(div.name, city, 'Robots').stored);
      warehouses.push(ns.corporation.getMaterial(div.name, city, 'AI Cores').stored);
      warehouses.push(ns.corporation.getMaterial(div.name, city, 'Real Estate').stored);
   });
   return warehouses;
}

function getFactors(ns: INs): number[] {
   const industryData = ns.corporation.getIndustryData('Chemical');
   console.log(`Industry:`, industryData);
   return [
      industryData.hardwareFactor ?? 0,
      industryData.robotFactor ?? 0,
      industryData.aiCoreFactor ?? 0,
      industryData.realEstateFactor ?? 0,
   ];
}

/** @param {NS} ns */
export async function main2(ns: INs): Promise<void> {
   const corp = ns.corporation.getCorporation();
   const div = ns.corporation.getDivision(corp.divisions[0]);
   console.log(`Division:`, div);

   const cityData = ns.corporation.getOffice(corp.divisions[0], div.cities[0]);
   console.log(`City:`, cityData);

   const warehouseData = ns.corporation.getWarehouse(corp.divisions[0], div.cities[0]);
   console.log(`Warehouse:`, warehouseData);

   const industryData = ns.corporation.getIndustryData('Agriculture');
   console.log(`Industry:`, industryData);
   console.log(
      `Bonus factor: ${industryData.hardwareFactor} hardware, ${industryData.robotFactor} robots, ${industryData.aiCoreFactor} AI cores, ${industryData.realEstateFactor} real estate`
   );

   const factors = new Factors(
      industryData.hardwareFactor as number,
      industryData.robotFactor as number,
      industryData.aiCoreFactor as number,
      industryData.realEstateFactor as number
   );

   console.log(`Factors:`, factors);

   const realEstateData = ns.corporation.getMaterialData('Real Estate');
   const aiCoresData = ns.corporation.getMaterialData('AI Cores');
   const robotsData = ns.corporation.getMaterialData('Robots');
   const hardwareData = ns.corporation.getMaterialData('Hardware');

   console.log(`Real estate:`, realEstateData);
   console.log(`AI cores`, aiCoresData);
   console.log(`Robots`, robotsData);
   console.log(`Hardware`, hardwareData);

   const warehouses: Warehouse[] = [];
   div.cities.forEach((city) => {
      const hardware = ns.corporation.getMaterial(div.name, city, 'Hardware');
      const robots = ns.corporation.getMaterial(div.name, city, 'Robots');
      const aiCores = ns.corporation.getMaterial(div.name, city, 'AI Cores');
      const realEstate = ns.corporation.getMaterial(div.name, city, 'Real Estate');
      warehouses.push(new Warehouse(hardware.stored, robots.stored, aiCores.stored, realEstate.stored));
   });

   const bonusInputData: number[][] = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
   ];
   let cityIdx = 0;
   for (const city of div.cities) {
      bonusInputData[cityIdx][0] = ns.corporation.getMaterial(div.name, city, 'Hardware').stored;
      bonusInputData[cityIdx][1] = ns.corporation.getMaterial(div.name, city, 'Robots').stored;
      bonusInputData[cityIdx][2] = ns.corporation.getMaterial(div.name, city, 'AI Cores').stored;
      bonusInputData[cityIdx][3] = ns.corporation.getMaterial(div.name, city, 'Real Estate').stored;
      cityIdx += 1;
   }

   const bonus = productionFactor2(bonusInputData, factors);
   console.log(`Production bonus: ${bonus}`);

   let maxIncrease = 0;
   let bestCityIdx = -1;
   let bestMaterialIdx = -1;

   for (let cityIdx2 = 0; cityIdx2 < bonusInputData.length; cityIdx2++) {
      for (let materialIdx = 0; materialIdx < bonusInputData[cityIdx2].length; materialIdx++) {
         // Create a copy of the bonusInputData array
         const newBonusInputData = JSON.parse(JSON.stringify(bonusInputData));

         // Increment the material quantity by 1
         newBonusInputData[cityIdx2][materialIdx] += 1000000;

         // Calculate the production bonus with the incremented material quantity
         const newBonus = productionFactor2(newBonusInputData, factors);
         console.log(`New bonus ${cityIdx2}-${materialIdx}: ${newBonus}`);

         // Calculate the original production bonus
         const originalBonus = productionFactor2(bonusInputData, factors);

         // Find the increase in production bonus
         const increase = newBonus - originalBonus;

         // If the increase is greater than the current maximum, update the maximum and store the current city and material
         if (increase > maxIncrease) {
            maxIncrease = increase;
            bestCityIdx = cityIdx2;
            bestMaterialIdx = materialIdx;
         }
      }
   }

   console.log(`The best material to increment is at city index ${bestCityIdx} and material index ${bestMaterialIdx}`);
}

class Factors {
   hardware: number;
   robots: number;
   aiCores: number;
   realEstate: number;

   constructor(hardware: number, robots: number, aiCores: number, realEstate: number) {
      this.hardware = hardware;
      this.robots = robots;
      this.aiCores = aiCores;
      this.realEstate = realEstate;
   }
}

class Warehouse {
   hardware: number;
   robots: number;
   aiCores: number;
   realEstate: number;

   constructor(hardware: number, robots: number, aiCores: number, realEstate: number) {
      this.hardware = hardware;
      this.robots = robots;
      this.aiCores = aiCores;
      this.realEstate = realEstate;
   }
}

function productionFactor(warehouses: Warehouse[], factors: Factors): number {
   let multSum = 0;
   warehouses.forEach((warehouse) => {
      const cityMult =
         (0.002 * warehouse.realEstate + 1) ** factors.realEstate *
         (0.002 * warehouse.hardware + 1) ** factors.hardware *
         (0.002 * warehouse.robots + 1) ** factors.robots *
         (0.002 * warehouse.aiCores + 1) ** factors.aiCores;
      multSum += cityMult ** 0.73;
   });

   return Math.min(multSum, 1);
}

function productionFactor2(warehouses: number[][], factors: Factors): number {
   let multSum = 0;

   warehouses.forEach((warehouse) => {
      const cityMult =
         (0.002 * warehouse[3] + 1) ** factors.realEstate *
         (0.002 * warehouse[0] + 1) ** factors.hardware *
         (0.002 * warehouse[1] + 1) ** factors.robots *
         (0.002 * warehouse[2] + 1) ** factors.aiCores;
      multSum += cityMult ** 0.73;
   });

   return Math.min(multSum, 1);
}
