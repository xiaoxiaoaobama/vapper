
module.exports = (api, config) => {
  config
    .entry('index')
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
    .plugin('webpackbar')
    .use(require('webpackbar'), [{
      name: 'Server',
      color: '#cc00ff'
    }])

  config
    .plugin('VueSSRServerPlugin')
    .use(require('vue-server-renderer/server-plugin'), [{
      filename: api.options.serverBundleFileName
    }])

  const isExtracting = config.plugins.has('extract-css')
  if (isExtracting) {
    const langs = ['css', 'postcss', 'scss', 'sass', 'less', 'stylus']
    const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
    for (const lang of langs) {
      for (const type of types) {
        const rule = config.module.rule(lang).oneOf(type)
        rule.uses.delete('extract-css-loader')
      }
    }
    config.plugins.delete('extract-css')
  }

  config.plugins
    .delete('html')
    .delete('inline-runtime-chunk')
    .delete('preload')
    .delete('prefetch')
    .delete('hmr')

  config.optimization.clear()
}
