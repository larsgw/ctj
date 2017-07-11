'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _progress = require('progress');

var _progress2 = _interopRequireDefault(_progress);

require('colors');

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _ami = require('./ami');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.name('ctj collect').version(_package2.default.version).option('-p, --project <path>', 'CProject folder').option('-o, --output <path>', 'Output directory ' + '(directory will be created if it doesn\'t exist, defaults to CProject folder').option('-g, --group-results <items>', 'group AMI results of all the papers into JSON, grouped by type.\n                           ' + 'specify types to combine, seperated by ",". Types are found in the title attribute in the root element of the results.xml file').option('-s, --save-seperately', 'save paper JSON and AMI JSON seperately').option('-M, --no-minify', 'do not minify JSON output').parse(process.argv);

console.log(_commander2.default); /*
                                  if (process.argv.length <= 2) {
                                  program.help()
                                  }
                                  const metadataFilename = 'eupmc_result.json'
                                  let {
                                  project,
                                  output,
                                  groupResults,
                                  saveSeperately,
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
                                  logger.info(`CProject To JSON (ctj) config:
                                  Input directory: ${project}
                                  Output directory: ${output}`)
                                  if (groupResults) {
                                  logger.info(`Also grouping AMI results of types: ${groupResults}`)
                                  }
                                  const directories = fs.readdirSync(project).filter(directory => /PMC\d+/.test(directory))
                                  const progressBarText = '[:bar] Parsing directory :current/:total: :directory (eta :etas)'
                                  const progressBar = new progress(progressBarText, {
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
                                  if (!outputData[group].hasOwnProperty(results)) {
                                  outputData[group][results] = []
                                  }
                                  outputData[group][results].push(...groupedData[group][results])
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
                                  if (!saveSeperately) {
                                  // TODO output naming
                                  fs.writeFileSync(path.join(output, 'data.json'), stringify(outputData))
                                  } else {
                                  for (let dataIndex in outputData) {
                                  fs.writeFileSync(path.join(output, `${dataIndex}.json`), stringify(outputData[dataIndex]))
                                  }
                                  }
                                  logger.info('Saving output succeeded!')
                                  */