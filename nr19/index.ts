import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { argv, } from "process";

interface Point {
  x: number;
  y: number;
  z: number;
}

class Scanner {
  public offset: Point;
  public beacons: Point[];
  public id: number;
  public uid=randomUUID();
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
      if (otherPoints.has(pt)) counter++;
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
            tempScanner.offset=offset;
            hasRotated.add(tempScanner.id);
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
  scanners.push(Scanner.fromIdAndPoints(no, beacons))
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
const hasRotated: Set<number> = new Set();
function processScanners(scanners: Scanner[]) {
  hasRotated.add(0);
  let awaiting: Scanner[] = [scanners[0]]
  let finnished: Scanner[] =scanners.filter((s)=>s.id!=0);

  let result = [scanners[0]];
  while (awaiting.length > 0) {
    let curr = awaiting.shift()!;
    for(let i=0;i<finnished.length;i++){
      let res=curr.createFittingScanner(finnished[i]);
      if(res!=null){
        scanners=scanners.filter((s)=>s.uid!=finnished[i].uid);
        scanners.push(res);
        awaiting.push(res);
        finnished[i]=res;
      }
    }
    for (let a of awaiting){
      finnished=finnished.filter((s)=>s.uid!=a.uid);
    }
   
  }
  return scanners;
}

let path = argv[2];
let scanners = loadData(path);
let transformedScanners = processScanners(scanners);
let points: Set<string> = new Set();
let task2=argv.length>3;
if(task2){
  let maxManhattan=-1;
  for(let i =1;i<transformedScanners.length;i++){
    for(let j=0;j<i;j++){
      let s1=transformedScanners[i];
      let s2=transformedScanners[j];
      let manhattan=Math.abs(s1.offset.x-s2.offset.x)+Math.abs(s1.offset.y-s2.offset.y)+Math.abs(s1.offset.z-s2.offset.z);
      if(manhattan>maxManhattan){
        maxManhattan=manhattan;
      }
    }
  }
  console.log(maxManhattan);
}
else{
  for (let scanner of transformedScanners) {
    for (let pt of scanner.beacons) {
      points.add(JSON.stringify(pt));
    }
  }
  
  console.log(points.size);
}

