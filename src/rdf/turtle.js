const buildPrefixes = prefixes =>
  Object.keys(prefixes).map(prefix => `@prefix ${prefix}: <${prefixes[prefix]}> .`).join('\n')

const buildSubject = function (subject, props) {
  let rdf = `${subject} `

  rdf += Object.keys(props).map(prop => `${prop} ${[].concat(props[prop]).join(' ,\n  ')}`).join(' ;\n  ')

  return rdf
}

const buildRdf = function (subjects, prefixes, {stepCallback = () => {}, successCallback = () => {}}) {
  let rdf = buildPrefixes(prefixes) + '\n\n'

  rdf += Object.keys(subjects).map(subject => {
    const data = subjects[subject]
    const rdf = buildSubject(subject, data)

    stepCallback(subject)

    return rdf
  }).join(' .\n\n') + ' .'

  successCallback(rdf)

  return rdf
}

export {buildPrefixes, buildSubject, buildRdf}
