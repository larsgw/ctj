import fs from 'fs'
import path from 'path'
import {XmlDocument} from 'xmldoc'

const sequencesFilename = 'sequencesfiles.xml'

const getXmlFile = (fileName, encoding = 'utf8') => new XmlDocument(fs.readFileSync(fileName, encoding))
const isNotTextNode = node => !node.text
const getLabel = ({match, word, exact}) => match || word || exact

const getResultFiles = function (directory) {
  const sequenceFile = path.join(directory, sequencesFilename)

  if (!fs.existsSync(sequenceFile)) {
    return []
  }

  return getXmlFile(sequenceFile).children.filter(isNotTextNode).map(({attr: {name}}) => name)
}

const getAmiResults = function (directory, groupResults) {
  const files = getResultFiles(directory)
  const data = {}
  const groupedData = {}

  files.forEach(fileName => {
    const {children, attr: {title: resultType}} = getXmlFile(fileName)
    const results = children.filter(isNotTextNode).map(({attr}) => attr)
    data[resultType] = results

    // Group AMI results
    if (groupResults.includes(resultType)) {
      results.forEach(result => {
        if (!groupedData.hasOwnProperty(resultType)) {
          groupedData[resultType] = {}
        }
        result.pmc = directory

        const prop = getLabel(result)

        // If not regex, make list with hits
        if (prop) {
          // Init list
          if (!groupedData[resultType].hasOwnProperty(prop)) {
            groupedData[resultType][prop] = []
          }

          // Add hit
          groupedData[resultType][prop].push(result)

        // If regex, make set of lists with hits
        } else {
          const nameProp = Object.keys(result).find(key => /^name\d+$/.test(key))
          const name = result[nameProp]
          const matchProp = nameProp.replace(/^name/, 'value')
          const match = result[matchProp]

          // Init set
          if (!groupedData[resultType].hasOwnProperty(name)) {
            groupedData[resultType][name] = {}
          }

          // Init list
          if (!groupedData[resultType][name].hasOwnProperty(match)) {
            groupedData[resultType][name][match] = []
          }

          // Add hit
          groupedData[resultType][name][match].push(result)
        }
      })
    }
  })

  return {data, groupedData}
}

export {getLabel, getResultFiles, getAmiResults}
