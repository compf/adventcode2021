import sys
from matplotlib import pyplot as plt
import numpy as np
def load_data(path:str):
    with open(path) as f:
        points=set()
        commands=[]
        point_mode=True
        for l in f:
            if l=="\n":
                point_mode=False
            elif point_mode:
                splitted=l.split(",")
                points.add((int(splitted[0]),int(splitted[1])))
            else:
                splitted=l.split("=")
                along=splitted[0][-1]
                val=int(splitted[1])
                commands.append((along,val))
    return points,commands
def transform_point(pt,axis,compVal):
    ptNew=pt
    if axis==0:
        return (compVal-abs(pt[0]-compVal),pt[1])
    else:
        return (pt[0],compVal-abs(pt[1]-compVal))
def execute_command(points,cmd):
    axis=0 if cmd[0]=="x"else 1
    compVal=cmd[1]
    print(points)
    print("comp",compVal)
    removedPoints=set([pt for pt in points if pt[axis]>compVal])
    points=points-removedPoints
    points=points | set([transform_point(pt,axis,compVal) for pt in removedPoints])
    return points
def main(path,nr):
    points,commands=load_data(path)
    if nr=="1":
        points=execute_command(points,commands[0])
        print(points)
        print(len(points))
    else:
        for cmd in commands:
            points=execute_command(points,cmd)
        max_x=max(points)[0]+1
        max_y=max(points,key=lambda x: x[1])[1]+1
        data = np.zeros( (max_y,max_x,3), dtype=np.uint8 )
        for pt in points:
            print(pt)
            data[pt[1],pt[0]] = [255,0,0]       

        plt.imshow(data, interpolation='nearest')
        plt.show()
        

    #print(points)
if __name__=="__main__":
    main(sys.argv[1],sys.argv[2])