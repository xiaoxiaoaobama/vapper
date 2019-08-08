const chalk = require('chalk')
const logUpdate = require('log-update')

module.exports = class ProgressBar {
  constructor ({
    count = 40
  } = {}) {
    this.count = count
    this.handler = this.handler.bind(this)
  }

  handler (percentage) {
    if (percentage === 1) return
    const c = Math.ceil(percentage * this.count)
    const pre = chalk.bgGreen(' '.repeat(c))
    const end = chalk.bgWhite(' '.repeat(this.count - c))
    logUpdate(pre + end)
  }
}
