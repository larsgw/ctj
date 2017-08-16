#!/usr/bin/env node
'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.name('ctj').version(_package2.default.version).command('collect [options]', 'Collect AMI results into one or several JSON files').command('rdf [options]', 'Collect AMI results into a RDF file').parse(process.argv);

if (!process.argv) {
  _commander2.default.help();
}