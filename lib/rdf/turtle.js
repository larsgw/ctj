'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var buildPrefixes = function buildPrefixes(prefixes) {
  return Object.keys(prefixes).map(function (prefix) {
    return '@prefix ' + prefix + ': <' + prefixes[prefix] + '> .';
  }).join('\n');
};

var buildSubject = function buildSubject(subject, props) {
  var rdf = subject + ' ';

  rdf += Object.keys(props).map(function (prop) {
    return prop + ' ' + [].concat(props[prop]).join(' ,\n  ');
  }).join(' ;\n  ');

  return rdf;
};

var buildRdf = function buildRdf(subjects, prefixes, _ref) {
  var _ref$stepCallback = _ref.stepCallback,
      stepCallback = _ref$stepCallback === undefined ? function () {} : _ref$stepCallback,
      _ref$successCallback = _ref.successCallback,
      successCallback = _ref$successCallback === undefined ? function () {} : _ref$successCallback;

  var rdf = buildPrefixes(prefixes) + '\n\n';

  rdf += Object.keys(subjects).map(function (subject) {
    var data = subjects[subject];
    var rdf = buildSubject(subject, data);

    stepCallback(subject);

    return rdf;
  }).join(' .\n\n') + ' .';

  successCallback(rdf);

  return rdf;
};

exports.buildPrefixes = buildPrefixes;
exports.buildSubject = buildSubject;
exports.buildRdf = buildRdf;