
const webpackConfig = require('@vapper/webpack-config')

module.exports = (api) => {
  return {
    id: 'vue-cli-plugin-vapper-webpack-server',
    apply: (vueCliapi) => {
      vueCliapi.chainWebpack(config => {
        webpackConfig.server(api, config)

        config
          .entryPoints
          .delete('index')

        config
          .entry('app')
          .clear()
          .add(api.resolveCore('app/serverEntry.js'))
      })
    }
  }
}
