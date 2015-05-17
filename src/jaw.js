import homunculus from 'homunculus';
import serialize from './serialize';

var Token = homunculus.getClass('token', 'css');
var Node = homunculus.getClass('node', 'css');

class Jaw {
  constructor() {
    this.parser = null;
    this.node = null;
  }

  parse(code) {
    this.parser = homunculus.getParser('css');
    this.node = this.parser.parse(code);
    return serialize(this.node);
  }

  get tokens() {
    return this.ast ? this.parser.lexer.tokens() : null;
  }
  get ast() {
    return this.node;
  }
}

export default new Jaw();