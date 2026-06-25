import { Lexer } from './lexer.js';
import { Parser } from './parser.js';
import { Interpreter } from './interpreter.js';
import fs from 'fs';

const filename = process.argv[2];

if (!filename) {
    console.error("Usage: perhaps <filename.perhaps>");
    process.exit(1);
}

try {
    const source = fs.readFileSync(filename, 'utf8');
    const tokens = new Lexer(source).tokenize();
    const ast = new Parser(tokens).parse();
    const interpreter = new Interpreter(ast);
    
    // console.log("--- Starting Execution ---");
    const result = await interpreter.execute(); // Wait for the code to finish
    if (result !== undefined) {
        console.log(result);
    }
    // console.log(`--- Finished: Exit Code ${result} ---`);
} catch (err) {
    console.error(`Runtime Error: ${err.message}`);
}
