const path = require('path')
const fs = require('fs')

class PluginApi {
  constructor () {
    // path
    this.cwd = process.cwd()
    this.corePath = path.resolve(__dirname, '../')

    // server middlewares
    this.middlewares = new Set()

    this.hooks = new Map()
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

  loadDependencies (re) {
    const pkg = require(this.resolveCWD('package.json'))

    return Object.keys(pkg.devDependencies || {})
      .concat(Object.keys(pkg.dependencies || {}))
      .filter(id => re.test(id))
  }

  loadConfig () {
    const p = this.resolveCWD('homo.config.js')

    try {
      const configFileStat = fs.statSync(p)
      if (configFileStat.isFile) {
        return require(p)
      }
      return null
    } catch (e) {
      return null
    }
  }

  validateOptions (schema, options) {
    return schema.validate(options)
  }

  use (fn) {
    this.middlewares.add(fn)
  }

  getRouteMeta (location) {
    if (!this.router) return null
    const res = this.router.resolve(location)
    if (!res.resolved.matched.length) return null
    return res.resolved.meta
  }

  hookInto (name, fn) {
    const has = this.hooks.has(name)
    if (!has) this.hooks.set(name, new Set())
    const hooks = this.hooks.get(name)
    hooks.add(fn)
  }

  invokeHook (name, ...args) {
    const has = this.hooks.has(name)
    if (!has) return
    const hooks = this.hooks.get(name)
    for (const h of hooks) {
      h(...args)
    }
  }
}

module.exports = PluginApi
