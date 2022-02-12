package main

import (
	"io/ioutil"
	"os"
	"strconv"
	"strings"
)
func maxInt(a int,b int) int{
	if(a>b){
		return a
	}else{
		return b
	}
}
func main() {

	path := os.Args[1]
	bytes, err := ioutil.ReadFile(path)
	grouped := make([]int, 9)
	if err == nil {
		content := string(bytes)
		content = strings.Trim(content, "\n ")
		splitted := strings.Split(content, ",")
		for _, item := range splitted {

			parsed, _ := strconv.ParseInt(item, 10, 32)
			grouped[parsed]++
			//timerValues=append(timerValues,int(parsed))

		}
		//352195
		// 1600306001288
		const DAYS = 256
		
		for i := 0; i < DAYS; i++ {
			var lastAdded=grouped[0]		
			for j := 1; j <=8; j++ {	 
				grouped[j-1] =grouped[j]	
			}
			grouped[6]+=lastAdded
			grouped[8]=lastAdded
		}
		var sum uint64 = 0
		for _, item := range grouped {
			sum += uint64(item)

		}
		println(sum)

	}
}



