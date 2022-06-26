package main

import (
	"bufio"
	"container/heap"
	"fmt"
	"log"
	"os"
    "strconv"
)
type Item struct{
    priority int
    value string
    index int
}
type GraphEdge[N comparable ,E any] struct{
    from *GraphNode[N,E];
    to *GraphNode[N,E];
    data E;
}
type GraphNode[N comparable,E any] struct{
    edges []GraphEdge[N,E]
    value N
}
type Graph[N comparable,E any] struct {
    nodes map[N]*GraphNode[N,E]
}
func getLineWidth(path string)(int){
    file, err := os.Open(path)
    if err != nil {
        log.Fatal(err)
    }
    defer file.Close()
    scanner := bufio.NewScanner(file)
    for scanner.Scan(){
        return len(scanner.Text())
    }
    return -1

}
func getMatrix(path string,task2 bool) ([][]int){
    size:=getLineWidth(path)
    dx,dy:=size,size
    a:= make([][]int, dy)       
    for i:=0;i<dy;i++ {
        a[i] = make([]int, dx)  
    }
    file, err := os.Open(path)
    if err != nil {
        log.Fatal(err)
    }
    defer file.Close()

    scanner := bufio.NewScanner(file)
    var x,y=0,0
    var graph=new((Graph[string,int]));
    graph.nodes=make(map[string]*GraphNode[string,int])
    for scanner.Scan() {
        var line=scanner.Text()
        for _,c :=range line{
            //fmt.Println("cool",c)
            var numValue int =int(c-'0') ;
            fmt.Println(x,y,numValue)
            a[y][x]=numValue
            x++
        }
        x=0
        y++

    }
    if(task2){
        ndy,ndx:=5*dx,5*dy
        b:= make([][]int, ndy)       
        for i:=0;i<ndy;i++ {
            b[i] = make([]int, ndx)  
        }
        for y:=0;y<dy;y++ {
            for x:=0;x<dx;x ++ {
                b[y][x]=a[y][x]
            }
        }
        for offsetY:=0;offsetY<5;offsetY++{
            for offsetX:=0;offsetX<5;offsetX++{
                if(offsetX==offsetY && offsetX==0){
                    continue
                }
                offset:=offsetX+offsetY
                for y:=0;y<dy;y++{
                    for x:=0;x<dx;x++{
                        b[y+offsetY*dy][x+offsetX*dx]=(a[y][x]+offset)%10
                    }
                }
            
            }
        }
        return b
    }
    return a
}
func load(path string,task2 bool) (*Graph[string,int]){

    var graph=new((Graph[string,int]));
    graph.nodes=make(map[string]*GraphNode[string,int])
    matrix:=getMatrix(path,task2)
    for y:=0;y<len(matrix);y++ {
        for x:=0;x<len(matrix);x++{
            //fmt.Println("cool",c)
            var numValue int =matrix[y][x]
            var pos=strconv.Itoa(x)+","+strconv.Itoa(y)
            if  _,ok:=graph.nodes[pos];!ok{
                var n=new (GraphNode[string,int])
                n.value=pos
                n.edges=make([]GraphEdge[string, int], 0)
                graph.nodes[pos]=n

            }
                addConnection(coordToString(x+1,y),graph,numValue,pos)
                addConnection(coordToString(x-1,y),graph,numValue,pos)
                addConnection(coordToString(x,y+1),graph,numValue,pos)
                addConnection(coordToString(x,y-1),graph,numValue,pos)
            
            
        }


    }
    return graph
}
func coordToString(x,y int)(string){
    return strconv.Itoa(x)+","+strconv.Itoa(y)
}
func addConnection(nPos string, graph *Graph[string,int], weight int,origPos string){
    if  _,ok:=graph.nodes[nPos];!ok{
        var n=new (GraphNode[string,int])
        n.value=nPos
        n.edges=make([]GraphEdge[string, int], 0)
        graph.nodes[nPos]=n

    }
    var edge=new (GraphEdge[string,int])
    edge.to=graph.nodes[nPos]
    edge.from=graph.nodes[origPos]
    edge.data=weight
    graph.nodes[origPos].edges = append(graph.nodes[origPos].edges, *edge)
    //print(" edge count  \n",len(graph.nodes[origPos].edges))

}
type PriorityQueue []*Item

func (pq PriorityQueue) Len() int { return len(pq) }

func (pq PriorityQueue) Less(i, j int) bool {
	// We want Pop to give us the highest, not lowest, priority so we use greater than here.
    
    return pq[i].priority < pq[j].priority
}

func (pq PriorityQueue) Swap(i, j int) {
	pq[i], pq[j] = pq[j], pq[i]
	pq[i].index = i
	pq[j].index = j
}
func (pq *PriorityQueue) Push(x any) {
	n := len(*pq)
	item := x.(*Item)
	item.index = n
	*pq = append(*pq, item)
}
func (pq* PriorityQueue) find(value string) (*Item){
    for _,val:=range *pq{
        if(val.value==value){
            return val
        }
    }
    return nil
}

func (pq *PriorityQueue) Pop() any {
	old := *pq
	n := len(old)
	item := old[n-1]
	old[n-1] = nil  // avoid memory leak
	item.index = -1 // for safety
	*pq = old[0 : n-1]
	return item
}

// update modifies the priority and value of an Item in the queue.
func (pq *PriorityQueue) update(item *Item, value string, priority int) {
	item.value = value
	item.priority = priority
	heap.Fix(pq, item.index)
}
func dijakstra(graph Graph[string,int],size int) (int){
    var lastX,lastY=size-1,size-1
    var lastPos=strconv.Itoa(lastX)+","+strconv.Itoa(lastY)
    var visited=make(map[string]bool)
    var distMap =make(map[string]int)

    pq := make(PriorityQueue,0)
    heap.Push(&pq,&Item{priority: 0,value: "0,0"})
    for len(pq)>0{
        //fmt.Println("new round")
        var curr=heap.Pop(&pq).(*Item)
       //fmt.Println("found2",curr.value,curr.priority)
        visited[curr.value]=true
        distMap[curr.value]=curr.priority
        var node=graph.nodes[curr.value]
        for _,edge:= range node.edges{
            //fmt.Println("edge",node.value,curr.value)
            //fmt.Println("Node to",edge.from.value)
            var newPrio=curr.priority+edge.data
            var oldItem=pq.find(edge.to.value)
            if _,ok :=visited[edge.to.value];ok{
                continue
            }
            if(oldItem==nil){
                pq.Push(&Item{value:edge.to.value,priority: newPrio})
            }else if(oldItem!=nil && newPrio<oldItem.priority){
                if  _,ok:=graph.nodes[oldItem.value];!ok{
                    continue
                }
                pq.update(oldItem,oldItem.value,newPrio)
            }
            
        }
        

    }
    fmt.Println("HZEE",lastPos)

    return distMap[lastPos]
}


func main()  {
    fmt.Println("Hello, world.")
    var task2=true
    var graph=load(os.Args[1],task2)
    var size=getLineWidth(os.Args[1])
    if task2{
        size*=5
    }
    val:=dijakstra(*graph,size)
    fmt.Printf("Task 1: %v\n", val)
    
}
