'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var colors = {
  silly: 'magenta',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  debug: 'blue',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  error: 'red'
};

var levels = {
  silly: 0,
  input: 1,
  verbose: 2,
  prompt: 3,
  debug: 4,
  data: 5,
  info: 6,
  help: 7,
  warn: 8,
  error: 9
};

var allowedlevels = Object.keys(levels);

var setupLogger = function setupLogger(_ref) {
  var level = _ref.logLevel;

  if (allowedlevels.indexOf(level) === -1) {
    throw new Error('--log-level must be one of: ' + 'quiet, verbose, data, info, warn, error, debug');
  }

  _winston2.default.addColors(colors);

  _winston2.default.remove(_winston2.default.transports.Console);
  _winston2.default.add(_winston2.default.transports.Console, { level: level, levels: levels, colorize: true });

  return _winston2.default;
};

exports.default = setupLogger;