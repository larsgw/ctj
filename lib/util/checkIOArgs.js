'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = checkIOArgs;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function checkIOArgs(_ref) {
  var project = _ref.project,
      output = _ref.output;

  if (!project) {
    throw new Error('No CProject directory provided');
  } else if (!_fs2.default.existsSync(project)) {
    throw new Error('CProject directory: ' + project + ' does not exist');
  } else if (!output) {
    output = project;
  } else if (!_fs2.default.existsSync(output)) {
    _winston2.default.info('Creating output directory: ' + output);
    _fs2.default.mkdirSync(output);
  }
  return { project: project, output: output };
}