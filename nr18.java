import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.List;
import java.util.function.BiPredicate;
import java.util.function.Predicate;

public class nr18 {
    public static class Tree {
        private Object left, right;
        private Tree parent;

        public Object getLeft() {
            return left;
        }

        public Object getRight() {
            return right;
        }

        public Tree getParent() {
            return parent;
        }

        public Tree getTopParent() {
            Tree curr = this;
            while (curr.parent != null) {
                curr = curr.parent;
            }
            return curr;
        }

        @Override
        public String toString() {
            String lVal = "", rVal = "";
            lVal = left.toString();
            rVal = right.toString();
            return "[" + lVal + "," + rVal + "]";
        }

        public long magnitude() {
            long lVal = 0;
            long rVal = 0;
            if (left instanceof Integer) {
                lVal = (int) left;
            } else {
                lVal = ((Tree) left).magnitude();
            }
            if (right instanceof Integer) {
                rVal = (int) right;
            } else {
                rVal = ((Tree) right).magnitude();
            }
            return 3 * lVal + 2 * rVal;
        }

        public void setLeft(Object left) {
            this.left = left;
            if (left instanceof Tree) {
                Tree tree = (Tree) left;
                tree.parent = this;
            }
        }

        public void setRight(Object right) {
            this.right = right;
            if (right instanceof Tree) {
                Tree tree = (Tree) right;
                tree.parent = this;
            }
        }

        private boolean canBeSimplified() {
            return left == null && parent == null && right != null || left != null && parent == null && right == null;
        }

        public int getDepth() {
            int depth = 0;
            Tree parent = this.parent;
            Tree before = this.parent;
            while (parent != null) {
                depth++;
                before = parent;
                parent = parent.parent;
            }
            if (before != null && before.canBeSimplified())
                return depth - 1;
            else
                return depth;
        }

        public void normalize() {
            Tree topParent = getTopParent();
            Object left = topParent.left;
            Object right = topParent.right;
            if (left instanceof Tree && left != null && parent == null && right == null) {
                Tree l = (Tree) left;
                l.parent = null;

            }

            else if (right != null && parent == null && left == null) {
                Tree r = (Tree) right;
                r.parent = null;

            }

        }
    }

