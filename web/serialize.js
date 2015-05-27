define(function(require, exports, module){var homunculus=function(){var _0=require('homunculus');return _0.hasOwnProperty("homunculus")?_0.homunculus:_0.hasOwnProperty("default")?_0.default:_0}();
var join=function(){var _1=require('./join');return _1.hasOwnProperty("join")?_1.join:_1.hasOwnProperty("default")?_1.default:_1}();
var sort=function(){var _2=require('./sort');return _2.hasOwnProperty("sort")?_2.sort:_2.hasOwnProperty("default")?_2.default:_2}();

var Token = homunculus.getClass('token', 'css');
var Node = homunculus.getClass('node', 'css');

function parse(node) {
  var res = {};
  node.leaves().forEach(function(leaf, i) {
    styleset(leaf, i, res);
  });
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
  var _p = 0;
  var now = res;
  for(var i = sel.length - 1; i >= 0; i--) {
    var t = sel[i];
    var s = t.content();
    _p += priority(t, s);
    switch(t.type()) {
      case Token.SELECTOR:
        if(t.prev() && t.prev().type() == Token.SELECTOR) {
          var prev = t.prev();
          var list = [s];
          do {
            s = prev.content();
            list.push(s);
            prev = prev.next();
            i++;
            _p += priority(prev, s);
          }
          while(prev && prev.type() == Token.SELECTOR);
          sort(list, function(a, b) {
            return a < b;
          });
          s = list.join('');
        }
        now[s] = now[s] || {};
        now = now[s];
        break;
      case Token.PSEUDO:
        var list = [s.replace(/^:+/, '')];
        var prev = t.prev();
        while(prev && prev.type() == Token.PSEUDO) {
          _p += priority(prev, s);
          list.push(prev.content().replace(/^:+/, ''));
          prev = prev.prev();
          i--;
        }
        //省略*
        if(prev.type() != Token.SELECTOR) {
          now['*'] = now['*'] || {};
          now = now['*'];
        }
        else {
          s = prev.content();
          now[s] = now[s] || {};
          now = now[s];
          i--;
          _p += priority(prev, s);
        }

        now['_:'] = now['_:'] || [];
        //TODO: 重复的合并，如a:hover{...}a:hover{...}会生成2个hover数组
        var arr = [];
        var pseudo = [];
        var v = {};
        list.forEach(function(item) {
          //防止多次重复
          if(pseudo.indexOf(item) == -1) {
            pseudo.push(item);
          }
        });
        arr.push(pseudo);
        arr.push(v);
        now['_:'].push(arr);
        now = v;
        break;
      case Token.SIGN:
        switch(s) {
          case '>':
          case '+':
          case '~':
            now['_' + s] = now['_' + s] || {};
            now = now['_' + s];
            i--;
            var prev = t.prev();
            //省略*
            if(prev.type() != Token.SELECTOR) {
              now['*'] = now['*'] || {};
              now = now['*'];
            }
            else {
              s = prev.content();
              now[s] = now[s] || {};
              now = now[s];
              _p += priority(prev, s);
            }
            break;
          //TODO: 属性和CSS3伪类
          case ')':
            break;
          case ']':
            break;
        }
        break;
    }
  }
  now._v = now._v || [];
  styles.forEach(function(style) {
    now._v.push([idx, style]);
  });
  now._p = _p;
}

function priority(token, s) {
  switch(token.type()) {
    case Token.SELECTOR:
      if(s.charAt(0) == '#') {
        return 100;
      }
      else if(s.charAt(0) == '.') {
        return 10;
      }
      return 1;
    case Token.PSEUDO:
      return 1;
    default:
      return 0;
  }
}

function depth(res) {
  var keys = Object.keys(res);
  keys = keys.filter(function(k) {
    return k.charAt(0) != '_';
  });
  if(keys.length) {
    var i = 0;
    keys.forEach(function(k) {
      var item = res[k];
      i = Math.max(depth(item), i);
    });
    if(i) {
      res._d = i;
    }
    return i + 1;
  }
  else {
    return 0;
  }
}

exports.default=parse;});