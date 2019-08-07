const Koa = require('koa')
const app = new Koa()
const Homo = require('@homo/core')

async function starter () {
  const homo = new Homo({ mode: process.env.NODE_ENV || 'production' })

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

starter()