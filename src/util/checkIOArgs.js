import fs from 'fs'
import path from 'path'
import logger from 'winston'

const cwd = process.cwd()

export default function checkIOArgs ({project, output}) {
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

  project = path.resolve(cwd, project)
  output = path.resolve(cwd, output)
  return {project, output}
}
