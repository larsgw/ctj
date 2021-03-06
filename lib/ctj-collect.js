'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _logger = require('./util/logger');

var _logger2 = _interopRequireDefault(_logger);

var _progress = require('./util/progress');

var _progress2 = _interopRequireDefault(_progress);

var _checkIOArgs2 = require('./util/checkIOArgs');

var _checkIOArgs3 = _interopRequireDefault(_checkIOArgs2);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _ami = require('./ami');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

_commander2.default.name('ctj collect').version(_package2.default.version).option('-l, --log-level <level>', 'amount of information to log ' + '(silent, verbose, info*, data, warn, error, or debug)', 'info').option('-p, --project <path>', 'CProject folder').option('-o, --output <path>', 'Output directory ' + '(directory will be created if it doesn\'t exist, defaults to CProject folder').option('-g, --group-results <items>', 'group AMI results of all the papers into JSON, grouped by type.\n                           ' + 'specify types to combine, separated by ",". Types are found in the title attribute in the root element of the results.xml file').option('-s, --save-separately', 'save paper JSON and AMI JSON separately').option('-M, --no-minify', 'do not minify JSON output').parse(process.argv);

if (process.argv.length <= 2) {
  _commander2.default.help();
}

var logger = (0, _logger2.default)(_commander2.default);

var metadataFilename = 'eupmc_result.json';

var _checkIOArgs = (0, _checkIOArgs3.default)(_commander2.default),
    project = _checkIOArgs.project,
    output = _checkIOArgs.output;

var groupResults = _commander2.default.groupResults,
    saveSeparately = _commander2.default.saveSeparately,
    minify = _commander2.default.minify;


logger.info('CProject To JSON (ctj) config:');
logger.info('Input directory: ' + project);
logger.info('Output directory: ' + output);

if (groupResults) {
  logger.info('Also grouping AMI results of types: ' + groupResults);
}

process.chdir(project);

// TODO use CProject/sequencesfiles.xml
var directories = _fs2.default.readdirSync('.').filter(function (directory) {
  return (/PMC\d+/.test(directory)
  );
});
// BEGIN test
// .filter(dir => dir === 'PMC3841577')
// let i = 0
// END test

var progressBar = (0, _progress2.default)({ total: directories.length });

var outputData = {};
outputData.articles = Object.assign.apply(Object, _toConsumableArray(directories.map(function (directory) {
  var metadata = JSON.parse(_fs2.default.readFileSync(_path2.default.join(directory, metadataFilename), 'utf8'));

  var _getAmiResults = (0, _ami.getAmiResults)(directory, groupResults),
      amiResults = _getAmiResults.data,
      groupedData = _getAmiResults.groupedData;

  for (var group in groupedData) {
    if (!outputData.hasOwnProperty(group)) {
      outputData[group] = {};
    }

    for (var results in groupedData[group]) {
      // Regular
      if (Array.isArray(groupedData[group][results])) {
        var _outputData$group$res;

        if (!outputData[group].hasOwnProperty(results)) {
          outputData[group][results] = [];
        }
        (_outputData$group$res = outputData[group][results]).push.apply(_outputData$group$res, _toConsumableArray(groupedData[group][results]));

        // Regex: nested objects
      } else {
        if (!outputData[group].hasOwnProperty(results)) {
          outputData[group][results] = {};
        }
        for (var result in groupedData[group][results]) {
          var _outputData$group$res2;

          if (!outputData[group][results].hasOwnProperty(result)) {
            outputData[group][results][result] = [];
          }
          (_outputData$group$res2 = outputData[group][results][result]).push.apply(_outputData$group$res2, _toConsumableArray(groupedData[group][results][result]));
        }
      }
    }
  }

  progressBar.tick({ directory: directory });
  return _defineProperty({}, directory, {
    metadata: metadata,
    amiResults: amiResults
  });
})));

var stringify = function stringify(json) {
  return JSON.stringify.apply(JSON, [json].concat(_toConsumableArray(minify ? [] : [null, 2])));
};

logger.info('Saving output...');

process.chdir(output);

if (!saveSeparately) {
  // TODO output naming
  _fs2.default.writeFileSync('data.json', stringify(outputData));
} else {
  for (var dataIndex in outputData) {
    _fs2.default.writeFileSync(dataIndex + '.json', stringify(outputData[dataIndex]));
  }
}

logger.info('Saving output succeeded!');