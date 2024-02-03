/** @param {NS} ns **/
export async function main(ns) {
   ns.stanek.clearGift();

   for (const fragment of hackingSpec7x7) {
      ns.stanek.placeFragment(fragment.x, fragment.y, fragment.rotation, fragment.id);
   }
}

const hackingSpec7x7 = [
   {"id":7,"x":0,"y":4,"rotation":0,"effect":"+x% grow() power"},
   {"id":20,"x":3,"y":5,"rotation":0,"effect":"+x% hacknet production"},
   {"id":25,"x":5,"y":2,"rotation":3,"effect":"+x% reputation from factions and companies"},
   {"id":103,"x":0,"y":3,"rotation":2,"effect":"1.1x adjacent fragment power"},
   {"id":107,"x":3,"y":2,"rotation":2,"effect":"1.1x adjacent fragment power"},
   {"id":5,"x":1,"y":2,"rotation":0,"effect":"+x% faster hack(), grow(), and weaken()"},
   {"id":101,"x":0,"y":1,"rotation":0,"effect":"1.1x adjacent fragment power"},
   {"id":100,"x":4,"y":0,"rotation":0,"effect":"1.1x adjacent fragment power"},
   {"id":6,"x":1,"y":0,"rotation":0,"effect":"+x% hack() power"},
];
