if(typeof define === 'function' && (define.amd || define.cmd)) {
  define(function(require, exports, module) {
    module.exports = require('./web/jaw').default;
  });
}
else {
  module.exports = require('./build/jaw').default;
}