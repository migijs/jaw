import homunculus from 'homunculus';
import componentName from './componentName';

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
  //TODO
}

export default parse;