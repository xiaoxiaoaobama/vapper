const webpack = require('webpack')
const ProgressBar = require('./ProgressBar')

module.exports = (api) => {
  return {
    id: 'vue-cli-plugin-homo-webpack-base',
    apply: (vueCliapi) => {
      vueCliapi.chainWebpack(config => {
        config.resolve.alias
          .set('#entry$', api.resolveCWD(api.options.entry))

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

        config
          .plugin('PrintStatusPlugin')
          .use(require('./PrintStatusPlugin'), [
            {
              printFileStats: true,
              logger: api.logger
            }
          ])

        config
          .plugin('constants')
          .use(webpack.DefinePlugin, [
            {
              'process.env.NODE_ENV': JSON.stringify(
                this.isProd ? 'production' : 'development'
              )
            }
          ])

        config
          .plugin('Progress')
          .use(webpack.ProgressPlugin, [
            {
              handler: new ProgressBar().handler
            }
          ])
      })
    }
  }
}
