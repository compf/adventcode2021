import sys
def loadInput(path:str):
    matrix=[]
    with open(path) as f:

        for line in f:
            matrix.append([int(s) for s in line if s!="\n"])
    return matrix





def is_low_point(x:int,y:int,matrix)->bool:
    height=len(matrix)
    width=len(matrix[0])
    value=matrix[y][x]
    low_point=x>0 and matrix[y][x-1]>value or x==0 
    low_point=low_point and (x<width-1 and matrix[y][x+1]>value or x==width-1)
    low_point=low_point and (y>0 and matrix[y-1][x]>value or y==0)
    low_point=low_point and (y<height-1 and matrix[y+1][x]>value or y==height-1)
    return low_point

def find_low_points(matrix):
    height=len(matrix)
    width=len(matrix[0])
    low_points=[]
    for y in range(height):
        for x in range(width):
            if is_low_point(x,y,matrix):
                low_points.append((x,y))
    return low_points
def get_basin_sizes_product(matrix,low_points):
    basin_sizes=[]
    for lp in low_points:
        basin_sizes.append(get_basin_size(matrix,lp))
    basin_sizes.sort(reverse=True)
    prod=basin_sizes[0]*basin_sizes[1]*basin_sizes[2]
    return prod
def get_basin_size(matrix,low_point):
    count=1
    height=len(matrix)
    width=len(matrix[0])
    array=[low_point]
    visited=set()
    while len(array)>0:
        item=array.pop()
        x=item[0]
        y=item[1]
        #print(x,y)
        value=matrix[y][x]
        nx=x-1
        ny=y
        if frozenset((nx,ny)) not in visited and  x>0 and matrix[ny][nx]>value and  matrix[ny][nx]!=9:
            array.append((x-1,y))
            count+=1
            visited.add(frozenset((nx,ny)))
        nx=x+1
        if frozenset((nx,ny)) not in visited and x<width-1 and matrix[ny][nx]>value and  matrix[ny][nx]!=9:
            array.append((x+1,y))
            count+=1
            visited.add(frozenset((nx,ny)))
        nx=x
        ny=y-1
        if frozenset((nx,ny)) not in visited and y>0 and matrix[ny][nx]>value and  matrix[ny][nx]!=9:
            array.append((x,y-1))
            count+=1
            visited.add(frozenset((nx,ny)))
        ny=y+1
        if frozenset((nx,ny)) not in visited and y<height-1 and matrix[ny][nx]>value and  matrix[ny][nx]!=9:
            array.append((x,y+1))
            count+=1
            visited.add(frozenset((nx,ny)))
    return count
    
def main():

    if len(sys.argv)<2:
        print("No parameter provided")
        exit(-1)
    matrix=loadInput(sys.argv[1])
    low_points=find_low_points(matrix)

    risk_level=sum([matrix[x[1]][x[0]] +1 for x in low_points])
    print(risk_level)
    prod=get_basin_sizes_product(matrix,low_points)
    print(prod)
main()