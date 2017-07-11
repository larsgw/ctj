'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _progress = require('progress');

var _progress2 = _interopRequireDefault(_progress);

require('colors');

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.name('ctj').version(_package2.default.version).command('collect [options]', 'Collect AMI results into one or several JSON files').parse(process.argv);

if (!process.argv) {
  _commander2.default.help();
}