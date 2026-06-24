export class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  eat(type) {
    const token = this.tokens[this.pos];
    if (token?.type === type || token?.value === type) return this.tokens[this.pos++];
    throw new Error(`Expected ${type}, got ${token?.value}`);
  }

  parse() {
    const body = [];
    while (this.pos < this.tokens.length) {
      const token = this.tokens[this.pos];
      if (token.value === 'import') {
        this.eat('import');
        const path = this.eat('STRING').value.replace(/"/g, '');
        this.eat(';');
        body.push({ type: 'ImportStmt', path });
      } else {
        body.push(this.parseFunction());
      }
    }
    return { type: 'Program', body };
  }

  parseFunction() {
    const returnType = this.eat('KEYWORD').value;
    const name = this.eat('IDENTIFIER').value;
    this.eat('(');
    const params = [];
    while (this.tokens[this.pos] && this.tokens[this.pos].value !== ')') {
      const pType = this.eat('KEYWORD').value;
      const pName = this.eat('IDENTIFIER').value;
      params.push({ type: pType, name: pName });
      if (this.tokens[this.pos]?.value === ',') this.eat(',');
    }
    this.eat(')');
    this.eat('{');
    
    const statements = []; // Fixed: defined the array
    while (this.tokens[this.pos] && this.tokens[this.pos].value !== '}') {
      statements.push(this.parseStatement());
    }
    this.eat('}');
    return { type: 'FunctionDecl', name, returnType, params, body: statements };
  }

  parseStatement() {
    const token = this.tokens[this.pos];
    if (token.value === 'int' || token.value === 'float') {
      const type = this.eat('KEYWORD').value;
      const name = this.eat('IDENTIFIER').value;
      this.eat('=');
      const value = this.parseExpression();
      this.eat(';');
      return { type: 'VarDecl', name, dataType: type, value };
    }
    if (token.value === 'perhaps') {
      this.eat('perhaps');
      this.eat('(');
      const test = this.parseExpression();
      let probability = 0.5;
      if (this.tokens[this.pos].value === ',') {
        this.eat(',');
        probability = this.parseExpression().value;
      }
      this.eat(')');
      this.eat('{');
      const body = [];
      while (this.tokens[this.pos].value !== '}') body.push(this.parseStatement());
      this.eat('}');
      let elseBody = null;
      if (this.tokens[this.pos]?.value === 'else') {
        this.eat('else');
        this.eat('{');
        elseBody = [];
        while (this.tokens[this.pos].value !== '}') elseBody.push(this.parseStatement());
        this.eat('}');
      }
      return { type: 'PerhapsStmt', test, probability, body, elseBody };
    }
    if (token.value === 'print') {
      this.eat('print');
      this.eat('(');
      const val = this.parseExpression();
      this.eat(')');
      this.eat(';');
      return { type: 'PrintStmt', value: val };
    }
    if (token.value === 'return') {
      this.eat('return');
      const val = this.parseExpression();
      this.eat(';');
      return { type: 'ReturnStmt', value: val };
    }
    // Function Call as a statement
    if (token.type === 'IDENTIFIER' && this.tokens[this.pos + 1]?.value === '(') {
      const call = this.parseExpression();
      this.eat(';');
      return call;
    }
    if (token.value === 'window') {
    this.eat('window');
    const title = this.eat('STRING').value;
    const width = this.parseExpression();
    const height = this.parseExpression();
    this.eat(';');
    return { type: 'WindowStmt', title, width, height };
  } 
    if (token.value === 'rect') {
        this.eat('rect');
        const x = this.parseExpression();
        const y = this.parseExpression();
        const w = this.parseExpression();
        const h = this.parseExpression();
        this.eat(';');
        return { type: 'RectStmt', x, y, w, h };
    }
  }

  parseExpression() {
    let left = this.parsePrimary();
    const next = this.tokens[this.pos];
    if (next && next.type === 'OPERATOR') {
      const op = this.eat('OPERATOR').value;
      const right = this.parseExpression();
      return { type: 'BinaryExpr', left, operator: op, right };
    }
    return left;
  }

  parsePrimary() {
    const token = this.tokens[this.pos++];
    if (token.type === 'NUMBER') return { type: 'Literal', value: Number(token.value) };
    if (token.type === 'STRING') return { type: 'Literal', value: token.value.replace(/"/g, '') };
    if (token.type === 'IDENTIFIER') {
      // Check for function call: name(...)
      if (this.tokens[this.pos]?.value === '(') {
        this.eat('(');
        const args = [];
        while (this.tokens[this.pos].value !== ')') {
          args.push(this.parseExpression());
          if (this.tokens[this.pos].value === ',') this.eat(',');
        }
        this.eat(')');
        return { type: 'CallExpr', name: token.value, args };
      }
      return { type: 'Identifier', name: token.value };
    }
    throw new Error(`Unexpected token: ${token.value}`);
  }
}
