const { exit } = require("process");

fs=require("fs");
if(process.argv.length<3){
    console.log("Please provide path to input, exiting");
    exit(-1)
}

let lines=fs.readFileSync(process.argv[2]).toString().split("\n");
let numberLines=lines.length;
let colWidth=lines[0].length;
let resultArray=[]

for(let i=0;i<colWidth;i++){
    resultArray.push(0);
}

for(let col=0;col<colWidth;col++){
   for(let line of lines){
       if(line.charAt(col)=="1"){
           resultArray[col]++;
       }
   }
}
let result="";
for(let r of resultArray){
    if(r>=numberLines/2)result+="1";
    else result+="0";
}


function toInt(value){
    let val=0;
    let power=1;
    for(let j=value.length-1;j>=0;j--){
        if(value.charAt(j)=='1')val+=power;
        power*=2;
    }
    return val;
}
function reverseBinary(result){
    let copy="";
    for(let i=0;i<result.length;i++){
        if(result.charAt(i)=='0')copy+="1";
        else copy+="0";
    }
    console.log(copy)
    return copy;
}

resultInt=toInt(result)
let resultInv=toInt(reverseBinary(result));
console.log(resultInt*resultInv);



function getOnesZeroes(list,col){
    let zeroes=[];
    let ones=[];
    for(let i=0;i<list.length;i++){
        if(list[i].charAt(col)=='1'){
            ones.push(list[i]);
        }
        else{
            zeroes.push(list[i]);
        }
    }
    return{ones,zeroes};
  
}
function getNextIteration(oneZeroes){
    if(oneZeroes.ones.length>=oneZeroes.zeroes.length){
        return {oxygen:oneZeroes.ones,co2:oneZeroes.zeroes};
    }
    else if(oneZeroes.ones.length<oneZeroes.zeroes.length){
        return {co2:oneZeroes.ones,oxygen:oneZeroes.zeroes};
    }
}
result={oxygen:lines,co2:lines}
for(let col=0;col<colWidth;col++){
    let one_zeroes=[]
    let r=[]
    if(result.oxygen.length>1){
        one_zeroes=getOnesZeroes(result.oxygen,col);
        r=getNextIteration(one_zeroes);
        result.oxygen=r.oxygen;
    }
    if(result.co2.length>1){
        one_zeroes=getOnesZeroes(result.co2,col);
        r=getNextIteration(one_zeroes);
        result.co2=r.co2;
    }
     

    
}
let nr1=toInt(result.oxygen[0]);
let nr2=toInt(result.co2[0])
console.log(result)
console.log(nr1*nr2)