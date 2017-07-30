'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAmiResults = exports.getResultFiles = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _xmldoc = require('xmldoc');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sequencesFilename = 'sequencesfiles.xml';

var getXmlFile = function getXmlFile(fileName) {
  var encoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'utf8';
  return new _xmldoc.XmlDocument(_fs2.default.readFileSync(fileName, encoding));
};
var isNotTextNode = function isNotTextNode(node) {
  return !node.text;
};

var getResultFiles = function getResultFiles(project, directory) {
  var sequenceFile = _path2.default.join(project, directory, sequencesFilename);

  if (!_fs2.default.existsSync(sequenceFile)) {
    return [];
  }

  return getXmlFile(sequenceFile).children.filter(isNotTextNode).map(function (_ref) {
    var name = _ref.attr.name;
    return name;
  });
};

var getAmiResults = function getAmiResults(project, directory, groupResults) {
  var files = getResultFiles(project, directory);
  var data = {};
  var groupedData = {};

  files.forEach(function (fileName) {
    var _getXmlFile = getXmlFile(fileName),
        children = _getXmlFile.children,
        resultType = _getXmlFile.attr.title;

    var results = children.filter(isNotTextNode).map(function (_ref2) {
      var attr = _ref2.attr;
      return attr;
    });
    data[resultType] = results;

    // Group AMI results
    if (groupResults.includes(resultType)) {
      results.forEach(function (result) {
        if (!groupedData.hasOwnProperty(resultType)) {
          groupedData[resultType] = {};
        }
        result.pmc = directory;

        var prop = result.match || result.word || result.exact;

        // If not regex, make list with hits
        if (prop) {
          // Init list
          if (!groupedData[resultType].hasOwnProperty(prop)) {
            groupedData[resultType][prop] = [];
          }

          // Add hit
          groupedData[resultType][prop].push(result);

          // If regex, make set of lists with hits
        } else {
          var nameProp = Object.keys(result).find(function (key) {
            return (/^name\d+$/.test(key)
            );
          });
          var name = result[nameProp];
          var matchProp = nameProp.replace(/^name/, 'value');
          var match = result[matchProp];

          // Init set
          if (!groupedData[resultType].hasOwnProperty(name)) {
            groupedData[resultType][name] = {};
          }

          // Init list
          if (!groupedData[resultType][name].hasOwnProperty(match)) {
            groupedData[resultType][name][match] = [];
          }

          // Add hit
          groupedData[resultType][name][match].push(result);
        }
      });
    }
  });

  return { data: data, groupedData: groupedData };
};

exports.getResultFiles = getResultFiles;
exports.getAmiResults = getAmiResults;