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

var getResultFiles = function getResultFiles(project, directory) {
  var sequenceFile = _path2.default.join(project, directory, sequencesFilename);

  if (!_fs2.default.existsSync(sequenceFile)) {
    return [];
  }

  return getXmlFile(sequenceFile).children.map(function (_ref) {
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

    var results = children.map(function (_ref2) {
      var attr = _ref2.attr;
      return attr;
    });
    data[resultType] = results;

    if (groupResults.includes(resultType)) {
      results.forEach(function (result) {
        if (!groupedData.hasOwnProperty(resultType)) {
          groupedData[resultType] = {};
        }

        var prop = result.match || result.word || result.exact;

        if (!groupedData[resultType].hasOwnProperty(prop)) {
          groupedData[resultType][prop] = [];
        }

        result.pmc = directory;
        groupedData[resultType][prop].push(result);
      });
    }
  });

  return { data: data, groupedData: groupedData };
};

exports.getResultFiles = getResultFiles;
exports.getAmiResults = getAmiResults;