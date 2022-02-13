using System;
using System.Collections.Generic;
using System.Linq;
namespace nr8
{
    class PatternDigitsPair
    {
        public readonly HashSet<char> Pattern;
        public readonly HashSet<int> Digits;

        public PatternDigitsPair(string pattern)
        {
            this.Digits = new();
            foreach (var entry in Program.byDigit)
            {
                if (entry.Value.Count == pattern.Length)
                {

                    Digits.Add(entry.Key);
                }

            }
            this.Pattern = new HashSet<char>(pattern.ToCharArray());
        }
    }
    class Entry
    {
        public readonly PatternDigitsPair[] Left = new PatternDigitsPair[10];
        public readonly PatternDigitsPair[] Right = new PatternDigitsPair[4];
    }
    class Program
    {
        public static Dictionary<int, HashSet<char>> byDigit = new();
        public static Dictionary<char, HashSet<int>> byChar = new();
        private static void initDict()
        {
            byDigit[0] = FromString("abcefg");
            byDigit[1] = FromString("cf");
            byDigit[2] = FromString("acdeg");
            byDigit[3] = FromString("acdfg");
            byDigit[4] = FromString("bcdf");
            byDigit[5] = FromString("abdfg");
            byDigit[6] = FromString("abdfge");
            byDigit[7] = FromString("acf");
            byDigit[8] = FromString("abcdefge");
            byDigit[9] = FromString("abcdfg");

            foreach (int digit in byDigit.Keys)
            {
                foreach (char c in byDigit[digit])
                {
                    if (!byChar.ContainsKey(c))
                    {
                        byChar[c] = new HashSet<int>();
                    }
                    byChar[c].Add(digit);
                }
            }
        }
        private static List<Entry> LoadInput(string path)
        {
            List<Entry> entries = new();
            foreach (string line in System.IO.File.ReadLines(path))
            {
                string[] splitted = line.Split("|");
                string[] left = splitted[0].Split(" ", StringSplitOptions.RemoveEmptyEntries);
                string[] right = splitted[1].Split(" ", StringSplitOptions.RemoveEmptyEntries);
                var entry = new Entry();
                for (int i = 0; i < 10; i++)
                {
                    entry.Left[i] = new PatternDigitsPair(left[i]);
                }
                for (int i = 0; i < 4; i++)
                {

                    entry.Right[i] = new PatternDigitsPair(right[i]);
                }
                entries.Add(entry);
            }
            return entries;
        }

        private static HashSet<char> FromString(string text)
        {
            return new HashSet<char>(text.ToCharArray());
        }
        private static PatternDigitsPair GetByDigit(PatternDigitsPair[] pairs, int digit)
        {
            return pairs.Where((p) => p.Digits.Count == 1 && p.Digits.First() == digit).First();
        }

        static void Main(string[] args)
        {
            initDict();
            var entries = LoadInput(args[0]);
            int count = 0;
            foreach (var e in entries)
            {
                count += e.Right.Count((c) => c.Digits.Count == 1);

            }
            Console.WriteLine(count);



            int sum=0;
            foreach (var entry in entries)
            {

                Dictionary<char, char> wireMap = new();
                var pair_1 = GetByDigit(entry.Left, 1);
                var pair_7 = GetByDigit(entry.Left, 7);
                var pair_4=GetByDigit(entry.Left,4);

                var letter_a = pair_7.Pattern.Except(pair_1.Pattern).First();
                var letter_b_d=pair_4.Pattern.Except(pair_7.Pattern);
                wireMap[letter_a] = 'a';
                PatternDigitsPair pair_3=entry.Left.Where((p)=>p.Pattern.IsSupersetOf(pair_1.Pattern) && p.Pattern.Contains(letter_a) &&  p.Pattern.Intersect(letter_b_d).Count()==1 && p.Pattern.Count==5).First();
                char letter_b=pair_4.Pattern.Except(pair_3.Pattern).First();
                wireMap[letter_b]='b';

                char letter_d=pair_4.Pattern.Except(pair_1.Pattern).Where((c)=>c!=letter_b).First();
                wireMap[letter_d]='d';
                PatternDigitsPair pair_2=entry.Left.Where((p)=>p.Pattern.Intersect(pair_1.Pattern).Count()==1 && p.Pattern.Intersect(letter_b_d).Count()==1 && p.Pattern.Count==5).First();
                char letter_f=pair_3.Pattern.Except(pair_2.Pattern).First();
                wireMap[letter_f]='f';
                char letter_c=pair_1.Pattern.Where((x)=>x!=letter_f).First();
                wireMap[letter_c]='c';


                char[] upToNow={letter_a,letter_b,letter_c,letter_d,letter_f};
                char letter_g=entry.Left.Where((p)=>p.Pattern.Count==6 && p.Pattern.Except(upToNow).Count()==1).First().Pattern.Except(upToNow).First();
                wireMap[letter_g]='g';
                upToNow=new char[]{letter_a,letter_b,letter_c,letter_d,letter_f,letter_g};
                char[] alphabet="abcdefg".ToCharArray();
                char letter_e=alphabet.Except(upToNow).First();
                wireMap[letter_e]='e';


                int factor=1000;
                int result=0;
                foreach(var d in entry.Right)
                {
                     
                    HashSet<char> chars=new();
                    foreach(var c in d.Pattern)
                    {
                        chars.Add(wireMap[c]);
                    }
                    foreach(var pair in byDigit)
                    {
                        if(pair.Value.SetEquals(chars))
                        {
                          
                            result+=(pair.Key*factor);
                            factor/=10;
                        }

                    }
                }
                sum+=result;




            }
            Console.WriteLine(sum);
        }

    }
}
