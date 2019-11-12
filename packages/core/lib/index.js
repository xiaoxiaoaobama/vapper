const fs = require('fs-extra')
const path = require('path')
const cac = require('cac')()
const connect = require('connect')
const compression = require('compression')
const { minify } = require('html-minifier')
const merge = require('lodash.merge')
const { createBundleRenderer } = require('vue-server-renderer')
const template = require('lodash.template')
const PluginApi = require('./PluginApi')
const Logger = require('./Logger')
const Builder = require('./Builder')
const serveStaticPlugin = require('./plugins/serveStatic')
const separateEntryPlugin = require('./plugins/separateEntry')
const fallbackSpaPlugin = require('./plugins/fallbackSpa')
const microCachingPlugin = require('./plugins/microCaching')
const { options: defaultOptions, optionsSchema } = require('./options')

class Vapper extends PluginApi {
  constructor (options) {
    super()
    this.app = connect()
    this.cli = cac

    // Check if it is a TypeScript project
    this.isTSProject = fs.existsSync(this.resolveCWD(defaultOptions.entry + '.ts'))
    if (this.isTSProject) {
      defaultOptions.clientEntry = 'src/client.ts'
      defaultOptions.serverEntry = 'src/server.ts'
    }

    this.defaultOptions = defaultOptions
    this.optionsSchema = optionsSchema
    this.options = merge(
      {},
      defaultOptions,
      this.loadConfig(),
      options
    )

    this.isProd = this.options.mode === defaultOptions.mode

    // Set environment variables
    process.env.VAPPER_ENV = this.options.mode

    this.logger = new Logger()
    this.logger.setLogLevel(this.options.logLevel)

    const { error } = this.validateOptions(optionsSchema, this.options)
    if (error) {
      if (error.isJoi) {
        error.details.forEach(e => {
          this.logger.error(e.message)
        })
      } else {
        this.logger.error(error.toString())
      }
    }

    this.builder = new Builder(this)

    this.serverBundle = null
    this.clientManifest = null
    if (this.options.template) {
      this.template = this.options.template
    } else {
      const templatePath = this.resolveCore('app/index.template.html')
      this.template = fs.readFileSync(templatePath, 'utf-8')
    }
    this.renderer = null
    this.htmlContent = ''

    // Development only
    this.devMiddleware = null
    this.hotMiddleware = null

    // When `setup` is complete, it is an instance of vue-router
    this.router = null

    this.initPlugins()
  }

  get handler () {
    return this.app
  }

  async setup () {
    this.invokeHook('before:setup')

    if (this.isProd) {
      const serverBundle = JSON.parse(
        fs.readFileSync(this.resolveOut(this.options.serverBundleFileName), 'utf-8')
      )
      const clientManifest = JSON.parse(
        fs.readFileSync(this.resolveOut(this.options.clientManifestFileName), 'utf-8')
      )

      this.renderer = this.createRenderer({ serverBundle, clientManifest })
    } else {
      await this.build()
    }

    // Resolve the vue-router instance
    await this.resolveRouterInstanceForFake()

    // install middleware
    this.app.use(compression())
    if (!this.isProd) {
      this.app.use(this.devMiddleware)
      this.app.use(this.hotMiddleware)
    }
    for (const m of this.middlewares[this.allowMiddlewareTypes[0]]) {
      this.app.use(m)
    }
    this.app.use(this.render.bind(this))
    for (const m of this.middlewares[this.allowMiddlewareTypes[1]]) {
      this.app.use(m)
    }

    this.invokeHook('after:setup')
  }

  async build () {
    await this.generateEnhanceFile()

    if (this.isProd) {
      await fs.remove(this.resolveOut('.'))
      await this.builder.run()
      return
    }

    const { serverBundle, clientManifest } = await this.builder.run()
    this.serverBundle = serverBundle
    this.clientManifest = clientManifest

    this.renderer = this.createRenderer({ serverBundle, clientManifest })

    this.builder.on('change', async ({ serverBundle, clientManifest }) => {
      this.renderer = this.createRenderer({ serverBundle, clientManifest })
      // Update the vue-router instance
      await this.resolveRouterInstanceForFake()
      this.logger.debug('Renderer updated')
    })

    this.devMiddleware = this.builder.devMiddleware
    this.hotMiddleware = this.builder.hotMiddleware
  }

