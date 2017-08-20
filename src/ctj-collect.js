import fs from 'fs'
import path from 'path'
import program from 'commander'
import setupLogger from './util/logger'
import makeBar from './util/progress'

import checkIOArgs from './util/checkIOArgs'

import ctj from '../package.json'
import {getAmiResults} from './ami'

program
  .name('ctj collect')
  .version(ctj.version)

  .option('-l, --log-level <level>', 'amount of information to log ' +
    '(silent, verbose, info*, data, warn, error, or debug)',
    'info')

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

const logger = setupLogger(program)

const metadataFilename = 'eupmc_result.json'

const {project, output} = checkIOArgs(program)
const {
  groupResults,
  saveSeparately,
  minify
} = program

logger.info('CProject To JSON (ctj) config:')
logger.info(`Input directory: ${project}`)
logger.info(`Output directory: ${output}`)

if (groupResults) {
  logger.info(`Also grouping AMI results of types: ${groupResults}`)
}

process.chdir(project)

// TODO use CProject/sequencesfiles.xml
const directories = fs.readdirSync('.').filter(directory => /PMC\d+/.test(directory))
// BEGIN test
// .filter(dir => dir === 'PMC3841577')
// let i = 0
// END test

const progressBar = makeBar({total: directories.length})

const outputData = {}
outputData.articles = Object.assign(...directories.map(directory => {
  const metadata = JSON.parse(fs.readFileSync(path.join(directory, metadataFilename), 'utf8'))
  const {data: amiResults, groupedData} = getAmiResults(directory, groupResults)

  for (let group in groupedData) {
    if (!outputData.hasOwnProperty(group)) {
      outputData[group] = {}
    }

    for (let results in groupedData[group]) {
      // Regular
      if (Array.isArray(groupedData[group][results])) {
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

process.chdir(output)

if (!saveSeparately) {
  // TODO output naming
  fs.writeFileSync('data.json', stringify(outputData))
} else {
  for (let dataIndex in outputData) {
    fs.writeFileSync(`${dataIndex}.json`, stringify(outputData[dataIndex]))
  }
}

logger.info('Saving output succeeded!')
