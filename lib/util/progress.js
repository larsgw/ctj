'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _progress = require('progress');

var _progress2 = _interopRequireDefault(_progress);

require('colors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var makeBar = function makeBar() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$msg = _ref.msg,
      msg = _ref$msg === undefined ? 'Parsing directory' : _ref$msg,
      total = _ref.total,
      _ref$width = _ref.width,
      width = _ref$width === undefined ? 30 : _ref$width,
      _ref$curr = _ref.curr,
      curr = _ref$curr === undefined ? 0 : _ref$curr,
      _ref$complete = _ref.complete,
      complete = _ref$complete === undefined ? '='.green : _ref$complete,
      _ref$head = _ref.head,
      head = _ref$head === undefined ? complete : _ref$head,
      _ref$incomplete = _ref.incomplete,
      incomplete = _ref$incomplete === undefined ? ' ' : _ref$incomplete,
      _ref$text = _ref.text,
      text = _ref$text === undefined ? '[:bar] ' + msg + ' :current/:total: :item (eta :etas)' : _ref$text,
      renderThrottle = _ref.renderThrottle,
      clear = _ref.clear,
      stream = _ref.stream,
      callback = _ref.callback;

  return new _progress2.default(text, {
    total: total,
    width: width,
    curr: curr,
    complete: complete,
    head: head,
    incomplete: incomplete,
    text: text,
    renderThrottle: renderThrottle,
    clear: clear,
    stream: stream,
    callback: callback
  });
};

exports.default = makeBar;