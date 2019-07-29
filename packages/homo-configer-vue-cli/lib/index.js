const Service = require('@vue/cli-service')

module.exports = class Configer {
  constructor (api) {
    const { options } = api

    this.api = api
    this.mode = options.mode || process.env.VUE_CLI_MODE || process.env.NODE_ENV
  }

  getServerConfig (inspect) {
    const service = this.createService('server')
    service.init(this.mode)

    if (inspect) service.run('inspect')

    return service.resolveWebpackConfig()
  }

  getClientConfig (inspect) {
    const service = this.createService('client')
    service.init(this.mode)

    if (inspect) service.run('inspect')

    return service.resolveWebpackConfig()
  }

  createService (type) {
    return new Service(
      process.env.VUE_CLI_CONTEXT || process.cwd(),
      {
        plugins: require('./projectPlugins')(this.api)
          .concat([
            require('./webpackBase')(this.api),
            type === 'client'
              ? require('./webpackClient')(this.api)
              : require('./webpackServer')(this.api)
          ])
      }
    )
  }
}
