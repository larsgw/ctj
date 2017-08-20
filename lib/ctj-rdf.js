'use strict';

require('babel-polyfill');

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

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _checkIOArgs2 = require('./util/checkIOArgs');

var _checkIOArgs3 = _interopRequireDefault(_checkIOArgs2);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _ami = require('./ami');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

_commander2.default.name('ctj rdf').version(_package2.default.version).option('-l, --log-level <level>', 'amount of information to log ' + '(silent, verbose, info*, data, warn, error, or debug)', 'info').option('-p, --project <path>', 'CProject folder').option('-o, --output <path>', 'Output directory ' + '(directory will be created if it doesn\'t exist, defaults to CProject folder').option('-f, --format <format>', 'Output format', /^(turtle)$/i, 'turtle').parse(process.argv);

if (process.argv.length <= 2) {
  _commander2.default.help();
}

var logger = (0, _logger2.default)(_commander2.default);

var _checkIOArgs = (0, _checkIOArgs3.default)(_commander2.default),
    project = _checkIOArgs.project,
    output = _checkIOArgs.output;

var format = _commander2.default.format;


var extensions = {
  turtle: 'ttl'
};
var extension = extensions[format];

var ns = 'https://larsgw.github.io/ctj/rdf/#/';
var prefixes = {
  '': ns + 'hash/',
  type: ns + 'type/',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  cito: 'http://purl.org/spar/cito/',
  pmc: 'http://identifiers.org/pmcid/',
  wdt: 'http://www.wikidata.org/prop/direct/'
};

var useTypes = {
  genus: 'Genus',
  genussp: 'Genus Species',
  binomial: 'Species'
};

var maxChars = Math.max.apply(Math, _toConsumableArray(Object.keys(useTypes).map(function (a) {
  return a.length;
})));

var isUniqueHit = function isUniqueHit(thing, index, array) {
  return index === array.findIndex(function (elm) {
    return (0, _ami.getLabel)(thing) === (0, _ami.getLabel)(elm);
  });
};

logger.info('CProject To JSON (ctj) config:');
logger.info('Input directory: ' + project);
logger.info('Output directory: ' + output);
logger.info('Output format: ' + format);

process.chdir(project);

// TODO don't assume directory name is a PMCID
var directories = _fs2.default.readdirSync('.').filter(function (directory) {
  return (/PMC\d+/.test(directory)
  );
});

var parsingProgress = (0, _progress2.default)({ total: directories.length });

var rdfSubjects = {};
var defineLater = { types: {}, hits: {} };

directories.forEach(function (directory) {
  // TODO don't assume directory name is a PMCID
  var json = {
    'wdt:P932': '"' + directory.replace(/^PMC/, '') + '"',
    'cito:discusses': []
  };

  var ami = (0, _ami.getAmiResults)(directory, []).data;

  for (var type in ami) {
    if (!useTypes.hasOwnProperty(type)) {
      continue;
    }

    if (!defineLater.types[type]) {
      defineLater.types[type] = type;
    }

    var hits = ami[type].filter(isUniqueHit);

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

        json['cito:discusses'].push(':' + hitHash);
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

  parsingProgress.tick({ item: directory });
  rdfSubjects['pmc:' + directory] = json;
});

for (var type in defineLater.types) {
  rdfSubjects['type:' + type.padEnd(maxChars)] = { 'rdfs:label': '"' + useTypes[defineLater.types[type]] + '"' };
}

for (var hitHash in defineLater.hits) {
  var _defineLater$hits$hit = defineLater.hits[hitHash],
      _type = _defineLater$hits$hit.type,
      name = _defineLater$hits$hit.name;

  rdfSubjects[':' + hitHash] = { a: 'type:' + _type.padEnd(maxChars), 'rdfs:label': '"' + name + '"' };
}

logger.info('Directories parsed!');

var formattingProgress = (0, _progress2.default)({ msg: 'Formatting rdf item', total: Object.keys(rdfSubjects).length });

Promise.resolve().then(function () {
  return require('./rdf/' + format);
}).then(function (_ref) {
  var buildRdf = _ref.buildRdf;
  return buildRdf(rdfSubjects, prefixes, {
    stepCallback: function stepCallback(item) {
      formattingProgress.tick({ item: item });
    }
  });
}).then(function (rdf) {
  logger.info('Saving output...');
  logger.debug('RDF length: ' + rdf.length);

  process.chdir(output);

  // TODO output naming
  _fs2.default.writeFileSync('data.' + extension, rdf);

  logger.info('Saving output succeeded!');
});