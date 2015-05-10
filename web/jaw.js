define(function(require, exports, module){var homunculus=function(){var _0=require('homunculus');return _0.hasOwnProperty("homunculus")?_0.homunculus:_0.hasOwnProperty("default")?_0.default:_0}();
var serialize=function(){var _1=require('./serialize');return _1.hasOwnProperty("serialize")?_1.serialize:_1.hasOwnProperty("default")?_1.default:_1}();
var componentName=function(){var _2=require('./componentName');return _2.hasOwnProperty("componentName")?_2.componentName:_2.hasOwnProperty("default")?_2.default:_2}();

var Token = homunculus.getClass('token', 'jsx');
var Node = homunculus.getClass('node', 'jsx');


  function Jaw() {
    this.parser = null;
    this.node = null;
  }

  Jaw.prototype.parse = function(code, css) {
    var cssList = serialize(css);
    this.parser = homunculus.getParser('jsx');
    this.node = this.parser.parse(code);
    this.recursion(this.node, cssList);
    return code;
  }
  Jaw.prototype.recursion = function(node, cssList) {
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
  Jaw.prototype.klass = function(node, cssList) {
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

  var _3={};_3.tokens={};_3.tokens.get =function() {
    return this.ast ? this.parser.lexer.tokens() : null;
  }
  _3.ast={};_3.ast.get =function() {
    return this.node;
  }
Object.keys(_3).forEach(function(k){Object.defineProperty(Jaw.prototype,k,_3[k])});

exports.default=new Jaw();});