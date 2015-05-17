import homunculus from 'homunculus';
import join from './join';
import sort from './sort';

var Token = homunculus.getClass('token', 'css');
var Node = homunculus.getClass('node', 'css');

function parse(node) {
  var res = {};
  node.leaves().forEach(function(leaf) {
    styleset(leaf, res);
  });
  return res;
}

function styleset(node, res) {
  var sels = selectors(node.first());
  var styles = block(node.last());
  sels.forEach(function(sel) {
    record(sel, styles, res);
  });
}
function selectors(node) {
  var res = [];
  node.leaves().forEach(function(leaf) {
    if(leaf.name() == Node.SELECTOR) {
      res.push(selector(leaf));
    }
  });
  return res;
}
function selector(node) {
  return node.leaves().map(function(leaf) {
    return leaf.token();
  });
}
function block(node) {
  var res = [];
  node.leaves().forEach(function(leaf) {
    if(leaf.name() == Node.STYLE) {
      res.push(style(leaf));
    }
  });
  return res;
}
function style(node) {
  var s = join(node, true).trim();
  if(s.charAt(s.length - 1) != ';') {
    s += ';';
  }
  return s;
}

function record(sel, styles, res) {
  var first = sel[0];
  if(first.type() != Token.SELECTOR) {
    sel.unshift(new Token(Token.SELECTOR, '*'));
  }
  var now = res;
  for(var i = 0, len = sel.length; i < len; i++) {
    var t = sel[i];
    var s = t.content();
    switch(t.type()) {
      case Token.SELECTOR:
        if(t.next() && t.next().type() == Token.SELECTOR) {
          var next = t.next();
          var list = [s];
          do {
            list.push(next.content());
            next = next.next();
            i++;
          }
          while(next && next.type() == Token.SELECTOR);
          sort(list, function(a, b) {
            return a < b;
          });
          s = list.join('');
        }
      case Token.PSEUDO:
      case Token.SIGN:
        now[s] = now[s] || {};
        now = now[s];
        break;
    }
  }
  now.values = now.values || [];
  styles.forEach(function(style) {
    if(now.values.indexOf(style) == -1) {
      now.values.push(style);
    }
  });
}

export default parse;