
const webpackConfig = require('@homo/webpack-config')

module.exports = (api) => {
  return {
    id: 'vue-cli-plugin-homo-webpack-server',
    apply: (vueCliapi) => {
      vueCliapi.chainWebpack(config => {
        webpackConfig.server(api, config)

        config
          .entry('index')
          .delete()

        config
          .entry('app')
          .clear()
          .add(api.resolveCore('app/serverEntry.js'))
      })
    }
  }
}
