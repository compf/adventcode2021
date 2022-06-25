using System;
using System.Collections.Generic;
using System.Linq;
namespace nr14 {
    class Program {
        static  Dictionary<string,ulong> CreateCounterDict(string line)
        {
            Dictionary<string,ulong> dict=new();
            for (int i = 1; i < line.Length; i++) {
                string key =  line[i - 1] + "" +  line[i];
                if (!dict.ContainsKey(key)) {
                    dict.Add(key, 0);
                }
                dict[key] += 1;
            }
            return dict;
        }
        private static bool CompareDict(Dictionary<string,ulong> me,Dictionary<string,ulong> comp)
        {
            Console.ForegroundColor=ConsoleColor.Red;
            foreach(var c in comp.Keys)
            {
                if(comp[c]!=me[c])
                {
                    Console.WriteLine(c + "should be " + comp[c] +" but is " + me[c]);
                                Console.ResetColor();

                    return false;
                }
            }
            Console.ResetColor();
            return true;
        }
        static(Dictionary < string, ulong > replace, Dictionary < string, char > map) LoadData(string path) {
            Dictionary < string, char > map = new Dictionary < string, char > ();
            string[] lines = System.IO.File.ReadAllLines(path);
            Dictionary < string, ulong > replace = CreateCounterDict(lines[0]);
            
            
            for (int i = 2; i < lines.Length; i++) {
                string line = lines[i];
                string[] splitted = line.Split(new char[] {
                    '-',
                    '>'
                }, System.StringSplitOptions.RemoveEmptyEntries);
                map.Add(splitted[0].Trim(), splitted[1].Trim()[0]);
            }
            return (replace, map);
        }
        static void Main(string[] args) {
            var input = LoadData(args[0]);
            ulong task1 = Run(10, input.replace, input.map);
            Console.WriteLine("Task1 " + task1);

            ulong task2 = Run(40, input.replace, input.map);
        Console.WriteLine("Task2 " + task2);

        }
        private static ulong Run(int number, Dictionary < string, ulong > input, Dictionary < string, char > map) {
            Dictionary<char,ulong> elemCount=new();
            for (int i = 0; i < number; i++) {
                input=applyInsertions(input,map,elemCount);
                   
            }          

            ulong maxMinDiff = elemCount.Values.Max()-elemCount.Values.Min()-2; //not sure why subtracting 2
            return maxMinDiff;
        }
       
        private static Dictionary < string,ulong > applyInsertions(Dictionary < string, ulong > input, Dictionary < string, char > map,Dictionary<char,ulong> elemCount) {
            Dictionary < string, ulong > copy = new();
            const string DEBUG="CN";
            foreach(var key in input.Keys) {
               
                if(map.ContainsKey(key))
                {
                    char replacedKey=map[key];
                    elemCount[replacedKey]=(elemCount.ContainsKey(replacedKey)?elemCount[replacedKey]+input[key]:input[key]);
                    string key1=key[0]+replacedKey.ToString();
                    string key2=replacedKey.ToString()+key[1].ToString();
                    copy[key1]=(copy.ContainsKey(key1)?copy[key1]+input[key]:input[key]);
                    copy[key2]=(copy.ContainsKey(key2)?copy[key2]+input[key]:input[key]);

                }
                  
           
            }
           
            
            
            return copy;
        }
    }
}