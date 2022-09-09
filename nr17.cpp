#include<iostream>
#include<fstream>
#include <cstdio>
struct Rect{
    int xMin,xMax,yMin,yMax;
    Rect(int xMin, int xMax, int yMin, int yMax):xMin(xMin),xMax(xMax),yMin(yMin),yMax(yMax){
        
    }
};
Rect load(char* path){
    FILE* f=fopen(path,"r");
    int xMin, xMax,  yMin,  yMax;
    if(!f){
        throw "Could not find file";
    }
    ;
    fscanf(f,"target area: x=%d..%d, y=%d..%d",&xMin,&xMax,&yMin,&yMax);
    return Rect(xMin,xMax,yMin,yMax);
}
int getMinXSpeed(int minXPos){
    int result=0;
    int counter=1;
    while(result<minXPos){
        result+=counter;
        counter++;
    }
    return counter-1;
}
bool simulate(int dx,int dy,int& highestY,Rect& rect){
    int x=0,y=0;
    int highestYTemp=0;
    bool inRect=false;
    while(y>=rect.yMin){
        highestYTemp=std::max(y,highestYTemp);
        if (x>=rect.xMin && x<=rect.xMax && y>=rect.yMin && y<=rect.yMax){
            inRect=true;
        }
        x+=dx;
        y+=dy;
        if(dx>0){
            dx--;
        }
        else if (dx<0){
            dx++;
        }
        dy--;
    }
    if(inRect){
        highestY=highestYTemp;
    }
    return inRect;
}
int main(int argc,char** argv){
    Rect rect =load(argv[1]);
    //printf("%d %d %d %d \n",rect.xMin,rect.xMax,rect.yMin,rect.yMax);
    //std::cout<<getMinXSpeed(rect.xMin)<<std::endl;


    int minDX=getMinXSpeed(rect.xMin);
    int maxDX=getMinXSpeed(3*rect.xMax);

    int minDY=-std::max(abs(rect.yMin),abs(rect.yMax));
    int maxDY=-minDY;

    int maxYVal=0;
    for(int dy=minDY;dy<=maxDY;dy++){
        for(int dx=minDX;dx<=maxDX;dx++){
             bool b =simulate(dx,dy,maxYVal,rect);
             if(b){
                //std::cout<<dx<< " "<<dy << " " <<maxYVal<< std::endl;
             }
        }
    }
    std::cout<<maxYVal<<std::endl;

}