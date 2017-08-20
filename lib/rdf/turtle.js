'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var empty = function empty(val) {
  return Array.isArray(val) && val.length === 0;
};

var build = function build(object, map, join) {
  return Object.keys(object).map(function (prop) {
    return map(prop, object[prop]);
  }).filter(Boolean).join(join);
};

var buildPrefixes = function buildPrefixes(prefixes) {
  return build(prefixes, function (name, uri) {
    return '@prefix ' + name + ': <' + uri + '> .';
  }, '\n');
};

var buildSubject = function buildSubject(subject, props) {
  return !Object.keys(props).length ? '' : subject + ' ' + build(props, function (prop, val) {
    return empty(val) ? '' : prop + ' ' + [].concat(val).join(' ,\n  ');
  }, ' ;\n  ');
};

var buildRdf = function buildRdf(subjects, prefixes, _ref) {
  var _ref$stepCallback = _ref.stepCallback,
      stepCallback = _ref$stepCallback === undefined ? function () {} : _ref$stepCallback,
      _ref$successCallback = _ref.successCallback,
      successCallback = _ref$successCallback === undefined ? function () {} : _ref$successCallback;

  var prefixRdf = buildPrefixes(prefixes);
  var subjectRdf = build(subjects, function (subject) {
    var rdf = buildSubject(subject, subjects[subject]);

    stepCallback(subject);

    return rdf;
  }, ' .\n\n');

  var rdf = prefixRdf + '\n\n' + subjectRdf + ' .';

  successCallback(rdf);

  return rdf;
};

exports.buildPrefixes = buildPrefixes;
exports.buildSubject = buildSubject;
exports.buildRdf = buildRdf;