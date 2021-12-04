import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

import javax.swing.text.StyledEditorKit.BoldAction;

public class nr4
{

    public static void main(String[] args) throws IOException {
        boolean first=true;
        int result=0;
        var lines=Files.readString(Path.of(args[0])).split("\n\n");
        Stream<Integer> numbers=Arrays.stream(lines[0].split(",")).map((x)->Integer.parseInt(x));
        ArrayList<Board> boards=new ArrayList<>();
        for(int i=1;i<lines.length;i++){
           
            boards.add(new Board(lines[i]));
        }
        for(var number:numbers.toArray(Integer[]::new)){
            for(var board:boards){
                board.tryMark(number);
                if(!board.alreadyWon() && board.hasWon() ){
                    var sum=board.getUnmarked().stream().reduce((a,b)->a+b).orElse(0);
                    if(first){
                        System.out.println(sum*number);
                        first=false;
                    }
                    else{
                        result=sum*number;
                    }
                   
                    
                }
            }
           
        }
        System.out.println(result);
    }
}
class Board{
    private int[][] numbers=new int[5][5];
    private boolean[][] marked=new boolean[5][5];
    public Board(String input){
        String[] lines=input.split("\n");
        for(int row=0;row<lines.length;row++){
            String[] cols=Arrays.stream(lines[row].split(" ")).filter((s)->!s.contentEquals("")).toArray(String[]::new);
            for(int col=0;col<cols.length;col++){
              
                cols[col]=cols[col].trim();
                numbers[row][col]=Integer.parseInt(cols[col]);
            }
        }
    }
    public void tryMark(int number){
        for(int row=0;row<numbers.length;row++){
            for(int col=0;col<numbers[0].length;col++){
                if(numbers[row][col]==number){
                    marked[row][col]=true;
                }
            }
        }
    }
    public boolean hasWon(){
        for(int main=0;main<marked.length;main++){
            boolean rowWise=true;
            boolean colWise=true;
            for(int secondary=0;secondary<marked.length;secondary++){
                rowWise=rowWise && marked[main][secondary];
                colWise=colWise && marked[secondary][main];
            }
            if(colWise||rowWise){
                _alreadyWon=true;
                return true;
            }
        }
        return false;
    }
    private boolean _alreadyWon=false;
    public boolean alreadyWon(){
        return _alreadyWon;
    }
    public List<Integer> getUnmarked(){
        ArrayList<Integer> result=new ArrayList<>();
        for(int row=0;row<numbers.length;row++){
            for(int col=0;col<numbers[0].length;col++){
                if(!marked[row][col]){
                    result.add(numbers[row][col]);
                }
            }
        }
        return result;
    }
}