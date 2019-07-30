const fs = require('fs-extra')
const path = require('path')
const connect = require('connect')
const compression = require('compression')
const { minify } = require('html-minifier')
const merge = require('lodash.merge')
const { createBundleRenderer } = require('vue-server-renderer')
const PluginApi = require('./PluginApi')
const Logger = require('./Logger')
const Builder = require('./Builder')
const serveStaticMiddleware = require('./middlewares/serveStatic')
const fallbackSpaMiddleware = require('./middlewares/fallbackSpa')
const { options: defaultOptions, optionsSchema } = require('./options')

class Homo extends PluginApi {
  constructor (options) {
    super()
    this.app = connect()

    this.defaultOptions = defaultOptions
    this.optionsSchema = optionsSchema
    this.options = merge(
      {},
      defaultOptions,
      this.loadConfig(),
      options
    )

    this.isProd = options.mode === defaultOptions.mode
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
    const templatePath = this.resolveCore('app/index.template.html')
    this.template = fs.readFileSync(templatePath, 'utf-8')
    this.renderer = null

    // Development only
    this.devMiddleware = null
    this.hotMiddleware = null
  }

  get handler () {
    return this.app
  }

  async setup () {
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

    // install middleware
    this.app.use(compression())
    if (!this.isProd) {
      this.app.use(this.devMiddleware)
      this.app.use(this.hotMiddleware)
    }
    this.app.use(serveStaticMiddleware(this))
    this.app.use(this.render.bind(this))
    this.app.use(fallbackSpaMiddleware(this))
  }

  async build () {
    await fs.remove(this.resolveOut('.'))

    if (this.isProd) {
      await this.builder.run()
      return
    }

    const { serverBundle, clientManifest } = await this.builder.run()
    this.serverBundle = serverBundle
    this.clientManifest = clientManifest

    this.renderer = this.createRenderer({ serverBundle, clientManifest })

    this.builder.on('change', ({ serverBundle, clientManifest }) => {
      this.renderer = this.createRenderer({ serverBundle, clientManifest })
      this.logger.debug('Renderer re-created')
    })

    this.devMiddleware = this.builder.devMiddleware
    this.hotMiddleware = this.builder.hotMiddleware
  }

  async generate () {
    const { routes } = this.options.generate

    await this.build()
    await this.setup()

    await Promise.all(routes.map(async (route) => {
      const html = await this.renderHTML({
        url: route
      })
      const fileName = this.urlToFileName(route)

      this.logger.debug(`Generate pre-rendered html files: ${fileName}`)

      await fs.ensureFile(this.resolveOut(fileName))
      await fs.outputFile(this.resolveOut(fileName), html)
    }))
  }

  urlToFileName (url) {
    return url.endsWith('/')
      ? url.slice(1) + 'index.html'
      : url.slice(1) + '.html'
  }

  async render (req, res, next) {
    let html
    try {
      html = await this.renderHTML({
        url: req.url
      })
      res.setHeader('Content-Type', 'text/html; charset=UTF-8')
      res.end(html)
    } catch (err) {
      next(err)
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

  createRenderer ({ serverBundle, clientManifest }) {
    return createBundleRenderer(serverBundle, {
      runInNewContext: false,
      template: this.template,
      clientManifest
    })
  }

  loadServerStarter () {
    const serverStarterRE = /^(@homo\/|homo-|@[\w-]+\/homo-)server-/
    const starters = this.loadDependencies(serverStarterRE)

    let starter

    if (!starters.length) {
      const customServerFile = this.resolveCWD('homo-server.js')
      if (
        fs.existsSync(customServerFile) &&
        fs.statSync(customServerFile).isFile()
      ) {
        this.logger.debug(`Find a custom server starter: ${customServerFile}`)
        starter = require(customServerFile)
      } else {
        this.logger.debug(
          'You have not installed any server starter, ' +
          'will use the default server starter: `@homo/server-express`'
        )
        starter = require('@homo/server-express')
      }
    } else {
      this.logger.debug(`Find builder: \`${starters[0]}\``)
      // Only care about the first found builder
      starter = require(starters[0])
    }

    return starter
  }

  resolveOut (...args) {
    return path.resolve(this.builder.clientWebpackConfig.output.path, ...args)
  }
}

Homo.defaultOptions = defaultOptions
module.exports = Homo
