define(function(require, exports, module){'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (node, excludeLine) {
  res = '';
  recursion(node, excludeLine);
  return res;
};

var _homunculus = require('homunculus');

var _homunculus2 = _interopRequireDefault(_homunculus);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Token = _homunculus2.default.getClass('token', 'jsx');

var S = {};
S[Token.LINE] = S[Token.COMMENT] = S[Token.BLANK] = true;

var index;
var res;

function recursion(node, excludeLine) {
  if (node.isToken()) {
    var token = node.token();
    if (!token.isVirtual()) {
      res += token.content();
      while (token.next()) {
        token = token.next();
        if (token.isVirtual() || !S.hasOwnProperty(token.type())) {
          break;
        }
        var s = token.content();
        if (!excludeLine || s != '\n') {
          res += token.content();
        }
      }
    }
  } else {
    node.leaves().forEach(function (leaf) {
      recursion(leaf, excludeLine);
    });
  }
}});