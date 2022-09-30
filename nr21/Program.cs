using System;

namespace nr21
{
   public interface  IDice
    {
        int Roll();
        int NumberRolled{get;}
    }
    public class DeterministicDice :IDice
    {
        private int value=1;
        private int numberRolled=0;
        public int NumberRolled=>numberRolled;
        public int Roll()
        {
            numberRolled++;
            int result=value;
            value++;
            if(value>100){
                value=1;
            }
            return result;
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
    }
    public class Game
    {
        private long[] playerScores={0,0};
        const int MIN_SCORE=1000;
        private IDice dice;
        private Board board;
        public bool Round(int player)
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
        public bool IsFinnished()
        {
            return playerScores[0]>=MIN_SCORE || playerScores [1]>=MIN_SCORE;
        }
        public Game(IDice dice,Board board)
        {
            this.dice=dice;
            this.board=board;
        }
        public long Run()
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
            Board board=LoadData(args[0]);
            Game game=new Game(new DeterministicDice(),board);
            long result=game.Run();
            Console.WriteLine(result);

        }
    }
}
