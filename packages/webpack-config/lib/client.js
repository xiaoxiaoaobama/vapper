
const webpack = require('webpack')

module.exports = (api, config) => {
  const isProd = api.options.mode === 'production'

  config
    .entry('index')
    .clear()
    .when(!isProd, entry => entry.add(require.resolve('webpack-hot-middleware/client')))
    .add(api.resolveCore('app/clientEntry.js'))

  config.output
    .publicPath('/_vapper_/')

  config
    .plugin('VueSSRClientPlugin')
    .use(require('vue-server-renderer/client-plugin'), [{
      filename: api.options.clientManifestFileName
    }])

  config
    .plugin('webpackbar')
    .use(require('webpackbar'), [{
      name: 'Client',
      color: 'green'
    }])

  if (!isProd) {
    config
      .plugin('hmr').use(webpack.HotModuleReplacementPlugin)
  }
}
