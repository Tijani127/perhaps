export class Lexer {
  constructor(source) {
    this.source = source;
    this.tokens = [];
    this.cursor = 0;
    this.rules = [
      { type: 'COMMENT', regex: /\/\/.*/y },
      { type: 'KEYWORD', regex: /\b(int|float|void|perhaps|return|print|else|import)\b/y },
      { type: 'IDENTIFIER', regex: /[a-zA-Z_][a-zA-Z0-9_]*/y },
      { type: 'NUMBER', regex: /\d+(\.\d+)?/y },
      { type: 'STRING', regex: /"([^"\\]|\\.)*"/y },
      { type: 'OPERATOR', regex: /==|!=|<=|>=|[=+\-*/><]/y },
      { type: 'PUNCTUATION', regex: /[(){};,]/y },
      { type: 'WHITESPACE', regex: /\s+/y, skip: true }
    ];
  }

  tokenize() {
    this.tokens = [];
    this.cursor = 0;

    while (this.cursor < this.source.length) {
      let matched = false;

      for (const rule of this.rules) {
        rule.regex.lastIndex = this.cursor;
        const match = rule.regex.exec(this.source);

        if (match) {
          const matchString = match[0];
          if (!rule.skip) {
            this.tokens.push({ type: rule.type, value: matchString });
          }
          this.cursor += matchString.length;
          matched = true;
          break;
        }
      }

      if (!matched) {
        throw new Error(`Unexpected character '${this.source[this.cursor]}' at index ${this.cursor}`);
      }
    }
    return this.tokens;
  }
}
