define(function(require, exports, module){var homunculus=function(){var _0=require('homunculus');return _0.hasOwnProperty("homunculus")?_0.homunculus:_0.hasOwnProperty("default")?_0.default:_0}();
var serialize=function(){var _1=require('./serialize');return _1.hasOwnProperty("serialize")?_1.serialize:_1.hasOwnProperty("default")?_1.default:_1}();

var Token = homunculus.getClass('token', 'css');
var Node = homunculus.getClass('node', 'css');


  function Jaw() {
    this.parser = null;
    this.node = null;
  }

  Jaw.prototype.parse = function(code) {
    this.parser = homunculus.getParser('css');
    this.node = this.parser.parse(code);
    return serialize(this.node);
  }

  var _2={};_2.tokens={};_2.tokens.get =function() {
    return this.ast ? this.parser.lexer.tokens() : null;
  }
  _2.ast={};_2.ast.get =function() {
    return this.node;
  }
Object.keys(_2).forEach(function(k){Object.defineProperty(Jaw.prototype,k,_2[k])});

exports.default=new Jaw();});