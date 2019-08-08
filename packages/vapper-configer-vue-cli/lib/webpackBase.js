const webpack = require('webpack')
const ProgressBar = require('./ProgressBar')
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
          .plugin('Progress')
          .use(webpack.ProgressPlugin, [
            {
              handler: new ProgressBar().handler
            }
          ])
      })
    }
  }
}
