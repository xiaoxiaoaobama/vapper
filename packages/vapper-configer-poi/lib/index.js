const Poi = require('poi')
const webpackConfig = require('@vapper/webpack-config')

module.exports = class Configer {
  constructor (api) {
    this.api = api
    this.poi = new Poi()
    this.poi.mode = this.mode = this.api.options.mode
  }

  getBaseConfig () {
    const config = this.poi.createWebpackChain({ mode: this.mode })
    webpackConfig.base(this.api, config)
    const envObject = {
      'process.server': process.env.VAPPER_TARGET === 'server',
      'process.browser': process.env.VAPPER_TARGET === 'client',
      'process.client': process.env.VAPPER_TARGET === 'client',
      'process.env.VAPPER_TARGET': JSON.stringify(process.env.VAPPER_TARGET),
      'process.env.VAPPER_ENV': JSON.stringify(process.env.VAPPER_ENV)
    }

    for (const key in this.api.ENV_OBJECT) {
      envObject[`process.env.${key}`] = JSON.stringify(this.api.ENV_OBJECT[key])
    }

    config.plugin('constants').tap(([options]) => [
      Object.assign({}, options, envObject)
    ])

    // Should transpile vapper related code
    config.module.rule('js').test([/\.m?js$/, /\.jsx$/, /\.ts$/, /\.tsx$/])
      .include.add(/@vapper/)

    return config
  }

  getServerConfig () {
    const config = this.getBaseConfig()
    webpackConfig.server(this.api, config)
    return config.toConfig()
  }

  getClientConfig () {
    const config = this.getBaseConfig()
    webpackConfig.client(this.api, config)
    return config.toConfig()
  }
}
