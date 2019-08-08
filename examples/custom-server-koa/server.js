const Koa = require('koa')
const app = new Koa()
const Vapper = require('@vapper/core')

async function starter () {
  const vapper = new Vapper({ mode: process.env.NODE_ENV || 'production' })

  const {
    options: {
      port,
      host
    }
  } = vapper

  await vapper.setup()

  app.use((ctx) => {
    ctx.status = 200
    ctx.respond = false
    vapper.handler(ctx.req, ctx.res)
  })

  app.listen(port, host, () => vapper.logger.info(`Server running at: http://${host}:${port}`))
}

starter()