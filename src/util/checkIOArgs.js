import fs from 'fs'
import logger from 'winston'

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
  return {project, output}
}
