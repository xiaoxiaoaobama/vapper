const Poi = require('poi')
const webpackConfig = require('@homo/webpack-config')

module.exports = class Configer {
  constructor (api) {
    const { options } = api

    this.api = api

    this.poi = new Poi()
    this.poi.mode = this.mode = options.mode
  }

  getServerConfig () {
    const config = this.poi.createWebpackChain({ mode: this.mode })
    webpackConfig.base(this.api, config)
    webpackConfig.server(this.api, config)
    return config.toConfig()
  }

  getClientConfig () {
    const config = this.poi.createWebpackChain({ mode: this.mode })
    webpackConfig.base(this.api, config)
    webpackConfig.client(this.api, config)
    return config.toConfig()
  }
}
