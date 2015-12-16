define(function(require, exports, module){var homunculus=function(){var _0=require('homunculus');return _0.hasOwnProperty("default")?_0["default"]:_0}();
var join=function(){var _1=require('./join');return _1.hasOwnProperty("default")?_1["default"]:_1}();
var sort=function(){var _2=require('./sort');return _2.hasOwnProperty("default")?_2["default"]:_2}();

var Token = homunculus.getClass('token', 'css');
var Node = homunculus.getClass('node', 'css');

var idx;

function parse(node, option) {
  idx = 0;
  var res = {
    default: {}
  };
  node.leaves().forEach(function(leaf, i) {
    if(leaf.name() == Node.STYLESET) {
      styleset(leaf, res.default, option);
    }
    else if(leaf.name() == Node.MEDIA) {
      res.media = res.media || [];
      var item = {};

      var qlist = leaf.leaf(1);
      qlist.leaves().forEach(function(leaf) {
        if(leaf.name() == Node.MEDIAQUERY) {
          query(leaf, item);
        }
      });

      var block = leaf.last();
      var leaves = block.leaves();
      if(leaves.length > 2) {
        var style = {};
        for(var i = 1, len = leaves.length - 1; i < len; i++) {
          styleset(leaves[i], style, option);
        }
        item.style = style;
      }
      if(item.style) {
        res.media.push(item);
      }
    }
  });
  return res;
}

function query(node, item) {
  var leaves = node.leaves();
  var query = [];
  leaves.forEach(function(leaf) {
    if(leaf.name() == Node.EXPR) {
      var expr = [];
      leaf.leaves().forEach(function(item) {
        if(item.name() == Node.KEY || item.name() == Node.VALUE) {
          expr.push(join(item, true));
        }
      });
      //可能只有key或者k/v都有，以String/Array格式区分
      if(expr.length) {
        query.push(expr.length > 1 ? expr : expr[0]);
      }
    }
  });
  item.query = item.query || [];
  item.query.push(query);
}

function styleset(node, res, option) {
  var sels = selectors(node.first());
  var styles = block(node.last());
  var i = idx++;
  sels.forEach(function(sel) {
    record(sel, i, styles, res, option);
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

function record(sel, idx, styles, res, option) {
  var _p = [0, 0, 0];
  for(var i = sel.length - 1; i >= 0; i--) {
    var temp = {
      s: [],
      a: [],
      p: []
    };
    var t = sel[i];
    var s = t.content();
    priority(t, s, _p);
    switch(t.type()) {
      case Token.SELECTOR:
        temp.s.push(s);
        break;
      case Token.PSEUDO:
        var s2 = s.replace(/^:+/, '');
        if(sel[i].content() == '(') {
          s2 += '(';
          for(var j = i + 1; j < sel.length; j++) {
            if(sel[j].content() == ')') {
              s2 += ')';
              break;
            }
            s2 += sel[j].content();
          }
        }
        temp.p.push(s2);
        break;
      case Token.SIGN:
        switch(s) {
          case ']':
            var item = [];
            i--;
            t = t.prev();
            while(t) {
              s = t.content();
              if(s == '[') {
                break;
              }
              i--;
              t = t.prev();
              s = s.replace(/^(['"])(.*)\1$/, '$2');
              item.unshift(s);
            }
            temp.a.push({
              v: item,
              s: item.join('')
            });
            break;
          case '+':
          case '>':
          case '~':
            s = '_' + s;
            res[s] = res[s] || {};
            res = res[s];
            continue;
          //忽略掉()，因为其出现在:nth-child(n)中
          case ')':
            i--;
            t = t.prev();
            while(t) {
              s = t.content();
              if(s == '(') {
                break;
              }
              i--;
              t = t.prev();
            }
            break;
        }
        break;
    }
    t = t.prev();
    while(t && !isSplit(t)) {
      s = t.content();
      priority(t, s, _p);
      switch(t.type()) {
        case Token.SELECTOR:
          temp.s.push(s);
          break;
        case Token.PSEUDO:
          var s2 = s.replace(/^:+/, '');
          if(sel[i].content() == '(') {
            s2 += '(';
            for(var j = i + 1; j < sel.length; j++) {
              if(sel[j].content() == ')') {
                s2 += ')';
                break;
              }
              s2 += sel[j].content();
            }
          }
          temp.p.push(s2);
          break;
        case Token.SIGN:
          switch(s) {
            case ']':
              var item = [];
              i--;
              t = t.prev();
              while(t) {
                s = t.content();
                if(s == '[') {
                  break;
                }
                i--;
                t = t.prev();
                s = s.replace(/^(['"])(.*)\1$/, '$2');
                item.unshift(s);
              }
              temp.a.push({
                v: item,
                s: item.join('')
              });
              break;
            case '+':
            case '>':
            case '~':
              s = '_' + s;
              res[s] = res[s] || {};
              res = res[s];
              continue;
            //忽略掉()，因为其出现在:nth-child(n)中
            case ')':
              i--;
              t = t.prev();
              while(t) {
                s = t.content();
                if(s == '(') {
                  break;
                }
                i--;
                t = t.prev();
              }
              break;
          }
          break;
      }
      t = t.prev();
      i--;
    }
    res = save(temp, res);
  }
  res._v = res._v || [];
  styles.forEach(function(style) {
    res._v.push([idx, style]);
  });
  if(!option.noPriority) {
    res._p = _p;
  }
}

function priority(token, s, p) {
  switch(token.type()) {
    case Token.SELECTOR:
      if(s.charAt(0) == '#') {
        p[0]++;
      }
      else if(s.charAt(0) == '.') {
        p[1]++;
      }
      else {
        p[2]++;
      }
      break;
    case Token.PSEUDO:
      p[2]++;
      break;
    case Token.SIGN:
      if(s == ']') {
        p[1]++;
      }
      break;
  }
}

function isSplit(token) {
  if(token.type() == Token.BLANK) {
    return true;
  }
  if(token.type() == Token.LINE) {
    return true;
  }
  if(token.type() == Token.SIGN) {
    return ['>', '+', '~', '{', '}', ','].indexOf(token.content()) > -1;
  }
  return false;
}

function save(temp, res) {
  if(!temp.s.length) {
    temp.s.push('*');
  }
  //selector按name/class/id排序
  sort(temp.s, function(a, b) {
    return a != '*' && a < b || b == '*';
  });
  var star = temp.s[0] == '*';
  //*开头有几种组合，记录之
  if(star) {
    res['_*'] = true;
    if(temp.s.length > 1) {
      if(temp.s.length > 2) {
        res['_*.#'] = true;
      }
      else if(temp.s[1][0] == '.') {
        res['_*.'] = true;
      }
      else {
        res['_*#'] = true;
      }
    }
  }
  var s = temp.s.join('');
  res[s] = res[s] || {};
  res = res[s];
  //伪类
  if(temp.p.length) {
    res['_:'] = res['_:'] || [];
    var pseudos = res['_:'];
    var pseudo = [];
    temp.p.forEach(function(item) {
      //防止多次重复
      if(pseudo.indexOf(item) == -1) {
        pseudo.push(item);
      }
    });
    //排序后比对，可能重复，合并之如a:hover{...}a:hover{...}会生成2个hover数组
    sort(pseudo, function(a, b) {
      return a < b;
    });
    var isExist = -1;
    for(var j = 0, len = pseudos.length; j < len; j++) {
      if(pseudos[j][0].join(',') == pseudo.join(',')) {
        isExist = j;
        break;
      }
    }
    if(isExist > -1) {
      res = pseudos[isExist][1];
    }
    else {
      var arr = [];
      arr.push(pseudo);
      res = {};
      arr.push(res);
      pseudos.push(arr);
    }
  }
  //属性
  if(temp.a.length) {
    res['_['] = res['_['] || [];
    var attrs = res['_['];
    var attr = [];
    //去重并排序
    sort(temp.a, function(a, b) {
      return a.s < b.s;
    });
    var hash = {};
    temp.a.forEach(function(item) {
      if(!hash.hasOwnProperty(item.s)) {
        attr.push(item.v);
      }
    });
    var isExist = -1;
    var join = '';
    join += attr.map(function(item) {
      return item.join('');
    });
    for(var j = 0, len = attrs.length; j < len; j++) {
      var s1 = '';
      s1 += attrs[j][0].map(function(item) {
        return item.join('');
      });
      if(s1 == join) {
        isExist = j;
        break;
      }
    }
    if(isExist > -1) {
      res = attrs[isExist][1];
    }
    else {
      var arr = [];
      arr.push(attr);
      res = {};
      arr.push(res);
      attrs.push(arr);
    }
  }
  return res;
}

exports["default"]=parse;});