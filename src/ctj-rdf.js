import 'babel-polyfill'
import fs from 'fs'
import path from 'path'
import program from 'commander'
import logger from 'winston'
import makeBar from './util/progress'
import md5 from 'md5'

import checkIOArgs from './util/checkIOArgs'

import ctj from '../package.json'
import {getAmiResults, getLabel} from './ami'

// BEGIN CONSTANT consts
const ns = 'https://larsgw.github.io/ctj/rdf/#/'
const prefixes = {
  '': `${ns}hash/`,
  type: `${ns}type/`,
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  cito: 'http://purl.org/spar/cito/',
  pmc: 'http://identifiers.org/pmcid/'
}

const useTypes = {
  genus: 'Genus',
  genussp: 'Genus Species',
  binomial: 'Species'
}

const maxChars = Math.max(...Object.keys(useTypes).map(a => a.length))
// END

program
  .name('ctj rdf')
  .version(ctj.version)

  .option('-p, --project <path>',
          'CProject folder')
  .option('-o, --output <path>',
          'Output directory ' +
          '(directory will be created if it doesn\'t exist, defaults to CProject folder')

  .parse(process.argv)

if (process.argv.length <= 2) {
  program.help()
}

const {project, output} = checkIOArgs(program)

const isUniqueHit = (thing, index, array) => array.findIndex(elm => getLabel(thing) === getLabel(elm)) === index

logger.info('CProject To JSON (ctj) config:')
logger.info(`Input directory: ${project}`)
logger.info(`Output directory: ${output}`)

// TODO don't assume directory name is a PMCID
const directories = fs.readdirSync(project).filter(directory => /PMC\d+/.test(directory))
const progressBar = makeBar({total: directories.length})

let rdf = Object.keys(prefixes).map(prefix => `@prefix ${prefix}: <${prefixes[prefix]}> .` + '\n').join('') + '\n'
const defineLater = {types: {}, hits: {}}

directories.forEach(directory => {
  const ami = getAmiResults(project, directory, []).data

  for (let type in ami) {
    if (!useTypes.hasOwnProperty(type)) {
      continue
    }

    if (!defineLater.types[type]) {
      defineLater.types[type] = type
    }

    // TODO don't assume directory name is a PMCID
    rdf += `pmc:${directory} cito:discusses` + '\n'

    const hits = ami[type].filter(isUniqueHit)
    const lastHit = hits.slice(-1)[0]

    for (let hit of hits) {
      const name = getLabel(hit)
      const hitHash = md5(`${type}|${name}`)

      if (!defineLater.hits[hitHash]) {
        defineLater.hits[hitHash] = {type, name}
      }

      const suffix = hit === lastHit ? ' .\n' : ' ,'
      rdf += `  :${hitHash}${suffix}` + '\n'
    }
  }

  progressBar.tick({directory})
})

for (let type in defineLater.types) {
  rdf += `type:${type} rdfs:label "${useTypes[defineLater.types[type]]}" .
`
}

rdf += '\n'

for (let hitHash in defineLater.hits) {
  const {type, name} = defineLater.hits[hitHash]
  rdf += `:${hitHash} a type:${type.padEnd(maxChars)} ; rdfs:label "${name}" .
`
}

logger.info('Saving output...')

// TODO output naming
fs.writeFileSync(path.join(output, 'data.ttl'), rdf)

logger.info('Saving output succeeded!')
