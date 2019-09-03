const serveStatic = require('serve-static')
const finalhandler = require('finalhandler')

module.exports = (api) => {
  const preHandler = (req, res, next) => {
    const meta = api.getRouteMeta(req.url)
    const needFallback = api.options.ssr
      ? (meta && meta.ssr === false)
      : (!meta || meta.ssr !== true)

    if (needFallback) {
      api.logger.debug(`Fall back SPA mode, url is: ${req.url}`)
      fallBack(req, res)
      return
    }

    next()
  }
  preHandler.__name = 'fallback_spa_pre'

  const afterHandler = (err, req, res, next) => {
    if (api.options.fallBackSpa && err && err.isVapper) {
      api.logger.debug(`Server rendering encountered an error:`, err)
      api.logger.debug(`Will fall back SPA mode, url is: ${req.url}`)
      fallBack(req, res)
      return
    }
    next(err)
  }
  afterHandler.__name = 'fallback_spa_after'

  api.use(preHandler)
  api.use('after:render', afterHandler)

  function fallBack (req, res) {
    if (api.isProd) {
      req.url = '/index.html'
      serveStatic('dist', api.options.static)(req, res, finalhandler(req, res))
    } else {
      req.url = '/_vapper_/index.html'
      const html = api.devMiddleware.fileSystem.readFileSync(
        api.devMiddleware.getFilenameFromUrl(req.url),
        'utf-8'
      )
      res.setHeader('Content-Type', 'text/html; charset=UTF-8')
      res.end(html)
    }
  }
}
