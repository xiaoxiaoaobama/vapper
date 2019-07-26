const fs = require('fs-extra')
const path = require('path')
const serveStatic = require('serve-static')
const compression = require('compression')
const finalhandler = require('finalhandler')
const merge = require('lodash.merge')
const { createBundleRenderer } = require('vue-server-renderer')
const PluginApi = require('./PluginApi')
const Logger = require('./Logger')
const { options: defaultOptions, optionsSchema } = require('./options')

class Homo extends PluginApi {
  constructor (options) {
    super()
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

    this.builder = this.loadBuilder()

    this.serverBundle = null
    this.clientManifest = null
    const templatePath = this.resolveCore('app/index.template.html')
    this.template = fs.readFileSync(templatePath, 'utf-8')
    this.renderer = null

    // Development only
    this.devMiddleware = null
    this.hotMiddleware = null
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

  async render (req, res) {
    const originalUrl = req.url

    // Serve pre-rendered html file
    const { generate } = this.options
    if (
      generate &&
      generate.routes &&
      generate.routes.length &&
      generate.routes.includes(originalUrl)
    ) {
      req.url = this.urlToFileName(originalUrl)
    }

    const hasExt = path.extname(req.url)

    if (!this.isProd) {
      await this.devMiddleware(req, res)
      await this.hotMiddleware(req, res)
    }

    compression()(req, res, () => {})

    // FIX: Treat URLs with extensions as requests for static resources?
    if (hasExt) {
      req.url = req.url.replace(/^\/_homo_/, '')

      this.logger.debug(`
        proxy: ${originalUrl}
        to: ${req.url}
      `)

      this.isProd
        ? serveStatic('dist', this.options.static)(req, res, finalhandler(req, res))
        : serveStatic('public', this.options.static)(req, res, finalhandler(req, res))

      return
    }

    let html
    try {
      html = await this.renderHTML({
        url: req.url
      })
    } catch (err) {
      if (err.code === 'FALLBACK_SPA') {
        this.logger.debug(`Fall back SPA mode, url is: ${req.url}`)
        if (this.isProd) {
          req.url = '/index.html'
          serveStatic('dist', this.options.static)(req, res, finalhandler(req, res))
          return
        } else {
          req.url = '/_homo_/index.html'
          html = this.devMiddleware.fileSystem.readFileSync(
            this.devMiddleware.getFilenameFromUrl(req.url),
            'utf-8'
          )
        }
      }
    }

    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.end(html)
  }

  renderHTML (context) {
    return new Promise(
      (resolve, reject) => {
        this.renderer.renderToString(context, (err, html) => {
          if (err) reject(err)
          resolve(html)
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

  loadBuilder () {
    const builderRE = /^(@homo\/|homo-|@[\w-]+\/homo-)builder-/
    const builders = this.loadDependencies(builderRE)

    let Builder

    if (!builders.length) {
      this.logger.debug(`You have not installed any builder, ` +
        'will use the default builder: `@homo/builder-vue-cli`'
      )
      Builder = require('@homo/builder-vue-cli')
    } else {
      this.logger.debug(`Find builder: \`${builders[0]}\``)
      // Only care about the first found builder
      Builder = require(builders[0])
    }

    return new Builder(this)
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
