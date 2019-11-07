const chalk = require('chalk')

/**
 * logLevel:
 * logLevel === 0 ----> silent.....
 * logLevel === 1 ----> error
 * logLevel === 2 ----> error/warn
 * logLevel === 3 ----> error/warn/debug
 * logLevel === 4 ----> error/warn/debug/tip
 * logLevel === 5 ----> error/warn/debug/tip/info
 * default: 5
 */
class Logger {
  constructor (logLevel = 5) {
    this.setLogLevel(logLevel)
  }

  setLogLevel (logLevel) {
    if (typeof logLevel !== 'number') {
      console.error('logLevel must be a number')
      return
    }
    if (process.env.NODE_ENV === 'unittest' || process.env.VAPPER_ENV === 'unittest') {
      // In the test environment, forced silence.
      this.logLevel = 0
    } else {
      this.logLevel = logLevel
    }
  }

  log (...args) {
    console.log(
      ...args.map(arg => {
        return typeof arg === 'function' ? arg() : arg
      })
    )
  }

  error (...args) {
    if (this.logLevel < 1) return
    this.log(chalk.red('error'), ...args)
    process.exitCode = process.exitCode || 1
  }

  warn (...args) {
    if (this.logLevel < 2) return
    this.log(chalk.yellow('warning'), ...args)
    process.exitCode = process.exitCode || 1
  }

  debug (...args) {
    if (this.logLevel < 3) return
    this.log(chalk.magenta('debug'), ...args)
  }

  tip (...args) {
    if (this.logLevel < 4) return
    this.log(chalk.cyan('tip'), ...args)
  }

  info (...args) {
    if (this.logLevel < 5) {
      return
    }
    this.log(chalk.green('info'), ...args)
  }
}

module.exports = Logger
