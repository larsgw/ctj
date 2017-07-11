'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _progress = require('progress');

var _progress2 = _interopRequireDefault(_progress);

require('colors');

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.name('ctj').version(_package2.default.version).command('collect [options]', 'Collect AMI results into one or several JSON files')

/*.option('-p, --project <path>',
        'CProject folder')
.option('-o, --output <path>',
        'Output directory ' +
        '(directory will be created if it doesn\'t exist, defaults to CProject folder')
 .option('-c, --combine-ami <items>',
        'combine AMI results of all the papers into JSON, grouped by type.\n                           '+
        'specify types to combine, seperated by ",". Types are found in the title attribute in the root element of the results.xml file',
        getColumns,
        [])
.option('-s, --save-seperately',
        'save paper JSON and AMI JSON seperately')
 .option('-M, --no-minify',
        'do not minify JSON output')*/

.parse(process.argv);

if (!process.argv.length > 2) {
  _commander2.default.help();
}

console.log(_commander2.default);

/*let {
  project,
  output,
  combineAmi: dataTypes,
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

logger.log(`CProject To JSON (ctj) config:
Input directory: ${project}
Output directory: ${output}

Combining AMI results of types: ${dataTypes}`)

const directories = fs.readdirSync(project).filter(directory => /PMC\d+/.test(directory))

const progressBarText = '[:bar] Parsing directory :current/:total: :directory (eta :etas)'
const progressBar = new progress(progressBarText, {
  complete: '='.green,
  width: 30,
  total: directories.length
})

const outputJson = 

const outputData = 

logger.info( 'Saving output...' )

if (!saveSeperately) {
  fs.writeFileSync(path.join(output, 'data.json'), outputData)
} else {
  for (let dataIndex in outputData) {
    fs.writeFileSync(path.join(output, `${dataIndex}.json`), outputData[dataIndex])
  }
}

logger.info('Saving output succeeded!')*/