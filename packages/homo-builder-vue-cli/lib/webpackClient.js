
const webpack = require('webpack')

module.exports = (api) => {
  const isProd = api.options.mode === 'production'
  const fileName = isProd ? '[name].[hash:8]' : '[name]'

  return {
    id: 'vue-cli-plugin-homo-webpack-client',
    apply: (vueCliapi) => {
      vueCliapi.chainWebpack(config => {
        config
          .entry('app')
          .clear()
          .when(!isProd, entry => entry.add(require.resolve('webpack-hot-middleware/client')))
          .add(api.resolveCore('app/clientEntry.js'))

        config.output
          .publicPath('/_homo_/')
          .filename(`client/${fileName}.js`)
          .chunkFilename(`client/${fileName}.js`)

        config
          .plugin('VueSSRClientPlugin')
          .use(require('vue-server-renderer/client-plugin'), [{
            filename: 'client/vue-ssr-client-manifest.json'
          }])

        if (!isProd) {
          config
            .plugin('hmr').use(webpack.HotModuleReplacementPlugin)
        }

        config.plugin('constants')
          .tap(args => {
            return [
              {
                ...args,
                'process.server': false,
                'process.client': true,
                __DEV__: !this.isProd
                // __PUBLIC_PATH__: JSON.stringify(publicPath)
              }
            ]
          })

        config
          .plugin('html')
          .tap(args => {
            args[0].filename = 'index.spa.html'
            return args
          })
      })
    }
  }
}
