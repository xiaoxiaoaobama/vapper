/**
 * Copy from https://github.com/egoist/poi/blob/master/core/poi/lib/webpack/PrintStatusPlugin.js
 */

const path = require('path')
const chalk = require('chalk')
const textTable = require('text-table')
const gzipSize = require('gzip-size')
const prettyBytes = require('./prettyBytes')
const prettyTime = require('pretty-ms')

class PrintStatusPlugin {
  constructor (opts = {}) {
    this.opts = opts
    this.logger = opts.logger
  }

  apply (compiler) {
    compiler.hooks.done.tapPromise('print-status', async stats => {
      if (this.opts.clearConsole !== false && process.env.NODE_ENV !== 'test') {
        // process.stdout.write('\u001Bc')
      }
      if (!stats.hasErrors() && !stats.hasWarnings()) {
        if (this.opts.printSucessMessage) {
          this.logger.info(
            `Build completed in ${prettyTime(stats.endTime - stats.startTime)}`
          )
        }
        // Print file stats
        if (
          (this.opts.printFileStats || this.logger.options.debug) &&
          !process.env.CI &&
          process.stdout.isTTY
        ) {
          const assets = await Promise.all(
            stats.toJson().assets.map(async asset => {
              asset.gzipped = await gzipSize(
                stats.compilation.assets[asset.name].source()
              )
              return asset
            })
          )
          const data = assets.map(asset => {
            const filename = path.relative(
              process.cwd(),
              path.join(compiler.options.output.path, asset.name)
            )
            return [
              path.join(
                path.dirname(filename),
                chalk.bold(path.basename(filename))
              ),
              chalk.green(prettyBytes(asset.size)),
              chalk.green(prettyBytes(asset.gzipped))
            ]
          })
          data.unshift([
            chalk.bold('file'),
            chalk.bold('size'),
            chalk.bold('gzipped')
          ])
          data.push([
            '(total)',
            chalk.green(
              prettyBytes(
                assets.reduce((result, asset) => result + asset.size, 0)
              )
            ),
            chalk.green(
              prettyBytes(
                assets.reduce((result, asset) => result + asset.gzipped, 0)
              )
            )
          ])
          this.logger.log(
            textTable(data, {
              stringLength: require('string-width')
            })
          )
        }
      }
    })
  }
}

module.exports = PrintStatusPlugin
