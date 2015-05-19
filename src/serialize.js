import homunculus from 'homunculus';
import join from './join';
import sort from './sort';

var Token = homunculus.getClass('token', 'css');
var Node = homunculus.getClass('node', 'css');

function parse(node) {
  var res = {};
  node.leaves().forEach(function(leaf, i) {
    styleset(leaf, i, res);
  });
  priority(res, 0);
  depth(res);
  return res;
}

function styleset(node, i, res) {
  var sels = selectors(node.first());
  var styles = block(node.last());
  sels.forEach(function(sel) {
    record(sel, i, styles, res);
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
  s = s.replace(/;$/, '');
  return s;
}

function record(sel, idx, styles, res) {
  var first = sel[0];
  //没有选择器直接属性或伪类为省略*
  if(first.type() != Token.SELECTOR) {
    sel.unshift(new Token(Token.SELECTOR, '*'));
  }
  var now = res;
  for(var i = sel.length - 1; i >= 0; i--) {
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
    now._v.push({
      i: idx,
      v: style
    });
  });
}

function priority(res, i) {
  var keys = Object.keys(res);
  keys = keys.filter(function(k) {
    return k.charAt(0) != '_';
  });
  if(keys.length) {
    //
  }
  //有值时才计算优先级
  if(res.hasOwnProperty('_v')) {}
}

function depth(res) {
  var keys = Object.keys(res);
  keys = keys.filter(function(k) {
    return k.charAt(0) != '_';
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

export default parse;