define(function(require, exports, module){var homunculus=function(){var _0=require('homunculus');return _0.hasOwnProperty("default")?_0["default"]:_0}();
var join=function(){var _1=require('./join');return _1.hasOwnProperty("default")?_1["default"]:_1}();
var sort=function(){var _2=require('./sort');return _2.hasOwnProperty("default")?_2["default"]:_2}();

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
  var _p = 0;
  var now = res;
  for(var i = sel.length - 1; i >= 0; i--) {
    var t = sel[i];
    var s = t.content();
    _p += priority(t, s);
    switch(t.type()) {
      case Token.SELECTOR:
        var prev = t.prev();
        if(prev && prev.type() == Token.SELECTOR) {
          var list = [s];
          do {
            s = prev.content();
            list.push(s);
            _p += priority(prev, s);
            prev = prev.prev();
            i--;
          }
          while(prev && prev.type() == Token.SELECTOR);
          sort(list, function(a, b) {
            return a != '*' && a < b || b == '*';
          });
          var star = list[0] == '*';
          //*开头有几种组合，记录之
          if(star) {
            if(list.length > 2) {
              now['_*.#'] = true;
            }
            else if(list[1][0] == '.') {
              now['_*.'] = true;
            }
            else {
              now['_*#'] = true;
            }
          }
          s = list.join('');
        }
        else if(s == '*') {
          now['_*'] = true;
        }
        now[s] = now[s] || {};
        now = now[s];
        break;
      case Token.PSEUDO:
        var list = [s.replace(/^:+/, '')];
        var prev = t.prev();
        while(prev && prev.type() == Token.PSEUDO) {
          _p += priority(prev);
          list.push(prev.content().replace(/^:+/, ''));
          prev = prev.prev();
          i--;
        }
        //省略*
        if(!prev || prev.type() != Token.SELECTOR) {
          now['_*'] = true;
          now['*'] = now['*'] || {};
          now = now['*'];
        }
        else if(prev) {
          var selTemp = [];
          s = prev.content();
          selTemp.push(s);
          _p += priority(prev, s);
          prev = prev.prev();
          //可能有多个tag.class#id:pseudo
          while(prev && prev.type() == Token.SELECTOR) {
            s = prev.content();
            selTemp.push(s);
            _p += priority(prev, s);
            prev = prev.prev();
            i--;
          }
          sort(selTemp, function(a, b) {
            return a != '*' && a < b || b == '*';
          });
          var star = selTemp[0] == '*';
          //*开头有几种组合，记录之
          if(star) {
            if(selTemp.length > 2) {
              now['_*.#'] = true;
            }
            else if(selTemp.length > 1) {
              if(selTemp[1][0] == '.') {
                now['_*.'] = true;
              }
              else {
                now['_*#'] = true;
              }
            }
            else {
              now['_*'] = true;
            }
          }
          s = selTemp.join('');
          now[s] = now[s] || {};
          now = now[s];
          i--;
        }
        //伪类都存在_:对象下，是个数组
        //每项为长度2的数组，第1个是伪类组合，第2个是对应的值
        now['_:'] = now['_:'] || [];
        var pseudos = now['_:'];
        var pseudo = [];
        list.forEach(function(item) {
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
          now = pseudos[isExist][1];
        }
        else {
          var arr = [];
          arr.push(pseudo);
          now = {};
          arr.push(now);
          pseudos.push(arr);
        }
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
            s = prev.content();
            now[s] = now[s] || {};
            now = now[s];
            _p += priority(prev, s);
            break;
          case ']':
            //TODO: 选择器和属性很特殊，可以交叉：div[attr].class[attr]
            var list = [];
            var item;
            var prev = t;
            //可能有多个属性
            while(prev && prev.content() == ']') {
              i--;
              item = [];
              prev = prev.prev();
              while(prev) {
                i--;
                s = prev.content();
                prev = prev.prev();
                if(s == '[') {
                  break;
                }
                s = s.replace(/^(['"'])(.*)\1/, '$2');
                item.unshift(s);
              }
              list.push({
                v: item,
                s: item.join('')
              });
              _p += 10;
            }
            //省略*
            if(!prev || prev.type() != Token.SELECTOR) {
              now['_*'] = true;
              now['*'] = now['*'] || {};
              now = now['*'];
            }
            else {
              var selTemp = [];
              s = prev.content();
              selTemp.push(s);
              _p += priority(prev, s);
              prev = prev.prev();
              while(prev && prev.type() == Token.SELECTOR) {
                s = prev.content();
                selTemp.push(s);
                _p += priority(prev, s);
                prev = prev.prev();
                i--;
              }
              sort(selTemp, function(a, b) {
                return a != '*' && a < b || b == '*';
              });
              var star = selTemp[0] == '*';
              //*开头有几种组合，记录之
              if(star) {
                if(selTemp.length > 2) {
                  now['_*.#'] = true;
                }
                else if(selTemp.length > 1) {
                  if(selTemp[1][0] == '.') {
                    now['_*.'] = true;
                  }
                  else {
                    now['_*#'] = true;
                  }
                }
                else {
                  now['_*'] = true;
                }
              }
              s = selTemp.join('');
              now[s] = now[s] || {};
              now = now[s];
            }
            //属性都存在_[对象下，是个数组
            //每项为长度2的数组，第1个是属性组合，第2个是对应的值
            now['_['] = now['_['] || [];
            var attrs = now['_['];
            var attr = [];
            var attrTemp = {};
            list.forEach(function(item) {
              if(!attrTemp.hasOwnProperty(item.s)) {
                attr.push(item.v);
                attrTemp[item.s] = true;
              }
            });
            //排序后比对，可能重复
            sort(list, function(a, b) {
              return a.s < b.s;
            });
            var isExist = -1;
            for(var j = 0, len = attrs.length; j < len; j++) {
              var s1 = '';
              s1 += attrs[j][0].map(function(item) {
                return item.join('');
              });
              var s2 = '';
              s2 += attr.map(function(item) {
                return item.join('');
              });
              if(s1 == s2) {
                isExist = j;
                break;
              }
            }
            if(isExist > -1) {
              now = attrs[isExist][1];
            }
            else {
              var arr = [];
              arr.push(attr);
              now = {};
              arr.push(now);
              attrs.push(arr);
            }
            break;
          //TODO: CSS3伪类
          case ')':
            break;
          //TODO: attr和pseudo混杂的情况
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
  //_:伪类
  if(res.hasOwnProperty('_:')) {
    res['_:'].forEach(function(item) {
      depth(item[1]);
    });
  }
  //_[属性
  if(res.hasOwnProperty('_[')) {
    res['_['].forEach(function(item) {
      depth(item[1]);
    });
  }
  //普通样式深度
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

exports["default"]=parse;});