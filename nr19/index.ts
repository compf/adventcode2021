import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { argv, argv0, listenerCount } from "process";
import { stringify } from "querystring";
interface Point {
  x: number;
  y: number;
  z: number;
  id: string;
}
class BiMap<A, B> {
  private a_b: Map<A, B> = new Map();
  private b_a: Map<B, A> = new Map();
  public set(a: A, b: B) {
    this.a_b.set(a, b);
    this.b_a.set(b, a);
  }
  public getAB(a: A) {
    return this.a_b.get(a);
  }
  public getBA(b: B) {
    return this.b_a.get(b);
  }
}
interface NodePointsMap extends Map<number, Point[]> {}
const ScannerBeaconPosMap: Map<string, Point> = new Map();
const ScannerIdMap: BiMap<number, string> = new BiMap();
function loadData(path: string): NodePointsMap {
  let dict: NodePointsMap = new Map();
  let no = -1;
  let scannerId = "";
  let lines = readFileSync(path, { encoding: "utf-8" }).split("\n");
  for (let line of lines) {
    if (line.startsWith("---")) {
      no = parseInt(line.match(/\d+/)![0]!);
      dict.set(no, []);
      scannerId = randomUUID();
      ScannerIdMap.set(no, scannerId);
    } else if (line == "") {
      continue;
    } else {
      let splitted = line.split(",");
      let pt = {
        x: parseInt(splitted[0]),
        y: parseInt(splitted[1]),
        z: parseInt(splitted[2]),
        id: randomUUID(),
      };
      ScannerBeaconPosMap.set(
        JSON.stringify({ scanner: no, beacon: pt.id }),
        pt
      );
      dict.get(no)?.push(pt);
    }
  }
  return dict;
}
const PermutationOrder = (function () {
  const prefix = "+-";
  const coord = "xyz";
  let result = [];
  for (let px = 0; px < prefix.length; px++) {
    for (let x = 0; x < coord.length; x++) {
      for (let py = 0; py < prefix.length; py++) {
        for (let y = 0; y < coord.length; y++) {
          for (let pz = 0; pz < prefix.length; pz++) {
            for (let z = 0; z < coord.length; z++) {
              if (x !== y && y !== z && x !== z) {
                result.push(
                  prefix[px] +
                    coord[x] +
                    prefix[py] +
                    coord[y] +
                    prefix[pz] +
                    coord[z]
                );
              }
            }
          }
        }
      }
    }
  }
  return result;
})();
function applyPermutation(pt: Point, input: string) {
  let coords = [pt.x, pt.y, pt.z];
  let lastFactor = 1;
  let coordCounter = 0;
  let newPoint: Point = { x: 0, y: 0, z: 0, id: pt.id };
  for (let c of input) {
    switch (c) {
      case "+":
        lastFactor = 1;
        break;
      case "-":
        lastFactor = -1;
        break;
      case "z":
      case "y":
      case "x":
        newPoint[c] = lastFactor * coords[coordCounter];
        coordCounter++;
        break;
    }
  }
  return newPoint;
}
function getPermutations(pt: Point) {
  let result: Point[] = [];
  for (let order of PermutationOrder) {
    result.push(applyPermutation(pt, order!));
  }
  return result;
}
function findBeaconsRelativeEachOther(nodes: NodePointsMap) {
  let nodesRelativeVector: Map<number, (Point & { id_from: string })[]> =
    new Map();
  for (let nodeId of nodes.keys()) {
    nodesRelativeVector.set(nodeId, []);
    for (let i = 1; i < nodes.get(nodeId)?.length!; i++) {
      for (let j = 0; j < i; j++) {
        let p1 = nodes.get(nodeId)![i];
        let p2 = nodes.get(nodeId)![j];
        let diff = {
          x: p1.x - p2.x,
          y: p1.y - p2.y,
          z: p1.z - p2.z,
          id: p1.id,
          id_from: p2.id,
        };
        nodesRelativeVector.get(nodeId)?.push(diff);
      }
    }
  }

  return nodesRelativeVector;
}
function product<T>(a: Iterable<T>, b: Iterable<T>) {
  let result = new Set<Set<T>>();
  for (let i of a) {
    for (let j of b) {
      if (i != j) result.add(new Set([i, j]));
    }
  }
  return result;
}
function findOverlappingBeacons(
  nodesRelativeVector: Map<number, (Point & { id_from: string })[]>
) {
  let keys = Array.from(nodesRelativeVector.keys());
  let n1 = 0;
  while (hasRotated.size < nodesRelativeVector.size) {
    for (let i = 1; i < keys.length; i++) {
      let n2 = i;
      checkBeacons(nodesRelativeVector, n1, n2);
    }
    do {
      n1++;
    } while (!hasRotated.has(n1));
  }
}
function copyPointCoord(src: Point, dst: Point) {
  dst.x = src.x;
  dst.y = src.y;
  dst.z = src.z;
  dst.id = src.id;
}
function updateBeacon(
  scannerId: number,
  oldBeaconId: string,
  newBeaconId: string,
  order: string
): Point {
  let key = JSON.stringify({ scanner: scannerId, beacon: oldBeaconId });
  //console.log(ScannerBeaconPosMap.has(key),key);
  let pt = ScannerBeaconPosMap.get(key);

  pt!.id = newBeaconId;
  let transformed = applyPermutation(pt!, order);
  copyPointCoord(transformed, pt!);
  return pt!;
}
const hasRotated: Set<number> = new Set();
function checkBeacons(
  nodesRelativeVector: Map<number, (Point & { id_from: string })[]>,
  n1: number,
  n2: number
) {
    let minVector:Point|null=null
    let minDistance=1e100;
  let pairs = product(
    nodesRelativeVector.get(n1)!,
    nodesRelativeVector.get(n2)!
  );
  let outIndex = { index: 0 };

  let transformationKindCounter = new Map<string, number>();
  for (let pair of pairs) {
    let ls = Array.from(pair);
    let b1 = ls[0];
    let b2 = ls[1];
    if (b2 == undefined) console.log(b2, pair);
    //console.log(b2,b1);

    if (areSameRelativeVectors(b2, b1, outIndex)) {
      const order = PermutationOrder[outIndex.index];
      hasRotated.add(n2);
      //console.log(ScannerBeaconPosMap.has(key),key);
      let fromN2 = updateBeacon(n2, b2.id, b1.id, order);

      let fromN1 = updateBeacon(n1, b1.id, b2.id, PermutationOrder[0]);

      let N2FromN1 = {
        x: fromN1.x + -fromN2.x,
        y: fromN1.y + -fromN2.y,
        z: fromN1.z + -fromN2.z,
        id: n2 + "_from_" + n1,
      };
      const dist=N2FromN1.x*N2FromN1.x+N2FromN1.y*N2FromN1.y+N2FromN1.z*N2FromN1.z;
      if(dist<minDistance){
        minDistance=dist;
        minVector=N2FromN1;
      }
      ScannerBeaconPosMap.set(
        JSON.stringify({ scanner: n1, beacon: n2 }),
        N2FromN1
      );

      fromN2 = updateBeacon(n2, b2.id_from, b1.id_from, order);

      fromN1 = updateBeacon(n1, b1.id_from, b2.id_from, order);

      //b2.id = b1.id;
      //b2.id_from = b1.id_from;
      let transformed = applyPermutation(b1, order);
      //console.log("Before",b1.x,b1.y,b1.z);
      //console.log("After",transformed.x,transformed.y,transformed.z);
      b2.x = transformed.x;
      b2.y = transformed.y;
      b2.z = transformed.z;
      if (!transformationKindCounter.has(order)) {
        transformationKindCounter.set(order, 0);
      }
      transformationKindCounter.set(
        order,
        transformationKindCounter.get(order)! + 1
      );
    }
  }

}
function getRelativeVectorFromScanner0() {
  let currScannerEdges: Array<string> = [];
  for (let key of ScannerBeaconPosMap.keys()) {
    let parsed = JSON.parse(key) as { scanner: number; beacon: string };
    if (isNaN(Number(parsed.beacon))) continue;
    currScannerEdges.push(key);
  }
  let allScannerEdges: Set<string> = new Set();
  for (let i = 1; i < nodes.size; i++) {
    let queue: Array<{ from: number; vector: Point }> = [];
    queue.push({ from: 0, vector: { x: 0, y: 0, z: 0, id: i + "" } });
    while (queue.length > 0) {
      let curr = queue.shift()!;
      if (curr.from == i) {
        let key = JSON.stringify({ scanner: 0, beacon: i + "" });
        allScannerEdges.add(key);
        ScannerBeaconPosMap.set(key, curr.vector);
      }
      for (let key of currScannerEdges) {
        let dir = ScannerBeaconPosMap.get(key)!;
        let parsed = JSON.parse(key) as { scanner: number; beacon: string };
        if (parsed.scanner == curr.from) {
          queue.push({
            from: parseInt(parsed.beacon),
            vector: {
              x: curr.vector.x + dir.x,
              y: curr.vector.y + dir.y,
              z: curr.vector.z + dir.z,
              id: curr.vector.id,
            },
          });
        }
      }
    }
  }
  return allScannerEdges;
}
function areSameRelativeVectors(
  v1: Point,
  v2: Point,
  outIndex: { index: number }
): boolean {
  if (v1 == undefined) {
    console.log("test");
  }
  let permutations = getPermutations(v1);
  for (let i = 0; i < permutations.length; i++) {
    if (
      permutations[i].x == v2.x &&
      permutations[i].y == v2.y &&
      permutations[i].z == v2.z
    ) {
      outIndex.index = i;
      return true;
    }
  }
  return false;
}
let path = argv[2];
hasRotated.add(0);
let nodes = loadData(path);
let nodesRelativeVector = findBeaconsRelativeEachOther(nodes);
let d = findOverlappingBeacons(nodesRelativeVector);

let scannerEdges = getRelativeVectorFromScanner0();

