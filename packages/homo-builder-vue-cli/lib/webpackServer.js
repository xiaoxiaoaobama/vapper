
const ServerMiniCssExtractPlugin = require('./ServerMiniCssExtractPlugin')

module.exports = (api) => {
  return {
    id: 'vue-cli-plugin-homo-webpack-server',
    apply: (vueCliapi) => {
      vueCliapi.chainWebpack(config => {
        config
          .entry('app')
          .clear()
          .add(api.resolveCore('app/serverEntry.js'))

        config.target('node')

        config.output
          .delete('filename')
          .delete('publicPath')
          .libraryTarget('commonjs2')

        config.externals({
          whitelist: /\.css$/
        })

        config
          .plugin('VueSSRServerPlugin')
          .use(require('vue-server-renderer/server-plugin'), [{
            filename: api.options.serverBundleFileName
          }])

        config.plugin('constants')
          .tap(args => {
            return [
              {
                ...args,
                'process.server': true,
                'process.client': false,
                __DEV__: !this.isProd
                // __PUBLIC_PATH__: JSON.stringify(publicPath)
              }
            ]
          })

        // Fix mini-css-extract-plugin error on server:
        // https://github.com/Akryum/vue-cli-plugin-ssr/commit/806418e35d3949686777734a3ecd35e3d8bafc2c#diff-dcad1e1d8aa8e615b1ac7e7d74d54282
        const langs = ['css', 'postcss', 'scss', 'sass', 'less', 'stylus']
        const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
        for (const lang of langs) {
          for (const type of types) {
            const rule = config.module.rule(lang).oneOf(type)
            if (rule.uses.has('extract-css-loader')) {
              rule.use('extract-css-loader').loader(ServerMiniCssExtractPlugin.loader)
            }
          }
        }
        if (config.plugins.has('extract-css')) {
          config.plugin('extract-css').use(ServerMiniCssExtractPlugin)
        }

        config.plugins
          .delete('html')
          .delete('preload')
          .delete('prefetch')
          .delete('hmr')

        config.optimization.clear()
      })
    }
  }
}
