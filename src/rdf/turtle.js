const empty = val => Array.isArray(val) && val.length === 0

const build = (object, map, join) => Object.keys(object)
  .map(prop => map(prop, object[prop]))
  .filter(Boolean).join(join)

const buildPrefixes = prefixes => build(prefixes, (name, uri) => `@prefix ${name}: <${uri}> .`, '\n')

const buildSubject = (subject, props) => !Object.keys(props).length
  ? ''
  : `${subject} ` +
    build(props, (prop, val) => empty(val) ? '' : `${prop} ${[].concat(val).join(' ,\n  ')}`, ' ;\n  ')

const buildRdf = function (subjects, prefixes, {stepCallback = () => {}, successCallback = () => {}}) {
  const prefixRdf = buildPrefixes(prefixes)
  const subjectRdf = build(subjects, subject => {
    const rdf = buildSubject(subject, subjects[subject])

    stepCallback(subject)

    return rdf
  }, ' .\n\n')

  const rdf = `${prefixRdf}

${subjectRdf} .`

  successCallback(rdf)

  return rdf
}

export {buildPrefixes, buildSubject, buildRdf}
