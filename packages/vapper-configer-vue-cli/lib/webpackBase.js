const webpackConfig = require('@vapper/webpack-config')

module.exports = (api) => {
  return {
    id: 'vue-cli-plugin-vapper-webpack-base',
    apply: (vueCliapi) => {
      vueCliapi.chainWebpack(config => {
        webpackConfig.base(api, config)

        config
          .plugin('PrintStatusPlugin')
          .use(require('./PrintStatusPlugin'), [
            {
              printFileStats: true,
              logger: api.logger
            }
          ])

        config
          .plugin('friendly-errors')
          .init((Plugin, args) => new Plugin({ ...args, clearConsole: false }))
      })
    }
  }
}
