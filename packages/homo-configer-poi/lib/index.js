const Poi = require('poi')
const webpackBaseConfig = require('./webpackBase')
const webpackClientConfig = require('./webpackClient')
const webpackServerConfig = require('./webpackServer')

module.exports = class Configer {
  constructor (api) {
    const { options } = api

    this.api = api

    this.poi = new Poi()
    this.poi.mode = this.mode = options.mode
  }

  getServerConfig () {
    const config = this.poi.createWebpackChain({ mode: this.mode })
    webpackBaseConfig(this.api, config)
    webpackServerConfig(this.api, config)
    return config.toConfig()
  }

  getClientConfig () {
    const config = this.poi.createWebpackChain({ mode: this.mode })
    webpackBaseConfig(this.api, config)
    webpackClientConfig(this.api, config)
    return config.toConfig()
  }
}
