import 'babel-polyfill'
import fs from 'fs'
import path from 'path'
import program from 'commander'
import setupLogger from './util/logger'
import makeBar from './util/progress'
import md5 from 'md5'

import checkIOArgs from './util/checkIOArgs'

import ctj from '../package.json'
import {getAmiResults, getLabel} from './ami'

program
  .name('ctj rdf')
  .version(ctj.version)

  .option('-l, --log-level <level>', 'amount of information to log ' +
    '(silent, verbose, info*, data, warn, error, or debug)',
    'info')

  .option('-p, --project <path>',
          'CProject folder')
  .option('-o, --output <path>',
          'Output directory ' +
          '(directory will be created if it doesn\'t exist, defaults to CProject folder')

  .parse(process.argv)

if (process.argv.length <= 2) {
  program.help()
}

const logger = setupLogger(program)

const ns = 'https://larsgw.github.io/ctj/rdf/#/'
const prefixes = {
  '': `${ns}hash/`,
  type: `${ns}type/`,
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  cito: 'http://purl.org/spar/cito/',
  pmc: 'http://identifiers.org/pmcid/',
  wdt: 'http://www.wikidata.org/prop/direct/'
}

const useTypes = {
  genus: 'Genus',
  genussp: 'Genus Species',
  binomial: 'Species'
}

const maxChars = Math.max(...Object.keys(useTypes).map(a => a.length))

const {project, output} = checkIOArgs(program)

const isUniqueHit = (thing, index, array) => array.findIndex(elm => getLabel(thing) === getLabel(elm)) === index

logger.info('CProject To JSON (ctj) config:')
logger.info(`Input directory: ${project}`)
logger.info(`Output directory: ${output}`)

// TODO don't assume directory name is a PMCID
const directories = fs.readdirSync(project).filter(directory => /PMC\d+/.test(directory))

// TODO `import()`
// TODO dynamic type
const {buildRdf} = require('./rdf/turtle')

// TODO
const parsingProgress = makeBar({total: directories.length})

const rdfSubjects = {}
const defineLater = {types: {}, hits: {}}

directories.forEach(directory => {
  // TODO don't assume directory name is a PMCID
  const json = {
    'wdt:P932': `"${directory.replace(/^PMC/, '')}"`,
    'cito:discusses': []
  }

  const ami = getAmiResults(project, directory, []).data

  for (let type in ami) {
    if (!useTypes.hasOwnProperty(type)) {
      continue
    }

    if (!defineLater.types[type]) {
      defineLater.types[type] = type
    }

    const hits = ami[type].filter(isUniqueHit)

    for (let hit of hits) {
      const name = getLabel(hit)
      const hitHash = md5(`${type}|${name}`)

      if (!defineLater.hits[hitHash]) {
        defineLater.hits[hitHash] = {type, name}
      }

      json['cito:discusses'].push(`:${hitHash}`)
    }
  }

  parsingProgress.tick({item: directory})
  rdfSubjects[`pmc:${directory}`] = json
})

for (let type in defineLater.types) {
  rdfSubjects[`type:${type.padEnd(maxChars)}`] = {'rdfs:label': `"${useTypes[defineLater.types[type]]}"`}
}

for (let hitHash in defineLater.hits) {
  const {type, name} = defineLater.hits[hitHash]
  rdfSubjects[`:${hitHash}`] = {a: `type:${type.padEnd(maxChars)}`, 'rdfs:label': `"${name}"`}
}

logger.info('Directories parsed!')

const formattingProgress = makeBar({msg: 'Formatting rdf item', total: Object.keys(rdfSubjects).length})
const rdf = buildRdf(rdfSubjects, prefixes, {stepCallback (item) { formattingProgress.tick({item}) }})

logger.info('Saving output...')

// TODO output naming
fs.writeFileSync(path.join(output, 'data.ttl'), rdf)

logger.info('Saving output succeeded!')
