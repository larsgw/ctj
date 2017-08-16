#!/usr/bin/env node

import program from 'commander'
import ctj from '../package.json'

program
  .name('ctj')
  .version(ctj.version)
  .command('collect [options]', 'Collect AMI results into one or several JSON files')
  .command('rdf [options]', 'Collect AMI results into a RDF file')
  .parse(process.argv)

if (!process.argv) {
  program.help()
}
