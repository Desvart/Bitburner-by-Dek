// const space: number[][][][] = [];
//
// const maxSize: number = 500;
//
// // Initialize the 4D array
// for (let i = 0; i < maxSize; i++) {
//    space[i] = [];
//    for (let j = 0; j < maxSize; j++) {
//       space[i][j] = [];
//       for (let k = 0; k < maxSize; k++) {
//          space[i][j][k] = [];
//          for (let l = 0; l < maxSize; l++) {
//             space[i][j][k][l] = 0;
//          }
//       }
//    }
// }
//
// for (let realQty = 0; realQty < maxSize; realQty++) {
//    for (let aiQty = 0; aiQty < maxSize; aiQty++) {
//       for (let robQty = 0; robQty < maxSize; robQty++) {
//          for (let hardQty = 0; hardQty < maxSize; hardQty++) {
//             space[realQty][aiQty][robQty][hardQty] =
//                (0.002 * realQty + 1) ** 0.75 *
//                (0.002 * hardQty + 1) ** 0.2 *
//                (0.002 * robQty + 1) ** 0.3 *
//                (0.002 * aiQty + 1) ** 0.3;
//          }
//       }
//    }
// }
//
// const real0Space: number[][][] = space[0];
//
// let maxVal = real0Space[0][0][0];
// let maxIndices = [0, 0, 0];
//
// for (let i = 0; i < real0Space.length; i++) {
//    for (let j = 0; j < real0Space[i].length; j++) {
//       for (let k = 0; k < real0Space[i][j].length; k++) {
//          if (real0Space[i][j][k] > maxVal) {
//             maxVal = real0Space[i][j][k];
//             maxIndices = [i, j, k];
//          }
//       }
//    }
// }
//
// console.log(`Max value is ${maxVal} at indices ${maxIndices}`);
//
//

const space: Map<string, number> = new Map();

const maxSize: number = 500;

for (let realQty = 0; realQty < 1; realQty++) {
   for (let aiQty = 0; aiQty < maxSize; aiQty++) {
      for (let robQty = 0; robQty < maxSize; robQty++) {
         for (let hardQty = 0; hardQty < maxSize; hardQty++) {
            const key = `${realQty},${aiQty},${robQty},${hardQty}`;
            space.set(
               key,
               (0.002 * realQty + 1) ** 0.75 *
                  (0.002 * hardQty + 1) ** 0.2 *
                  (0.002 * robQty + 1) ** 0.3 *
                  (0.002 * aiQty + 1) ** 0.3
            );
         }
      }
   }
}

let maxVal = -Infinity;
let maxKey = '';

for (const [key, value] of space.entries()) {
   if (value > maxVal) {
      maxVal = value;
      maxKey = key;
   }
}

console.log(`Max value is ${maxVal} at indices ${maxKey}`);
