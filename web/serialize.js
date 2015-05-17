define(function(require, exports, module){var homunculus=function(){var _0=require('homunculus');return _0.hasOwnProperty("homunculus")?_0.homunculus:_0.hasOwnProperty("default")?_0.default:_0}();
var join=function(){var _1=require('./join');return _1.hasOwnProperty("join")?_1.join:_1.hasOwnProperty("default")?_1.default:_1}();
var sort=function(){var _2=require('./sort');return _2.hasOwnProperty("sort")?_2.sort:_2.hasOwnProperty("default")?_2.default:_2}();

var Token = homunculus.getClass('token', 'css');
var Node = homunculus.getClass('node', 'css');

function parse(node) {
  var _res = {};
  var _back = {};
  node.leaves().forEach(function(leaf) {
    styleset(leaf, _res, _back);
  });
  depth(_res);
  depth(_back);
  return _back;
}

function styleset(node, res, back) {
  var sels = selectors(node.first());
  var styles = block(node.last());
  sels.forEach(function(sel) {
    record(sel, styles, res, back);
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

function record(sel, styles, res, back) {
  var first = sel[0];
  //没有选择器直接属性或伪类为省略*
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
  now._v = now._v || [];
  styles.forEach(function(style) {
    if(now._v.indexOf(style) == -1) {
      now._v.push(style);
    }
  });
  now._v = now._v.join('');

  now = back;
  for(i = len - 1; i >= 0; i--) {
    var t = sel[i];
    var s = t.content();
    switch(t.type()) {
      case Token.SELECTOR:
        if(t.prev() && t.prev().type() == Token.SELECTOR) {
          var prev = t.prev();
          var list = [s];
          do {
            list.push(prev.content());
            prev = prev.next();
            i++;
          }
          while(prev && prev.type() == Token.SELECTOR);
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
  now._v = now._v || [];
  styles.forEach(function(style) {
    if(now._v.indexOf(style) == -1) {
      now._v.push(style);
    }
  });
  now._v = now._v.join('');
}

function depth(res) {
  var keys = Object.keys(res);
  keys = keys.filter(function(k) {
    return k != '_v';
  });
  if(keys.length) {
    var i = 1;
    keys.forEach(function(k) {
      var item = res[k];
      i = Math.max(depth(item), i);
    });
    res._d = i;
    return i + 1;
  }
  else {
    return 0;
  }
}

exports.default=parse;});