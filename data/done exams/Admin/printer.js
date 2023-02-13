const fs = require('fs')

const data = fs.readFileSync('Admin Set 2(Ans Key).txt', 'utf-8').split(/\r?\n/)
const readline = require('readline');
const rl = readline.createInterface({input: process.stdin, output: process.stdout});

let i = 0
let isConsoleActive = false;

while(i != data.length) {
    if(!isConsoleActive) {
        isConsoleActive = true;
        console.log(data[i])
        rl.question('', ans => {
            isConsoleActive = false
            rl.close();
        });
    }
}