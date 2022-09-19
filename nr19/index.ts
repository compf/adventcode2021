import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { argv, argv0, listenerCount, off } from "process";
import { stringify } from "querystring";
interface Point {
  x: number;
  y: number;
  z: number;
}
class Scanner {
  public offset: Point;
  public beacons: Point[];
  public id: number;
  public hasRotated = false;
  static fromIdAndPoints(id: number, beacons: Point[]): Scanner {
    return new Scanner({ x: 0, y: 0, z: 0 }, beacons, id);
  }
  enoughMatchingPoints(otherScanner: Scanner): boolean {
    const minimumMatchingPoints = 12;
    let counter = 0;
    let myPoints = this.beacons.map((p) => JSON.stringify(p));
    let otherPoints = new Set(
      otherScanner.beacons.map((p) => JSON.stringify(p))
    );
    for (let pt of myPoints) {
      if (otherPoints.has(pt)) 7;
      counter++;
    }
    return counter >= minimumMatchingPoints;
  }
  createFittingScanner(otherScanner: Scanner): Scanner | null {
    for (let order of PermutationOrder) {
      let rotatedScanner = Scanner.fromScannerAndRotation(otherScanner, order);
      for (let srcPoint of this.beacons) {
        for (let dstPoint of rotatedScanner.beacons) {
          let offset = {
            x: srcPoint.x - dstPoint.x,
            y: srcPoint.y - dstPoint.y,
            z: srcPoint.z - dstPoint.z,
          };
          let tempScanner = Scanner.fromScannerAndOffset(
            rotatedScanner,
            offset
          );
          if (this.enoughMatchingPoints(tempScanner)) {
            tempScanner.hasRotated = true;
            return tempScanner;
          }
        }
      }
    }
    return null;
  }
  static fromScannerAndRotation(
    templateScanner: Scanner,
    rotation: String
  ): Scanner {
    let beacons: Point[] = [];
    for (let pt of templateScanner.beacons) {
      let coords = [pt.x, pt.y, pt.z];
      let lastFactor = 1;
      let coordCounter = 0;
      let newPoint: Point = { x: 0, y: 0, z: 0 };
      for (let c of rotation) {
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
      beacons.push(newPoint);
    }
    return new Scanner(templateScanner.offset, beacons, templateScanner.id);
  }
  static fromScannerAndOffset(scanner: Scanner, offset: Point): Scanner {
    let beacons: Point[] = [];
    let newScanner = new Scanner({ x: 0, y: 0, z: 0 }, beacons, scanner.id);
    for (let pt of scanner.beacons) {
      beacons.push({
        x: offset.x + pt.x,
        y: offset.y + pt.y,
        z: offset.z + pt.z,
      });
    }
    return newScanner;
  }
  private constructor(offset: Point, beacons: Point[], id: number) {
    this.offset = offset;
    this.beacons = beacons;
    this.id = id;
  }
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

function loadData(path: string): Scanner[] {
  let no = -1;
  let scanners: Scanner[] = [];
  let beacons: Point[] = [];
  let lines = readFileSync(path, { encoding: "utf-8" }).split("\n");
  for (let line of lines) {
    if (line.startsWith("---")) {
      if (beacons.length > 0) {
        scanners.push(Scanner.fromIdAndPoints(no, beacons));
      }
      no = parseInt(line.match(/\d+/)![0]!);
      beacons = [];
    } else if (line == "") {
      continue;
    } else {
      let splitted = line.split(",");
      let pt = {
        x: parseInt(splitted[0]),
        y: parseInt(splitted[1]),
        z: parseInt(splitted[2]),
      };
      beacons.push(pt);
    }
  }
  return scanners;
}
function checkOrderValid(order: string): boolean {
  let mat: number[][] = [[], [], []];
  let lastFactor = 1;
  let coordCounter = 0;
  for (let c of order) {
    switch (c) {
      case "+":
        lastFactor = 1;
        break;
      case "-":
        lastFactor = -1;
        break;
      case "x":
        mat[coordCounter++] = [lastFactor, 0, 0];
        break;
      case "y":
        mat[coordCounter++] = [0, lastFactor, 0];
        break;
      case "z":
        mat[coordCounter++] = [0, 0, lastFactor];
        break;
    }
  }
  let determinant = mat[0][0] * (mat[1][1] * mat[2][2] - mat[1][2] * mat[2][1]);
  determinant -= mat[0][1] * (mat[1][0] * mat[2][2] - mat[1][2] * mat[2][0]);
  determinant += mat[0][2] * (mat[1][0] * mat[2][1] - mat[1][1] * mat[2][0]);
  return determinant == 1;
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
                let order =
                  prefix[px] +
                  coord[x] +
                  prefix[py] +
                  coord[y] +
                  prefix[pz] +
                  coord[z];
                if (checkOrderValid(order)) result.push(order);
              }
            }
          }
        }
      }
    }
  }
  return result;
})();

function processScanners(scanners: Scanner[]) {
  scanners[0].hasRotated = true;
    let resultingScanners=[scanners[0]];
  while (scanners.some((s) => !s.hasRotated)) {
    let notRotatedScanner = scanners.filter((s) => !s.hasRotated)[0];
    let rotatedScanners = scanners.filter((s) => s.hasRotated);
    let lastScanner: Scanner | null = null;
    let index = 0;
    while (lastScanner == null) {
      lastScanner =
        rotatedScanners[index].createFittingScanner(notRotatedScanner);
    }
    resultingScanners.push(lastScanner);
  }
  return resultingScanners;
}

let path = argv[2];
let scanners = loadData(path);
let transformedScanners=processScanners(scanners)
let points:Set<string>=new Set();
for(let scanner of transformedScanners){
    for(let pt of scanner.beacons){
        points.add(JSON.stringify(pt));
    }
}
console.log(points.size);

