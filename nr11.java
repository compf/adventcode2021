import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

public class nr11 {
    private static int[][] loadInput(String path) throws IOException {
        var lines = Files.readAllLines(Path.of(path));
        int[][] board = new int[10][10];
        for (int y = 0; y < 10; y++) {
            for (int x = 0; x < 10; x++) {
                char ch = lines.get(y).charAt(x);
                board[y][x] = ch - '0';
            }
        }
        return board;
    }

    public static void main(String[] args) throws IOException {

        var board = loadInput(args[0]);
        int flashCount=0;
        for(int i=0;i<100;i++){
            flashCount+=runStep(board);
        }
        System.out.println(flashCount);

        board=loadInput(args[0]);
        flashCount=0;
        int step=0;
        do{
            step++;
            flashCount=runStep(board);
           
        }while(flashCount!=100);
        System.out.println(step);
    }
    
    private static int runStep(int[][] board){
        int flashCount=0;
        boolean[][] flashed=new boolean[10][10];
        increaseAll(board);
        flashCount=flash(board, flashed);
        reset(board,flashed);
        return flashCount;
    }
    private static void reset(int[][] board, boolean[][] flashed){
        for (int y = 0; y < 10; y++) {
            for (int x = 0; x < 10; x++) {
                if(flashed[y][x]){
                    board[y][x]=0;
                }
            }
        }
    }
    private static final int FLASH_THRESHOLD=9;
    private static int flash(int[][] board, boolean[][] flashed){
        boolean foundFlash=false;
        int flashCount=0;
        do{
            foundFlash=false;
            for (int y = 0; y < 10; y++) {
                for (int x = 0; x < 10; x++) {
                  if(!flashed[y][x] && board[y][x]>FLASH_THRESHOLD){
                    foundFlash=true;
                    flashed[y][x]=true;
                    flashCount++;

                    for(int dy=-1;dy<=1;dy++){
                        for(int dx=-1;dx<=1;dx++){
                            if(x+dx<0 || x+dx>9 || y+dy<0 || y+dy>9 || dx==0 && dy==0)continue;
                            board[y+dy][x+dx]++;
                        }
                    }
                  } 
                }
            }
        }while(foundFlash);
        return flashCount;
        
    }
    private static void increaseAll(int[][] board){
        for (int y = 0; y < 10; y++) {
            for (int x = 0; x < 10; x++) {
               board[y][x]++;
            }
        }
    }
}