  async render (req, res, next) {
    this.invokeHook('before:render')
    try {
      this.htmlContent = await this.renderHTML({
        url: req.url,
        enhanceFiles: this.enhanceFiles,
        req,
        res
      })

      this.invokeHook('after:render', this.htmlContent)

      res.setHeader('Content-Type', 'text/html; charset=UTF-8')
      res.end(this.htmlContent)
      next()
    } catch (err) {
      if (err.code === 'REDIRECT') {
        res.writeHead(302, {
          Location: err.redirectURL
        })
        res.end()
        return
      }
      // The `err` may not be an Error instance in some cases
      const error = typeof err !== 'object' ? new Error(String(err)) : err
      error.isVapper = true
      next(error)
    }
  }

  renderHTML (context) {
    let htmlMinifier = this.options.htmlMinifier
    htmlMinifier =
      this.isProd
        ? htmlMinifier === true
          ? {
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            useShortDoctype: true,
            minifyCSS: true
          }
          : htmlMinifier
        : {}

    return new Promise(
      (resolve, reject) => {
        this.renderer.renderToString(context, (err, html) => {
          if (err) {
            reject(err)
            return
          }
          resolve(htmlMinifier ? minify(html, htmlMinifier) : html)
        })
      }
    )
  }

  async resolveRouterInstanceForFake () {
    if (!this.options.needResolveRouteMeta) return
    // Get the vue-router instance
    try {
      await this.renderHTML({ fake: true })
    } catch (err) {
      if (err.code === 'FAKE') {
        this.router = err.router
      } else {
        this.logger.error(err)
      }
    }
  }

  createRenderer ({ serverBundle, clientManifest }) {
    return createBundleRenderer(serverBundle, {
      ...this.options.rendererOptions,
      runInNewContext: false,
      template: this.template,
      clientManifest
    })
  }

  initPlugins () {
    this.buildInPlugins = [
      serveStaticPlugin,
      fallbackSpaPlugin,
      separateEntryPlugin,
      [microCachingPlugin, this.options.pageCache]
    ]

    this.buildInPlugins
      .concat((this.options.plugins || []))
      .forEach(plugin => {
        if (typeof plugin === 'string') plugin = require(plugin)

        if (typeof plugin === 'function') {
          plugin.call(this, this)
        } else if (Array.isArray(plugin)) {
          const options = plugin[1]
          plugin = typeof plugin[0] === 'string'
            ? require(plugin[0])
            : plugin[0]

          plugin.call(this, this, options)
        } else {
          this.logger.error('The plugin must be a function or an array')
        }
      })
  }

  async generateEnhanceFile () {
    const compiled = template(this.enhanceTemplate)

    const clientEnhanceContent = compiled({
      type: 'client',
      enhanceFiles: Array.from(this.enhanceFiles).filter(enhanceObj => enhanceObj.client)
    })
    const serverEnhanceContent = compiled({
      type: 'server',
      enhanceFiles: Array.from(this.enhanceFiles).filter(enhanceObj => enhanceObj.server)
    })

    this.logger.debug('Write a enhance file: ' + this.enhanceClientOutput)
    this.logger.debug('Write a enhance file: ' + this.enhanceServerOutput)

    await fs.remove(this.enhanceClientOutput)
    await fs.remove(this.enhanceServerOutput)
    await fs.ensureFile(this.enhanceClientOutput)
    await fs.ensureFile(this.enhanceServerOutput)
    fs.writeFileSync(this.enhanceClientOutput, clientEnhanceContent, 'utf-8')
    fs.writeFileSync(this.enhanceServerOutput, serverEnhanceContent, 'utf-8')
  }

  listen (...args) {
    this.app.listen(...args)
  }

  async startServer () {
    const {
      options: {
        port,
        host
      }
    } = this

    await this.setup()

    this.listen(port, host)

    this.logger.info(`Server running at: http://${host}:${port}`)
  }

  resolveOut (...args) {
    return path.resolve(this.builder.clientWebpackConfig.output.path, ...args)
  }
}

Vapper.defaultOptions = defaultOptions
Vapper.cli = cac
Vapper.PluginApi = PluginApi

module.exports = Vapper
