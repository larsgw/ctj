'use strict';

require('babel-polyfill');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _progress = require('./util/progress');

var _progress2 = _interopRequireDefault(_progress);

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _checkIOArgs2 = require('./util/checkIOArgs');

var _checkIOArgs3 = _interopRequireDefault(_checkIOArgs2);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _ami = require('./ami');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// BEGIN CONSTANT consts
var ns = 'https://larsgw.github.io/ctj/rdf/#/';
var prefixes = {
  '': ns + 'hash/',
  type: ns + 'type/',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  cito: 'http://purl.org/spar/cito/',
  pmc: 'http://identifiers.org/pmcid/'
};

var useTypes = {
  genus: 'Genus',
  genussp: 'Genus Species',
  binomial: 'Species'
};

var maxChars = Math.max.apply(Math, _toConsumableArray(Object.keys(useTypes).map(function (a) {
  return a.length;
})));
// END

_commander2.default.name('ctj rdf').version(_package2.default.version).option('-p, --project <path>', 'CProject folder').option('-o, --output <path>', 'Output directory ' + '(directory will be created if it doesn\'t exist, defaults to CProject folder').parse(process.argv);

if (process.argv.length <= 2) {
  _commander2.default.help();
}

var _checkIOArgs = (0, _checkIOArgs3.default)(_commander2.default),
    project = _checkIOArgs.project,
    output = _checkIOArgs.output;

var isUniqueHit = function isUniqueHit(thing, index, array) {
  return array.findIndex(function (elm) {
    return (0, _ami.getLabel)(thing) === (0, _ami.getLabel)(elm);
  }) === index;
};

_winston2.default.info('CProject To JSON (ctj) config:');
_winston2.default.info('Input directory: ' + project);
_winston2.default.info('Output directory: ' + output);

// TODO don't assume directory name is a PMCID
var directories = _fs2.default.readdirSync(project).filter(function (directory) {
  return (/PMC\d+/.test(directory)
  );
});
var progressBar = (0, _progress2.default)({ total: directories.length });

var rdf = Object.keys(prefixes).map(function (prefix) {
  return '@prefix ' + prefix + ': <' + prefixes[prefix] + '> .' + '\n';
}).join('') + '\n';
var defineLater = { types: {}, hits: {} };

directories.forEach(function (directory) {
  var ami = (0, _ami.getAmiResults)(project, directory, []).data;

  for (var type in ami) {
    if (!useTypes.hasOwnProperty(type)) {
      continue;
    }

    if (!defineLater.types[type]) {
      defineLater.types[type] = type;
    }

    // TODO don't assume directory name is a PMCID
    rdf += 'pmc:' + directory + ' cito:discusses' + '\n';

    var hits = ami[type].filter(isUniqueHit);
    var lastHit = hits.slice(-1)[0];

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = hits[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var hit = _step.value;

        var name = (0, _ami.getLabel)(hit);
        var hitHash = (0, _md2.default)(type + '|' + name);

        if (!defineLater.hits[hitHash]) {
          defineLater.hits[hitHash] = { type: type, name: name };
        }

        var suffix = hit === lastHit ? ' .\n' : ' ,';
        rdf += '  :' + hitHash + suffix + '\n';
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  progressBar.tick({ directory: directory });
});

for (var type in defineLater.types) {
  rdf += 'type:' + type + ' rdfs:label "' + useTypes[defineLater.types[type]] + '" .\n';
}

rdf += '\n';

for (var hitHash in defineLater.hits) {
  var _defineLater$hits$hit = defineLater.hits[hitHash],
      _type = _defineLater$hits$hit.type,
      name = _defineLater$hits$hit.name;

  rdf += ':' + hitHash + ' a type:' + _type.padEnd(maxChars) + ' ; rdfs:label "' + name + '" .\n';
}

_winston2.default.info('Saving output...');

// TODO output naming
_fs2.default.writeFileSync(_path2.default.join(output, 'data.ttl'), rdf);

_winston2.default.info('Saving output succeeded!');