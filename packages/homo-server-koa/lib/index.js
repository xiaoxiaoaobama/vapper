const Koa = require('koa')
const serve = require('koa-static')

const app = new Koa()

module.exports = async function starter (homo) {
  const {
    options: {
      port,
      host
    }
  } = homo

  await homo.setup()

  if (homo.isProd) {
    app.use((ctx, next) => {
      const originalUrl = ctx.url
      if (originalUrl.includes('_homo_')) {
        const proxyTo = ctx.url.replace(/_homo_\//, '')
        ctx.url = proxyTo
        homo.logger.debug(`
          proxy: ${originalUrl}
          to: ${proxyTo}
        `)
      }

      return next()
    })
  }

  app.use(serve('dist', { index: false }))
  app.use(serve('public', { index: false }))

  app.use((ctx) => {
    ctx.status = 200
    ctx.respond = false
    homo.render(ctx.req, ctx.res)
  })

  app.listen(port, host, () => homo.logger.info(`Server running at: http://${host}:${port}`))
}
