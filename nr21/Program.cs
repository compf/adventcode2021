using System;
using System.Collections.Generic;

namespace nr21
{
   public interface  IDice
    {
        int Roll();
        int NumberRolled{get;}
        IDice Clone();
    }
    public class DeterministicDice :IDice
    {
        private int value=1;
        private int size;
        private int numberRolled=0;
        public int NumberRolled=>numberRolled;
        public DeterministicDice(int size)
        {
            this.size=size;
        }
        public int Roll()
        {
            numberRolled++;
            int result=value;
            value++;
            if(value>size){
                value=1;
            }
            return result;
        }
        public IDice Clone()
        {
            DeterministicDice dice=new DeterministicDice(size);
            dice.value=value;
            dice.numberRolled=numberRolled;
            return dice;
        }
    }
    public class ThriceDice:IDice
    {
        private int numberRolled;
        private static Dictionary<int,int> diceFrequencies= new Dictionary<int,int>{
           {3,1},
           {4,3},
           {5,6},
           {6,7},
           {7,6},
           {8,3},
           {9,1}
        };
        private static List<int> diceValues=new List<int>(diceFrequencies.Keys);
        public static int Length=>diceFrequencies.Count;
        public int NumberRolled=>numberRolled;
        public static  int GetFrequency(int dice)
        {
            return diceFrequencies[dice];
        }
        public IDice Clone()
        {
            ThriceDice dice=new ThriceDice();
            dice.numberRolled=numberRolled;
            return dice;
        }
        public int Roll()
        {
            int value=diceValues[numberRolled];
            numberRolled=(numberRolled+1)%diceValues.Count;
            return value;
        }

    }
    public class Board
    {
        private readonly int size;
        private int[] playerPos={0,0};
        public Board(int size,int player1Pos,int player2Pos)
         {
            this.size=size;
            this.playerPos [0]=player1Pos;
            this.playerPos[1]=player2Pos;
         }
         public int MovePlayer(int player,int offset)
         {
            playerPos[player]=(playerPos[player]+offset-1)%size+1;
            return playerPos[player];
         }
         public Board Clone()
         {
            return new Board(size,playerPos[0],playerPos[1]);
         }
    }
    public class Game
    {
        protected long[] playerScores={0,0};
        const int MIN_SCORE=1000;
        protected IDice dice;
        protected Board board;
        public virtual bool Round(int player)
        {
            int sum=0;
            for(int i=0;i<3;i++){
                sum+=dice.Roll();
            }
            int newPos=board.MovePlayer(player,sum);
            Console.WriteLine("Player "+ player +" moves by " +sum +" to " + newPos);
            playerScores[player]+=newPos;
            return IsFinnished();

        }
        public virtual Game Clone()
        {
            Game game=new Game(dice.Clone() as IDice,board.Clone() as Board);
            game.playerScores[0]=playerScores[0];
            game.playerScores[1]=playerScores[1];
            return game;
        }
        public virtual bool IsFinnished()
        {
            return playerScores[0]>=MIN_SCORE || playerScores [1]>=MIN_SCORE;
        }
        public Game(IDice dice,Board board)
        {
            this.dice=dice;
            this.board=board;
        }
        public virtual long Run()
        {
            bool player1Finnished=false;
            bool player2Finnished=false;
            while(true)
            {
                 player1Finnished=this.Round(0);
                if(player1Finnished)break;
                 player2Finnished=this.Round(1);
                if(player2Finnished)break;
            }
            int loosingPlayer=player1Finnished?1:0;
            Console.WriteLine(playerScores[loosingPlayer]+" "+ dice.NumberRolled);
            return playerScores[loosingPlayer]*dice.NumberRolled;
        }
    }
    public class Part2Game:Game
    {
        public static long[] NumberWon={0,0};
        private static (long,long) RoundRec(int player,Part2Game game)
        {
            if(game.playerScores[0]>=21)return (1,0);
            else if(game.playerScores[1]>=21)return (0,1);
            IDice dice=new ThriceDice();
            long w1=0;
            long w2=0;
            for(int i=0;i<ThriceDice.Length;i++)
           {
                var clonedGame=game.Clone() as Part2Game;
                int diceResult=dice.Roll();
                int score=clonedGame.board.MovePlayer(player,diceResult);
                clonedGame.playerScores[player]+=score;
                
                var winTuple=RoundRec(player==0?1:0,clonedGame);
              w1+=winTuple.Item1*ThriceDice.GetFrequency(diceResult);
               w2+=winTuple.Item2*ThriceDice.GetFrequency(diceResult);
              

           }
           return (w1,w2);
        }
        public override bool Round(int player)
        {
         var result=RoundRec(player,this);
         NumberWon[0]=result.Item1;
         NumberWon[1]=result.Item2;
         return true;
        }
        public Part2Game(IDice dice,Board board):base(dice,board)
        {
           
        }
        public override Game Clone()
        {
            Part2Game game=new Part2Game(dice.Clone() as IDice,board.Clone() as Board);
            game.playerScores[0]=playerScores[0];
            game.playerScores[1]=playerScores[1];
            return game;
        }
        public  override long Run()
        {
        
           bool player1Finnished=this.Round(0);
            long player1NumberWon=Part2Game.NumberWon[0];
            long player2NumberWon=Part2Game.NumberWon[1];
          
         
            return Math.Max(player1NumberWon,player2NumberWon);

        }
        public override bool IsFinnished()
        {
             return playerScores[0]>=21 || playerScores [1]>=21; 
        }
    }

    class Program
    {
        static Board LoadData(string path)
        {
            const int SIZE=10;
            string[] lines=System.IO.File.ReadAllLines(path);
            int player1Pos=int.Parse(lines[0].Split(":")[1].Trim());
            int player2Pos=int.Parse(lines[1].Split(":")[1].Trim());
            return new Board(SIZE,player1Pos,player2Pos);

        }
        static void Main(string[] args)
        {
            Board board=LoadData("../inputs/nr21.txt");
            Game game;
            if(args.Length>1 || true)
            {
                game=new Part2Game(new ThriceDice(),board);
            }
            else
            {
               game=new Game(new DeterministicDice(100),board);
            }
             
            long result=game.Run();
            Console.WriteLine(result);

        }
    }
}
