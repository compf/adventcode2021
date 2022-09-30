import sys
from typing import List,Tuple
MIN_TEMP_X=10000
MAX_TEMP_X=-10000
MIN_TEMP_Y=10000
MAX_TEMP_Y=-10000



BORDER=25
CURR_BORDER_MODE=True
def load_data(path:str)->Tuple[dict,List[bool]]:
    with open(path) as f:
        enhanchment_algorithm=[]
        flag=True
        image=dict()
        y=0
        for line in f.readlines():
            line=line.strip()
            
            if line=="":
                y=0
                flag=False
                continue
            if flag:
                enhanchment_algorithm+=[c=='#' for c in line]
            else:
                x=0
                WIDTH=len(line)
                for c in line:
                    set_image_value(image,y,x,c=="#")
                    x+=1
            y+=1
        HEIGHT=y
        return image,enhanchment_algorithm
def get_image_value(image:dict,y:int,x:int)->bool:
    if (y,x) in image:
        return image[(y,x)]
    else:
        return False
def set_image_value(image:dict,y:int,x:int,value:bool)->None:
    image[(y,x)]=value
    #print(y,x)
    global MIN_TEMP_X,MIN_TEMP_Y,MAX_TEMP_X,MAX_TEMP_Y
    if x< MIN_TEMP_X:
        MIN_TEMP_X=x
    elif x>MAX_TEMP_X:
        MAX_TEMP_X=x
    if y < MIN_TEMP_Y:
        MIN_TEMP_Y=y
    elif y>MAX_TEMP_Y:
        MAX_TEMP_Y=y
def get_bounding_box(image:dict)->Tuple[int,int,int,int]:
    xmin=min([p[0] for p in image])
    xmax=max([p[0] for p in image])
    ymin=min([p[1] for p in image])
    ymax=max([p[1] for p in image])
    return xmin,xmax,ymin,ymax
def check_wall(image,outerRange:List[int],innerRange:List[int],yxTransformer):
    result=0
    continuous_falses=0
    for a in outerRange:
        for b in innerRange:
            y,x=yxTransformer(a,b)
            if not get_image_value(image,y,x):
                continuous_falses+=1
            else:
                continuous_falses=0
        if (continuous_falses/len(innerRange))<=0.9:
            return a
        else:
            result=a
    return result

def get_walls(image):
    xmin,xmax,ymin,ymax=get_bounding_box(image)
    wallXMin,wallXMax,wallYMin,wallYMax=0,0,0,0
    #vertical stripes
    wallXMin=check_wall(image,range(xmin,xmax+1),range(ymin,ymax+1),lambda a, b: (b,a))
    wallXMax=check_wall(image,range(xmax,xmin-1,-1),range(ymin,ymax+1),lambda a, b: (b,a))
    wallYMin=check_wall(image,range(ymin,ymax+1),range(xmin,xmax+1),lambda a, b:(a,b))
    wallYMax=check_wall(image,range(ymax,ymin-1),range(xmin,xmax+1),lambda a, b:(a,b))
    return wallXMin,wallXMax,wallYMin,wallYMax
    


def delete_rects(image:dict):
   
    found=True
    MIN_NO_POINTS=25
    while found:
        start=min([(y,x) for (y,x) in image if get_image_value(image,y,x)])
        points=[]
        found=False
        y,x=start
        while get_image_value(image,y,x):
            while get_image_value(image,y,x):
                points.append((y,x))
                y+=1
            y=start[0]
            x+=1
        if len(points)>=MIN_NO_POINTS:
            found=True
            for (y,x) in points:
                set_image_value(image,y,x,False)
        
            


def get_neighbors_binary(image:dict,y:int,x:int):
    b1=[get_image_value(image,y-1,x-1),get_image_value(image,y-1,x),get_image_value(image,y-1,x+1)]
    b2=[get_image_value(image,y,x-1),get_image_value(image,y,x),get_image_value(image,y,x+1)]
    b3=[get_image_value(image,y+1,x-1),get_image_value(image,y+1,x),get_image_value(image,y+1,x+1)]
    b=b1+b2+b3
    power=1
    result=0
    for c in reversed(b):
        if c:
            result+=power
        power*=2
    return result
def print_neighbors(image:dict,sy:int,sx:int,radius:int):
    print(sy,sx)
    for y in range(sy-radius,sy+radius):
        for x in range(sx-radius,sx+radius):
            print("#" if get_image_value(image,y,x) else ".",end="")
        print()
    print()
def kernel(image:dict,algorithm:List[bool]):
    output=dict()


    for y in range(MIN_Y,MAX_Y+1):
        for x in range(MIN_X,MAX_X+1):
            index=get_neighbors_binary(image,y,x)
            set_image_value(output,y,x,algorithm[index])
    return output
def is_annoying_border_point(image,y,x):
   return x==MAX_X or y==MIN_Y
def print_image(image:dict):
    for y in range(MIN_Y,MAX_Y):
        for x in range(MIN_X,MAX_X):
            print("#" if get_image_value(image,y,x) else ".",end="")
        print()     
data=load_data(sys.argv[1])
image,alg=data
counter=0
MIN_X,MAX_X,MIN_Y,MAX_Y=get_bounding_box(image)
iterations=50 if len(sys.argv)>2 else 2
BORDER=20
MIN_X-=(iterations+BORDER)
MIN_Y-=(iterations+BORDER)
MAX_X+=(iterations+BORDER)
MAX_Y+=(iterations+BORDER)
for i in range(iterations):
    
   
    image=kernel(image,alg)
    for pt in [(y,x) for (y,x) in image if  is_annoying_border_point(image,y,x)]:
        image[pt]= CURR_BORDER_MODE
    CURR_BORDER_MODE=not CURR_BORDER_MODE

for y in range(MIN_Y,MAX_Y+1):
    for x in range(MIN_X,MAX_X+1):
        if get_image_value(image,y,x):
            counter+=1
print(counter)





                

            
