import sys
MIN_TEMP_X=10000
MAX_TEMP_X=-10000
MIN_TEMP_Y=10000
MAX_TEMP_Y=-10000


MIN_X=10000
MAX_X=-10000
MIN_Y=10000
MAX_Y=-10000
BORDER=500
def load_data(path:str):
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
def get_image_value(image,y,x):
    if (y,x) in image:
        return image[(y,x)]
    else:
        return False
def set_image_value(image,y,x,value):
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

    
def get_neighbors_binary(image,y,x):
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

def kernel(image,algorithm):
    output=dict()


    for y in range(MIN_Y-BORDER,MAX_Y+BORDER):
        for x in range(MIN_X-BORDER,MAX_X+BORDER):
            index=get_neighbors_binary(image,y,x)
            set_image_value(output,y,x,algorithm[index])
    return output
def print_image(image):
    for y in range(MIN_Y-BORDER,MAX_Y+BORDER):
        for x in range(MIN_X-BORDER,MAX_X+BORDER):
            print(1 if get_image_value(image,y,x) else 0,end="")
        print()
sys.argv=["","inputs/nr20.txt"]           
data=load_data(sys.argv[1])
image,alg=data
counter=0

#print_image(image)

#print()
for i in range(2):
    
    if i<1:
        MAX_X=MAX_TEMP_X
        MAX_Y=MAX_TEMP_Y
        MIN_X=MIN_TEMP_X
        MIN_Y=MIN_TEMP_Y
    image=kernel(image,alg)
    print_image(image)
    #print_image(image)
    print()
for y in range(MIN_Y-BORDER+1,MAX_Y+BORDER-1):
    for x in range(MIN_X-BORDER+1,MAX_X+BORDER-1):
        #if y==MIN_Y-BORDER or x ==MIN_X-BORDER  or y ==MAX_Y+BORDER-1 or  x==MAX_X+BORDER-1:
            #continue
        if get_image_value(image,y,x):
            counter+=1
print(counter)
print(MIN_X,MAX_X,MIN_Y,MAX_Y)




                

            
