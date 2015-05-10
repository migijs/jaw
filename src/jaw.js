import homunculus from 'homunculus';
import serialize from './serialize';
import componentName from './componentName';

var Token = homunculus.getClass('token', 'jsx');
var Node = homunculus.getClass('node', 'jsx');

class Jaw {
  constructor() {
    this.parser = null;
    this.node = null;
  }

  parse(code, css) {
    var cssList = serialize(css);
    this.parser = homunculus.getParser('jsx');
    this.node = this.parser.parse(code);
    this.recursion(this.node, cssList);
    return code;
  }
  recursion(node, cssList) {
    var self = this;
    var isToken = node.isToken();
    if(!isToken) {
      switch(node.name()) {
        case Node.CLASSDECL:
          this.klass(node, cssList);
          return;
      }
      node.leaves().forEach(function(leaf) {
        self.recursion(leaf, cssList);
      });
    }
  }
  klass(node, cssList) {
    var heritage = node.leaf(2);
    if(heritage && heritage.name() == Node.HERITAGE) {
      var mmb = heritage.leaf(1);
      if(mmb.name() == Node.MMBEXPR) {
        var prmr = mmb.first();
        if(prmr.name() == Node.PRMREXPR) {
          var token = prmr.first();
          if(token.isToken() && token.token().content() == 'migi') {
            token = mmb.leaf(1);
            if(token.isToken() && token.token().content() == '.') {
              token = mmb.leaf(2);
              if(token.isToken() && componentName.hasOwnProperty(token.token().content())) {
                //TODO
              }
            }
          }
        }
      }
    }
  }

  get tokens() {
    return this.ast ? this.parser.lexer.tokens() : null;
  }
  get ast() {
    return this.node;
  }
}

export default new Jaw();