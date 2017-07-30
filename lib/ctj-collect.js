'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _progress = require('progress');

var _progress2 = _interopRequireDefault(_progress);

require('colors');

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _ami = require('./ami');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

_commander2.default.name('ctj collect').version(_package2.default.version).option('-p, --project <path>', 'CProject folder').option('-o, --output <path>', 'Output directory ' + '(directory will be created if it doesn\'t exist, defaults to CProject folder').option('-g, --group-results <items>', 'group AMI results of all the papers into JSON, grouped by type.\n                           ' + 'specify types to combine, separated by ",". Types are found in the title attribute in the root element of the results.xml file').option('-s, --save-separately', 'save paper JSON and AMI JSON separately').option('-M, --no-minify', 'do not minify JSON output').parse(process.argv);

if (process.argv.length <= 2) {
  _commander2.default.help();
}

var metadataFilename = 'eupmc_result.json';

var project = _commander2.default.project,
    output = _commander2.default.output,
    groupResults = _commander2.default.groupResults,
    saveSeparately = _commander2.default.saveSeparately,
    minify = _commander2.default.minify;


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

_winston2.default.info('CProject To JSON (ctj) config:');
_winston2.default.info('Input directory: ' + project);
_winston2.default.info('Output directory: ' + output);

if (groupResults) {
  _winston2.default.info('Also grouping AMI results of types: ' + groupResults);
}

// TODO use CProject/sequencesfiles.xml
var directories = _fs2.default.readdirSync(project).filter(function (directory) {
  return (/PMC\d+/.test(directory)
  );
});
// BEGIN test
// .filter(dir => dir === 'PMC3841577')
// let i = 0
// END test

var progressBarText = '[:bar] Parsing directory :current/:total: :directory (eta :etas)';
var progressBar = new _progress2.default(progressBarText, {
  complete: '='.green,
  width: 30,
  total: directories.length
});

var outputData = {};
outputData.articles = Object.assign.apply(Object, _toConsumableArray(directories.map(function (directory) {
  var metadata = JSON.parse(_fs2.default.readFileSync(_path2.default.join(project, directory, metadataFilename), 'utf8'));

  var _getAmiResults = (0, _ami.getAmiResults)(project, directory, groupResults),
      amiResults = _getAmiResults.data,
      groupedData = _getAmiResults.groupedData;

  for (var group in groupedData) {
    if (!outputData.hasOwnProperty(group)) {
      outputData[group] = {};
    }

    for (var results in groupedData[group]) {
      // Regular
      if (Array.isArray(results)) {
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

_winston2.default.info('Saving output...');

if (!saveSeparately) {
  // TODO output naming
  _fs2.default.writeFileSync(_path2.default.join(output, 'data.json'), stringify(outputData));
} else {
  for (var dataIndex in outputData) {
    _fs2.default.writeFileSync(_path2.default.join(output, dataIndex + '.json'), stringify(outputData[dataIndex]));
  }
}

_winston2.default.info('Saving output succeeded!');