#include<iostream>
#include<fstream>
#include<vector>
int get_count_increased_numbers(std::vector<int>& numbers){
    bool first=true;
    int last=-1;
    int count=0;
    for(int nr:numbers){
        if(first){
            
            first=false;
        }
        else{
            if(nr>last){
                count++;
            }
        }
        last=nr;
    }
    return count;
}
int get_count_sliding_window_sum_increases(std::vector<int>& numbers){
    bool first=true;
    int last=numbers[0]+numbers[1]+numbers[2];
    int count=0;
    for(int i=1;i<numbers.size()-3;i++){
        int sum=0;
        for(int j=0;j<3;j++){
            sum+=numbers[i+j];
        }
        if(sum>last)count++;
        last=sum;
    }
    return count;
}
int main(int argc,char** argv){
    if(argc<2){
        std::cout<<"No path given, exiting"<<std::endl;
        return -1;
    }
    std::string path=argv[1];
    std::vector<int> numbers;
    std::ifstream in{path};
    while(in.good()){
        int nr;
        in>>nr;
        numbers.push_back(nr);

    }
    std::cout<<get_count_increased_numbers(numbers)<<std::endl;
    std::cout<<get_count_sliding_window_sum_increases(numbers)<<std::endl;

}