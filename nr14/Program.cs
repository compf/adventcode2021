using System;
using System.Collections.Generic;
using System.Linq;
namespace nr14
{
    class Program
    {
        static (string replace,Dictionary<string,char> map) LoadData(string path)
        {
            Dictionary<string,char> map=new Dictionary<string,char>();
            string[] lines=System.IO.File.ReadAllLines(path);
            string replace=lines[0];
            for(int i=2;i<lines.Length;i++)
            {
                string line=lines[i];
                string[] splitted=line.Split(new char[]{'-','>'},System.StringSplitOptions.RemoveEmptyEntries);
                map.Add(splitted[0].Trim(),splitted[1].Trim()[0]);
            }
            return (replace,map);
        }
        static void Main(string[] args)
        {
            var input=LoadData(args[0]);
            Console.WriteLine(input.replace);
            ulong task1=Run(10,input.replace,input.map);
            Console.WriteLine(task1);
            ulong task2=Run(40,input.replace,input.map);
            //Console.WriteLine(task2);
           

        }
        private static ulong Run(int number,string input,Dictionary<string,char> map)
        {

            for(int i =0;i<number;i++)
            {
                input=applyInsertions(input,map);
            }
            string result=input;
            //Console.WriteLine(result);
            ulong maxMinDiff=CountMinMaxDiff(result);
            return maxMinDiff;
        }
        private static ulong CountMinMaxDiff(string input)
        {
            Dictionary<char,int> counter=new();
            foreach(char c in input)
            {
                if(!counter.ContainsKey(c))
                    counter[c]=0;
                counter[c]+=1;
            }
            return (ulong)(counter.Values.Max()-counter.Values.Min());
        }
        private static string applyInsertions(string input,Dictionary<string,char> map)
        {
            List<(char,int)> insertions=new();
             string copy=input;
             int offset=0;
            for(int i=1;i<input.Length;i++)
            {
                string key=input[i-1].ToString()+input[i];
               
                if(map.ContainsKey(key))
                {
                   
                    char inserted=map[key];
                    insertions.Add((inserted,i+offset));
                    offset+=1;
                    
                   
                }
                else
                {
                    
                   
                }
               
                //Console.WriteLine(copy);


            }
            foreach(var insertion in insertions)
            {
                input=input.Insert(insertion.Item2,insertion.Item1.ToString());
            }
             Console.WriteLine(input.Length);
           
            
           
            return input;
        }
    }
}
