#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <stack>
#include<algorithm>
void loadInput(std::string path, std::vector<std::string> &lines)
{
    std::ifstream ifs{path};
    while (ifs.good())
    {
        std::string line;
        ifs >> line;
        lines.push_back(line);
    }
}
bool isOpeningCharacter(char c)
{
    return c == '(' || c == '[' || c == '{' || c == '<';
}
bool isClosingCharacter(char c)
{
    return c == ')' || c == ']' || c == '}' || c == '>';
}
char getClosingCharacter(char openingCharacter)
{
    switch (openingCharacter)
    {
    case '(':
        return ')';
    case '[':
        return ']';
    case '{':
        return '}';
    case '<':
        return '>';
    default:
        return 0;
    }
}
char findCorruptCharacter(std::string line)
{
    std::stack<char> chunkStack;
    for (char ch : line)
    {
        if (isOpeningCharacter(ch))
        {
            chunkStack.push(ch);
        }
        else if (isClosingCharacter(ch))
        {
            char lastOpening = chunkStack.top();
            if (getClosingCharacter(lastOpening) == ch)
            {
                chunkStack.pop();
            }
            else
            {
                return ch;
            }
        }
    }
    return 0;
}
std::string findMissingClosingCharacters(std::string line)
{
    std::stack<char> chunkStack;
    for (char ch : line)
    {
        if (isOpeningCharacter(ch))
        {
            chunkStack.push(ch);
        }
        else if (isClosingCharacter(ch))
        {
            char lastOpening = chunkStack.top();
           
                chunkStack.pop();
            
        }
    }
    std::string result="";
    while(chunkStack.size()>0){
        result+=getClosingCharacter(chunkStack.top());
        chunkStack.pop();
    }
    return result;
}
int getCorruptScore(char ch)
{
    switch (ch)
    {
    case ')':
        return 3;
    case ']':
        return 57;
    case '}':
        return 1197;
    case '>':
        return 25137;
    }
    return 0;
}
int getIncompletScore(char ch){
        switch (ch)
    {
    case ')':
        return 1;
    case ']':
        return 2;
    case '}':
        return 3;
    case '>':
        return 4;
    }
    return 0;
}
unsigned long calcIncompletScore(std::string remainingChars){
    constexpr  int factor=5;
    unsigned long result=0;
    for(char c:remainingChars){
        result*=factor;
        result+=getIncompletScore(c);
    }
    return result;
}
int main(int argc, char **argv)
{
    if (argc < 2)
    {
        std::cout << "Not enough parameters" << std::endl;
    }
    std::vector<std::string> lines;
    loadInput(argv[1], lines);
    int sum = 0;
    std::vector<unsigned long> incompleteScores;
    for (auto line : lines)
    {
        char corruptChar = findCorruptCharacter(line);
        if (corruptChar)
        {
            sum += getCorruptScore(corruptChar);
        }
        else
        {
            std::string remainingChars=findMissingClosingCharacters(line);
            unsigned long score=calcIncompletScore(remainingChars);
            incompleteScores.push_back(score);
        }
    }
    std::sort(incompleteScores.begin(),incompleteScores.end());
  
    unsigned long median=incompleteScores[incompleteScores.size()/2];
    std::cout << sum << std::endl;
    std::cout<<median<<std::endl;
}