define(function(require, exports, module){'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _homunculus = require('homunculus');

var _homunculus2 = _interopRequireDefault(_homunculus);

var _serialize = require('./serialize');

var _serialize2 = _interopRequireDefault(_serialize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Token = _homunculus2.default.getClass('token', 'css');
var Node = _homunculus2.default.getClass('node', 'css');

var Jaw = function () {
  function Jaw() {
    _classCallCheck(this, Jaw);

    this.parser = null;
    this.node = null;
  }

  _createClass(Jaw, [{
    key: 'parse',
    value: function parse(code) {
      var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      this.parser = _homunculus2.default.getParser('css');
      this.node = this.parser.parse(code);
      return (0, _serialize2.default)(this.node, option);
    }
  }, {
    key: 'tokens',
    value: function tokens() {
      return this.ast ? this.parser.lexer.tokens() : null;
    }
  }, {
    key: 'ast',
    value: function ast() {
      return this.node;
    }
  }]);

  return Jaw;
}();

exports.default = new Jaw();});