
const webpackConfig = require('@homo/webpack-config')

module.exports = (api) => {
  const isProd = api.options.mode === 'production'

  return {
    id: 'vue-cli-plugin-homo-webpack-client',
    apply: (vueCliapi) => {
      vueCliapi.chainWebpack(config => {
        webpackConfig.client(api, config)

        config
          .entry('index')
          .delete()

        config
          .entry('app')
          .clear()
          .when(!isProd, entry => entry.add(require.resolve('webpack-hot-middleware/client')))
          .add(api.resolveCore('app/clientEntry.js'))
      })
    }
  }
}
