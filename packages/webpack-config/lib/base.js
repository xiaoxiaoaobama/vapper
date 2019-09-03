const TimeFixPlugin = require('time-fix-plugin')

module.exports = (api, config) => {
  config.resolve.alias
    .set('#', api.resolveCWD('.'))
    .set('#entry$', api.resolveCWD(api.options.entry))
    .set('vue$', api.resolveCWD('node_modules/vue/dist/vue.runtime.esm.js'))

  const publicPath = config.output.get('publicPath')
  config.output
    .publicPath((api.isProd && publicPath) ? publicPath : '/_vapper_/')

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
