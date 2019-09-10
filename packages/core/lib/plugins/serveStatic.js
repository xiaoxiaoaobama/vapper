const path = require('path')
const finalhandler = require('finalhandler')
const serveStatic = require('serve-static')
const Url = require('url-parse')

module.exports = (api) => {
  const handler = (req, res, next) => {
    const originalUrl = req.url

    // FIX: Treat URLs with extensions as requests for static resources?
    const url = new Url(req.url)
    const hasExt = path.extname(url.pathname)

    if (hasExt) {
      req.url = req.url.replace(/^\/_vapper_/, '')

      api.logger.debug(`
        proxy: ${originalUrl}
        to: ${req.url}
      `)

      api.isProd
        ? serveStatic('dist', api.options.static)(req, res, finalhandler(req, res))
        : serveStatic('public', api.options.static)(req, res, finalhandler(req, res))

      return
    }

    next()
  }
  handler.__name = 'serve_static'

  api.use(handler)
}
