import sys
class CommandExecutor:
    def __init__(self) -> None:
        self.x=0
        self.y=0
    def execute(self,cmd,arg):
        if cmd=="forward":
            self.x+=arg
        elif cmd=="down":
            self.y+=arg
        elif cmd=="up":
            self.y-=arg
       
    def get_result(self):
        return self.x*self.y
class CommandExecutorVer2(CommandExecutor):
    def __init__(self) -> None:
        super().__init__()
        self.aim=0
    def execute(self, cmd, arg):
        if cmd=="forward":
            self.x+=arg
            self.y+=(self.aim*arg)
        elif cmd=="down":
            self.aim+=arg
        elif cmd=="up":
            self.aim-=arg

def load_inputs(path:str):
    result=[]
    with open(path,"r") as f:
        for line in f:
            splitted=line.split()
            cmd=splitted[0]
            arg=int(splitted[1])
            result.append((cmd,arg))
    return result

    
def execute_all_commands(commands,executor:CommandExecutor):

    for cmd in commands:
        executor.execute(*cmd)
    return executor.get_result()
def main():
    if len(sys.argv)<2:
        print("No input file, exiting")
        exit(-1)
    commands=load_inputs(sys.argv[1])
    res1=execute_all_commands(commands,CommandExecutor())
    res2=execute_all_commands(commands,CommandExecutorVer2())
    print(res1)
    print(res2)

main()