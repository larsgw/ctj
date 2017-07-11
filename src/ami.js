import fs from 'fs'
import path from 'path'
import {XmlDocument} from 'xmldoc'

const sequencesFilename = 'sequencesfiles.xml'

const getXmlFile = function (fileName, encoding = 'utf8') {
  return new XmlDocument(fs.readFileSync(fileName, encoding))
}

const getResultFiles = function (project, directory) {
  const sequenceFile = path.join(project, directory, sequencesFilename)

  if (!fs.existsSync(sequenceFile)) {
    return []
  }

  return getXmlFile(sequenceFile).children.map(({attr: {name}}) => name)
}

const getAmiResults = function (project, directory, groupResults) {
  const files = getResultFiles(project, directory)
  const data = {}
  const groupedData = {}

  files.forEach(fileName => {
    const {children, attr: {title: resultType}} = getXmlFile(fileName)
    const results = children.map(({attr}) => attr)
    data[resultType] = results

    if (groupResults.includes(resultType)) {
      results.forEach(result => {
        if (!groupedData.hasOwnProperty(resultType)) {
          groupedData[resultType] = {}
        }

        const prop = result.match || result.word || result.exact

        if (!groupedData[resultType].hasOwnProperty(prop)) {
          groupedData[resultType][prop] = []
        }

        result.pmc = directory
        groupedData[resultType][prop].push(result)
      })
    }
  })

  return {data, groupedData}
}

export {getResultFiles, getAmiResults}
