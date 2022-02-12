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
		println("cool")
		content := string(bytes)
		content = strings.Trim(content, "\n ")
		splitted := strings.Split(content, ",")

		for _, item := range splitted {

			parsed, _ := strconv.ParseInt(item, 10, 32)
			grouped[parsed]++
			//timerValues=append(timerValues,int(parsed))

		}

		//352195
		const DAYS = 256
		
		for i := 0; i < DAYS; i++ {
			var bornFish=grouped[0]
			grouped[0]=grouped[1]
			grouped[1]=grouped[2]
			grouped[2]=grouped[3]
			grouped[3]=grouped[4]
			grouped[4]=grouped[5]
			grouped[5]=grouped[6]
			grouped[6]=grouped[7]
			grouped[7]=grouped[8]
			grouped[8]=bornFish
			grouped[6]+=bornFish
		}
		println()
		var sum uint64 = 0
		for _, item := range grouped {
			sum += uint64(item)

		}

		println(sum)

	}

}
