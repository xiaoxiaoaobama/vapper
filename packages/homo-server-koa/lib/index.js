const Koa = require('koa')

const app = new Koa()

module.exports = async function starter (homo) {
  const {
    options: {
      port,
      host
    }
  } = homo

  await homo.setup()

  app.use((ctx) => {
    ctx.status = 200
    ctx.respond = false
    homo.handler(ctx.req, ctx.res)
  })

  app.listen(port, host, () => homo.logger.info(`Server running at: http://${host}:${port}`))
}
