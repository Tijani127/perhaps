import fs from 'fs';
import { Lexer } from './lexer.js';
import { Parser } from './parser.js';

class Environment {
  constructor(parent = null) {
    this.vars = new Map();
    this.parent = parent;
  }
  set(name, value) { this.vars.set(name, value); }
  get(name) {
    if (this.vars.has(name)) return this.vars.get(name);
    if (this.parent) return this.parent.get(name);
    throw new Error(`Variable "${name}" undefined.`);
  }
}

export class Interpreter {
  constructor(ast) {
    this.ast = ast;
    this.globals = new Environment();
    this.functions = new Map();
    this.importedFiles = new Set();
  }

  async execute() {
    await this.processProgram(this.ast);
    const main = this.functions.get('main');
    if (!main) throw new Error("main() not found.");
    return this.evalStatements(main.body, new Environment(this.globals));
  }

  async processProgram(program) {
    for (const node of program.body) {
      if (node.type === 'ImportStmt') {
        if (this.importedFiles.has(node.path)) continue;
        this.importedFiles.add(node.path);
        const src = fs.readFileSync(node.path, 'utf8');
        const ast = new Parser(new Lexer(src).tokenize()).parse();
        await this.processProgram(ast);
      } else if (node.type === 'FunctionDecl') {
        this.functions.set(node.name, node);
      }
    }
  }

  evalStatements(statements, env) {
    for (const stmt of statements) {
      if (stmt.type === 'VarDecl') env.set(stmt.name, this.evaluate(stmt.value, env));
      else if (stmt.type === 'PrintStmt') console.log(this.evaluate(stmt.value, env));
      else if (stmt.type === 'CallExpr') this.callFunction(stmt.name, stmt.args, env);
      else if (stmt.type === 'PerhapsStmt') {
        if (this.evaluate(stmt.test, env) && Math.random() <= stmt.probability) {
          const res = this.evalStatements(stmt.body, env);
          if (res !== undefined) return res;
        } else if (stmt.elseBody) {
          const res = this.evalStatements(stmt.elseBody, env);
          if (res !== undefined) return res;
        }
      } else if (stmt.type === 'ReturnStmt') return this.evaluate(stmt.value, env);
    }
  }

  callFunction(name, argNodes, callerEnv) {
    const func = this.functions.get(name);
    if (!func) throw new Error(`Function "${name}" not found.`);
    const childEnv = new Environment(this.globals);
    func.params.forEach((param, i) => {
      childEnv.set(param.name, this.evaluate(argNodes[i], callerEnv));
    });
    return this.evalStatements(func.body, childEnv);
  }

  evaluate(node, env) {
    if (node.type === 'Literal') return node.value;
    if (node.type === 'Identifier') return env.get(node.name);
    if (node.type === 'CallExpr') return this.callFunction(node.name, node.args, env);
    if (node.type === 'BinaryExpr') {
      const l = this.evaluate(node.left, env), r = this.evaluate(node.right, env);
      if (node.operator === '>') return l > r;
      if (node.operator === '<') return l < r;
      if (node.operator === '==') return l == r;
      if (node.operator === '+') return l + r;
      if (node.operator === '-') return l - r;
      if (node.operator === '*') return l * r;
      if (node.operator === '/') return l / r;
    return null;
    }
    return node;
  }
}
