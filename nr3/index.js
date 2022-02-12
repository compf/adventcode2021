const fs = require('fs');

const main = async () => {
  const inputFile = fs.readFileSync('../inputs/nr6.txt');

  const initialState = inputFile.toString().split(',').map(Number);

  for (let i = 0; i < 80; i++) {
    initialState.forEach((daysToSpawn, index) => {
      if (daysToSpawn === 0) {
        initialState[index] = 6;
        initialState.push(8);
      } else {
        initialState[index] = daysToSpawn - 1;
      }

    });
  }

  console.log(initialState.length);
}

main();