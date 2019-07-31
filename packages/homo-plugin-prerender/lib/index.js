const fs = require('fs-extra')
const finalhandler = require('finalhandler')
const serveStatic = require('serve-static')

module.exports = (api, options) => {
  const routes = options.routes

  api.$generate = async () => {
    if (!api.isProd) return

    await api.build()
    await api.setup()

    await Promise.all(routes.map(async (route) => {
      const html = await api.renderHTML({
        url: route
      })
      const fileName = urlToFileName(route)

      api.logger.debug(`Generate pre-rendered html files: ${fileName}`)

      await fs.ensureFile(api.resolveOut(fileName))
      await fs.outputFile(api.resolveOut(fileName), html)
    }))
  }

  api.use((req, res, next) => {
    // Serve pre-rendered html file
    const originalUrl = req.url
    if (
      api.isProd &&
      routes &&
      routes.length &&
      routes.includes(originalUrl)
    ) {
      req.url = urlToFileName(originalUrl)
      serveStatic('dist', api.options.static)(req, res, finalhandler(req, res))
      return
    }

    next()
  })
}

module.exports.CLI = (Homo) => {
  Homo.cli
    .command('generate', 'Generate pre-rendered html files')
    .allowUnknownOptions()
    .action(async flags => {
      delete flags['--']
      const homo = new Homo({ ...(flags || {}), mode: 'production' })

      homo.$generate()
    })
}

function urlToFileName (url) {
  return url.endsWith('/')
    ? url.slice(1) + 'index.html'
    : url.slice(1) + '.html'
}
