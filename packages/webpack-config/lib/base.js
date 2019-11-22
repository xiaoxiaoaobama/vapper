const TimeFixPlugin = require('time-fix-plugin')

module.exports = (api, config) => {
  config.resolve.alias
    .set('#', api.resolveCWD('.'))
    .set('#entry$', api.resolveCWD(api.options.entry))
    .set('vue$', api.resolveCWD('node_modules/vue/dist/vue.runtime.esm.js'))

  let publicPath = config.output.get('publicPath')
  publicPath = api.isProd
    ? publicPath || '/_vapper/'
    : publicPath && publicPath !== '/' ? publicPath : '/_vapper_/'

  config.output
    .publicPath(publicPath)

  config.module
    .rule('vue')
    .use('vue-loader')
    .loader('vue-loader')
    .tap(args => {
      return {
        ...args,
        optimizeSSR: false
      }
    })

  config.module
    .rule('eslint')
    .exclude
    .add(api.resolveCore('.'))
    .add(api.resolveCore('..'))

  config.plugins
    .delete('progress')

  TimeFixPlugin.__expression = `require('time-fix-plugin')`
  config.plugin('timefix').use(TimeFixPlugin)
}
