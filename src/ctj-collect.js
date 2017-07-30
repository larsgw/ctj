import fs from 'fs'
import path from 'path'
import program from 'commander'
import Progress from 'progress'
import 'colors'
import logger from 'winston'

import ctj from '../package.json'
import {getAmiResults} from './ami'

program
  .name('ctj collect')
  .version(ctj.version)

  .option('-p, --project <path>',
          'CProject folder')
  .option('-o, --output <path>',
          'Output directory ' +
          '(directory will be created if it doesn\'t exist, defaults to CProject folder')

  .option('-g, --group-results <items>',
          'group AMI results of all the papers into JSON, grouped by type.\n                           ' +
          'specify types to combine, separated by ",". Types are found in the title attribute in the root element of the results.xml file')
  .option('-s, --save-separately',
          'save paper JSON and AMI JSON separately')

  .option('-M, --no-minify',
          'do not minify JSON output')

  .parse(process.argv)

if (process.argv.length <= 2) {
  program.help()
}

const metadataFilename = 'eupmc_result.json'

let {
  project,
  output,
  groupResults,
  saveSeparately,
  minify
} = program

if (!project) {
  throw new Error('No CProject directory provided')
} else if (!fs.existsSync(project)) {
  throw new Error(`CProject directory: ${project} does not exist`)
} else if (!output) {
  output = project
} else if (!fs.existsSync(output)) {
  logger.info(`Creating output directory: ${output}`)
  fs.mkdirSync(output)
}

logger.info('CProject To JSON (ctj) config:')
logger.info(`Input directory: ${project}`)
logger.info(`Output directory: ${output}`)

if (groupResults) {
  logger.info(`Also grouping AMI results of types: ${groupResults}`)
}

// TODO use CProject/sequencesfiles.xml
const directories = fs.readdirSync(project).filter(directory => /PMC\d+/.test(directory))
// BEGIN test
// .filter(dir => dir === 'PMC3841577')
// let i = 0
// END test

const progressBarText = '[:bar] Parsing directory :current/:total: :directory (eta :etas)'
const progressBar = new Progress(progressBarText, {
  complete: '='.green,
  width: 30,
  total: directories.length
})

const outputData = {}
outputData.articles = Object.assign(...directories.map(directory => {
  const metadata = JSON.parse(fs.readFileSync(path.join(project, directory, metadataFilename), 'utf8'))
  const {data: amiResults, groupedData} = getAmiResults(project, directory, groupResults)

  for (let group in groupedData) {
    if (!outputData.hasOwnProperty(group)) {
      outputData[group] = {}
    }

    for (let results in groupedData[group]) {
      // Regular
      if (Array.isArray(results)) {
        if (!outputData[group].hasOwnProperty(results)) {
          outputData[group][results] = []
        }
        outputData[group][results].push(...groupedData[group][results])

      // Regex: nested objects
      } else {
        if (!outputData[group].hasOwnProperty(results)) {
          outputData[group][results] = {}
        }
        for (let result in groupedData[group][results]) {
          if (!outputData[group][results].hasOwnProperty(result)) {
            outputData[group][results][result] = []
          }
          outputData[group][results][result].push(...groupedData[group][results][result])
        }
      }
    }
  }

  progressBar.tick({directory})
  return {[directory]: {
    metadata,
    amiResults
  }}
}))

const stringify = json => JSON.stringify(json, ...(minify ? [] : [null, 2]))

logger.info('Saving output...')

if (!saveSeparately) {
  // TODO output naming
  fs.writeFileSync(path.join(output, 'data.json'), stringify(outputData))
} else {
  for (let dataIndex in outputData) {
    fs.writeFileSync(path.join(output, `${dataIndex}.json`), stringify(outputData[dataIndex]))
  }
}

logger.info('Saving output succeeded!')
