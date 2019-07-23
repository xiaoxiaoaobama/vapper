const PluginApi = require('./PluginApi')
const Logger = require('./Logger')
const fs = require('fs')
const { createBundleRenderer } = require('vue-server-renderer')

class Homo extends PluginApi {
  constructor (options) {
    super()
    this.options = Object.assign({
      mode: 'production',
      entry: 'src/main.js'
    }, options)
    this.logger = new Logger()
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

  async build () {
    const { serverBundle, clientManifest } = await this.builder.run()
    this.serverBundle = serverBundle
    this.clientManifest = clientManifest

    this.renderer = this.createRenderer({ serverBundle, clientManifest })
    this.builder.on('change', ({ serverBundle, clientManifest }) => {
      this.renderer = this.createRenderer({ serverBundle, clientManifest })
      this.logger.debug('Renderer recreated')
    })

    this.devMiddleware = this.builder.devMiddleware
    this.hotMiddleware = this.builder.hotMiddleware
  }

  async render (req, res) {
    this.devMiddleware && await this.devMiddleware(req, res)
    this.hotMiddleware && await this.hotMiddleware(req, res)

    const html = await this.renderToString({
      url: req.url
    })

    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.end(html)
  }

  renderToString (context) {
    return new Promise(
      (resolve, reject) => {
        this.renderer.renderToString(context, (err, html) => {
          if (err) reject(err)
          resolve(html)
        })
      }
    )
  }

  loadBuilder () {
    const builderRE = /^(@homo\/|homo-|@[\w-]+\/homo-)builder-/
    const pkg = require(this.resolveCWD('package.json'))

    const builders = Object.keys(pkg.devDependencies || {})
      .concat(Object.keys(pkg.dependencies || {}))
      .filter(id => builderRE.test(id))

    let Builder

    if (!builders.length) {
      this.logger.debug(`You don't have any builders installed, ` +
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

  createRenderer ({ serverBundle, clientManifest }) {
    return createBundleRenderer(serverBundle, {
      runInNewContext: false,
      template: this.template,
      clientManifest
    })
  }
}

module.exports = Homo
