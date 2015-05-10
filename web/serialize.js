define(function(require, exports, module){var homunculus=function(){var _0=require('homunculus');return _0.hasOwnProperty("homunculus")?_0.homunculus:_0.hasOwnProperty("default")?_0.default:_0}();
var componentName=function(){var _1=require('./componentName');return _1.hasOwnProperty("componentName")?_1.componentName:_1.hasOwnProperty("default")?_1.default:_1}();

var Token = homunculus.getClass('token', 'css');
var Node = homunculus.getClass('node', 'css');

function parse(code) {
  var parser = homunculus.getParser('css');
  var node = parser.parse(code);
  var res = [];
  recursion(node, res);
  return res;
}

function recursion(node, res) {

}

exports.default=parse;});