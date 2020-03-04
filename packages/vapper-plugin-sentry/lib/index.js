const path = require('path')
const deepMerge = require('deepmerge')
const Sentry = require('@sentry/node')
const WebpackPlugin = require('@sentry/webpack-plugin')
const Integrations = require('@sentry/integrations')

const filterDisabledIntegration = integrations => Object.keys(integrations)
  .filter(key => integrations[key])

module.exports = (api, pluginOptions) => {
  const defaultOptions = {
    dsn: '',
    disableClientSide: false,
    disableServerSide: false,
    config: {
      environment: api.isProd ? 'production' : 'development'
    },
    clientConfig: {},
    serverConfig: {},
    webpackConfig: {
      include: [],
      ignore: [
        'node_modules'
      ],
      configFile: '.sentryclirc'
    },

    publishRelease: false,
    disableServerRelease: false,
    disableClientRelease: false,
    attachCommits: false,
    repo: false,
    clientIntegrations: {
      Dedupe: {},
      ExtraErrorData: {},
      ReportingObserver: {},
      RewriteFrames: {},
      Vue: { attachProps: true }
    },
    serverIntegrations: {
      Dedupe: {},
      ExtraErrorData: {},
      RewriteFrames: {},
      Transaction: {}
    }
  }

  const options = deepMerge.all([
    defaultOptions,
    pluginOptions
  ])

  if (!options.dsn) {
    api.logger.error('Errors will not be logged because no DSN has been provided')
    return
  }

  options.clientConfig = deepMerge.all([options.config, options.clientConfig])
  options.serverConfig = deepMerge.all([options.config, options.serverConfig])

  if (options.config.release && !options.webpackConfig.release) {
    options.webpackConfig.release = options.config.release
  }

  if (options.attachCommits) {
    options.webpackConfig.setCommits = {
      auto: true
    }

    if (options.repo) {
      options.webpackConfig.setCommits.repo = options.repo
    }
  }

  if (!options.disableClientSide) {
    api.addEnhanceFile({
      needCompile: true,
      client: path.resolve(__dirname, './sentry-client.ejs'),
      clientOptions: {
        config: {
          dsn: options.dsn,
          ...options.clientConfig
        },
        integrations: filterDisabledIntegration(options.clientIntegrations)
          .reduce((res, key) => {
            res[key] = options.clientIntegrations[key]
            return res
          }, {})
      }
    })
  }

  if (!options.disableServerSide) {
    // init Sentry
    Sentry.init({
      dsn: options.dsn,
      ...options.serverConfig,
      integrations: filterDisabledIntegration(options.serverIntegrations)
        .map(name => new Integrations[name](options.serverIntegrations[name]))
    })

    process.sentry = Sentry
    api.logger.success('Started logging errors to Sentry')

    api.addEnhanceFile({
      needCompile: false,
      server: path.resolve(__dirname, './sentry-server.js')
    })

    api.use('before:setup', Sentry.Handlers.requestHandler())
    // TODO: Sentry.Handlers.errorHandler()
  }

  if (!options.disabled) {
    api.chainWebpack(config => {
      const buildDirPath = config.output.get('path')
      const publicPath = api.publicPath

      options.webpackConfig.include.push(buildDirPath)
      options.webpackConfig.urlPrefix = publicPath.startsWith('/') ? `~${publicPath}` : publicPath

      if (!options.publishRelease || !api.isProd) {
        return
      }

      config.devtool('source-map')

      config
        .plugin('webpackSentry')
        .use(WebpackPlugin, [options.webpackConfig])

      api.logger.debug('Enabling uploading of release sourcemaps to Sentry')
    })
  }
}
