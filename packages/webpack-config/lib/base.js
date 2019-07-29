module.exports = (api, config) => {
  config.resolve.alias
    .set('#entry$', api.resolveCWD(api.options.entry))
    .set('vue$', api.resolveCWD('node_modules/vue/dist/vue.runtime.esm.js'))

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
}
