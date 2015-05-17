define(function(require, exports, module){var homunculus=function(){var _0=require('homunculus');return _0.hasOwnProperty("homunculus")?_0.homunculus:_0.hasOwnProperty("default")?_0.default:_0}();
var join=function(){var _1=require('./join');return _1.hasOwnProperty("join")?_1.join:_1.hasOwnProperty("default")?_1.default:_1}();

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
      case Token.PSEUDO:
      case Token.SIGN:
        now[s] = now[s] || {};
        now = now[s];
        break;
    }
  }
  now.list = styles;
}

exports.default=parse;});