const fs = require('fs');
const { env } = require('process');
function loadGraph(content) {
    let lines = content.split("\n");
    let graph = {};
    for (let line of lines) {
        let splitted = line.split("-");
        let start = splitted[0];
        let end = splitted[1];
        if (graph[start] == undefined) {
            graph[start] = [end];
        }
        else {
            graph[start].push(end);
        }
        if (graph[end] == undefined) {
            graph[end] = [start];
        }
        else {
            graph[end].push(start);
        }
    }
    return graph;
}
let allPaths = new Set();

function searchDFS(graph, start, path, pathSet) {

    let stack = [start];
    while (stack.length > 0) {
        path=stack.pop();
        let splitted=path.split(",");
         start=splitted[splitted.length-1];
        for (let next of graph[start]) {
            let nextPath=path+","+next;
            if(visitedSmallTwice(nextPath)){
                continue;
            }
           
            if (next == "end") {
              
                pathSet.add(nextPath);
            }
            else{
                stack.push(nextPath);

            }
        }
    }

}
let Task2_Enabled=true;
function visitedSmallTwice(path) {
    let prunedPaths=new Set();
   
        let counter = [];
        let splitted = path.split(",");
        for (let s of splitted) {
            if (!(s in counter) ) counter[s] = 0;
            counter[s] += 1;
        }
        let numAbove1=0;
        for (let c in counter) {
            if(!Task2_Enabled && c.toLocaleLowerCase()==c && counter[c]>1){
                return true;
            }
            else if(Task2_Enabled){
                if(c==c.toLocaleLowerCase() && counter[c]>2)return true;
               else if(c==c.toLocaleLowerCase() && counter[c]>1){
                   numAbove1++;
                 
               }
               if((c=="start" || c=="end") && counter[c]>1)return true;
                
            }
           
        }
        if(numAbove1>1){
            //console.log("wdw",numAbove2,path);
            return true;
        }
    return false;
}
function main(path,task) {
    Task2_Enabled=task==2;
    const inputFile = fs.readFileSync(path).toString();
    let graph = loadGraph(inputFile);
    let allPaths = new Set();
    
    searchDFS(graph, "start", "start", allPaths);
    console.log(allPaths.size)
    
}





main(process.argv[2],process.argv[3]);