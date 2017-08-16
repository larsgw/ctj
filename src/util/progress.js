import Progress from 'progress'
import 'colors'

const makeBar = function ({
  total,
  width = 30,
  curr = 0,
  complete = '='.green,
  head = complete,
  incomplete = ' ',
  text = '[:bar] Parsing directory :current/:total: :directory (eta :etas)',

  renderThrottle,
  clear,
  stream,
  callback
} = {}) {
  return new Progress(text, {
    total,
    width,
    curr,
    complete,
    head,
    incomplete,
    text,
    renderThrottle,
    clear,
    stream,
    callback
  })
}

export default makeBar
