import logger from 'winston'

const colors = {
  silly: 'magenta',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  debug: 'blue',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  error: 'red'
}

const levels = {
  silly: 0,
  input: 1,
  verbose: 2,
  prompt: 3,
  debug: 4,
  data: 5,
  info: 6,
  help: 7,
  warn: 8,
  error: 9
}

const allowedlevels = Object.keys(levels)

const setupLogger = ({logLevel: level}) => {
  if (allowedlevels.indexOf(level) === -1) {
    throw new Error('--log-level must be one of: ' +
      'quiet, verbose, data, info, warn, error, debug')
  }

  logger.addColors(colors)

  logger.remove(logger.transports.Console)
  logger.add(logger.transports.Console, {level, levels, colorize: true})

  return logger
}

export default setupLogger
