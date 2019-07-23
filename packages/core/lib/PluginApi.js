const path = require('path')

class PluginApi {
  constructor () {
    this.cwd = process.cwd()
    this.corePath = path.resolve(__dirname, '../')
  }

  /**
   * Resolve the directory from the `packages/core`
   * @param  {...any} args - paths
   */
  resolveCore (...args) {
    return path.resolve(this.corePath, ...args)
  }

  /**
   * Resolve the directory from CWD
   * @param  {...any} args - paths
   */
  resolveCWD (...args) {
    return path.resolve(this.cwd, ...args)
  }
}

module.exports = PluginApi