    private static Deque<Tree> parse(String path) {
        Deque<Tree> trees = new ArrayDeque<>();
        try {
            List<String> lines = Files.readAllLines(Path.of(path));
            Collections.reverse(lines);

            for (String line : lines) {
                Tree tree = new Tree();
                parseRec(line, 0, tree);

                trees.push((Tree) tree.getLeft());
            }
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return trees;
    }

    private static int parseRec(String text, int offset, Tree curr) {
        boolean left = true;
        String digitBuffer = "";
        while (offset < text.length()) {
            switch (text.charAt(offset)) {
                case '[':
                    Tree newTree = new Tree();
                    if (left)
                        curr.setLeft(newTree);
                    else
                        curr.setRight(newTree);
                    offset = parseRec(text, offset + 1, newTree);
                    break;
                case ',':
                    left = false;
                    if (!digitBuffer.isEmpty()) {
                        curr.setLeft(Integer.parseInt(digitBuffer));
                        digitBuffer = "";

                    }
                    break;
                case ']':
                    if (!digitBuffer.isEmpty()) {
                        curr.setRight(Integer.parseInt(digitBuffer));
                    }
                    return offset;
            }
            if (Character.isDigit(text.charAt(offset))) {
                digitBuffer += text.charAt(offset);
            }
            offset++;
        }
        return 0;
    }

    private static Tree traverseRec(Object curr, Object root, boolean leftOrder,int depth, BiPredicate<Tree,Integer> filter) {
        if (curr == null)
            return null;
        if (curr instanceof Integer)
            return null;
        Tree currTree = (Tree) curr;
        if (currTree.left == root) {
            return traverseRec(currTree.right, root, leftOrder,depth+1, filter);
        } else if (currTree.right == root) {
            return traverseRec(currTree.left, root, leftOrder,depth+1, filter);
        }

        if (leftOrder) {
            Tree left = traverseRec(currTree.left, root, leftOrder,depth+1, filter);
            if (left != null && left != root)
                return left;
            if (filter.test(currTree,depth))
                return currTree;
            Tree right = traverseRec(currTree.right, root, leftOrder,depth+1, filter);
            if (right != null && right != root)
                return right;
        } else {

            Tree right = traverseRec(currTree.right, root, leftOrder,depth+1, filter);
            if (right != null && right != root)
                return right;
            if (filter.test(currTree,depth))
                return currTree;
            Tree left = traverseRec(currTree.left, root, leftOrder,depth+1, filter);
            if (left != null && left != root)
                return left;
        }
        return null;

    }

    private static Tree getClosestNode(Tree curr, boolean leftOrder) {

        if (curr == null)
            return null;
        Tree parent = curr.parent;
        while(parent!=null && (leftOrder && parent.left==curr || !leftOrder && parent.right==curr)){
            curr=parent;
            parent=parent.parent;
        }
        if(parent==null)return null;
        if(leftOrder && parent.left instanceof Integer)return parent;
        if(!leftOrder && parent.right instanceof Integer)return parent;
        if (leftOrder){
            parent=(Tree)parent.left;
            while(parent.right!=null && parent.right instanceof Tree){
                parent=(Tree)parent.right;
            }
        }
        else{
            parent=(Tree)parent.right;
            while(parent.left!=null && parent.left instanceof Tree){
                parent=(Tree)parent.left;
            }
        }
        return parent;

    }

    private static boolean explode(Tree root) {
        Tree toExplode = traverseRec(root, root, true,0, (curr,depth) -> {
            // System.out.println(curr.getDepth()+ " "+curr);
            return depth>= 4 && curr.getLeft() instanceof Integer && curr.getRight() instanceof Integer;
        });
        if (toExplode == null)
            return false;
        System.out.println("Explode "+toExplode);
        Tree addLeft = getClosestNode(toExplode,  true);
        if (addLeft == toExplode)
            addLeft = null;
        if(addLeft!=null)
            System.out.println("Left "+addLeft);
        Tree addRight = getClosestNode( toExplode, false);
        if (addRight == toExplode)
            addRight = null;
        if(addRight!=null)
            System.out.println("Right "+addRight);

        if (addLeft != null && addLeft.getRight() instanceof Integer) {
            addLeft.setRight((int) addLeft.getRight() + (int) toExplode.getLeft());
        } else if (addLeft != null) {
            addLeft.setLeft((int) addLeft.getLeft() + (int) toExplode.getLeft());
        }
        if (addRight != null && addRight.getLeft() instanceof Integer) {
            addRight.setLeft((int) addRight.getLeft() + (int) toExplode.getRight());
        } else if (addRight != null) {
            addRight.setRight((int) addRight.getRight() + (int) toExplode.getRight());
        }
        if (toExplode.getParent() != null && toExplode.getParent().getLeft() == toExplode) {
            toExplode.getParent().setLeft(0);
        } else if (toExplode.getParent() != null && toExplode.getParent().getRight() == toExplode) {
            toExplode.getParent().setRight(0);
        }
        return true;

    }
    private static void nop(){}
    private static boolean split(Tree root) {
        Tree toSplit = traverseRec(root, root, true,0, (curr,d) -> {
            return curr.getLeft() instanceof Integer && (int) curr.getLeft() >= 10
                    || curr.getRight() instanceof Integer && (int) curr.getRight() >= 10;
        });
       
        if (toSplit == null)
            return false;
        System.out.println("Split "+toSplit);
        if (toSplit.getLeft() instanceof Integer && ((int) toSplit.getLeft()) >= 10) {
            int val = (int) toSplit.getLeft();
            Tree splitted = new Tree();
            splitted.setLeft(val / 2);
            splitted.setRight((int) Math.ceil(val / 2.0));
            toSplit.setLeft(splitted);

        } else {
            int val = (int) toSplit.getRight();
            Tree splitted = new Tree();
            splitted.setLeft(val / 2);
            splitted.setRight((int) Math.ceil(val / 2.0));
            toSplit.setRight(splitted);

        }
        return true;
    }

    private static Tree reduce(Tree tree) {
        boolean canSplit = true, canExplode = true;
        while (canSplit || canExplode) {
            canExplode = explode(tree);
            if (canExplode) {
               // System.out.println("E "+tree);
                continue;
            }
            ;
            // System.out.println("Before split " +tree);
            canSplit = split(tree);
            if (canSplit) {
                // System.out.println("After split " +tree);
            }
            //System.out.println("S "+tree);


        }
        return tree;
    }

    public static void main(String... args) {
        var trees = parse(args[0]);
        long totalSum = 0;
        while (trees.size() >= 2) {
            Tree tree1 = (trees.pop());
            Tree tree2 = (trees.pop());
            // System.out.println("Tree 1 "+tree1);
            // System.out.println( "Tree 2"+tree2);

            Tree root = new Tree();
            root.setLeft(tree1);
            root.setRight(tree2);
            
            System.out.println("  "+tree1);
            System.out.println("+ "+tree2);
            trees.push(reduce(root));
            System.out.println("= "+root);
            System.out.println();

        }
        Tree remainingTree = reduce(trees.pop());
        System.out.println();
        System.out.println(remainingTree);
        System.out.println(remainingTree.magnitude());
    }
}