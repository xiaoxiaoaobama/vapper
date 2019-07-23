const Koa = require('koa')
const Homo = require('../../packages/core/lib')
const app = new Koa()
const homo = new Homo({
  mode: 'development'
  // mode: 'production'
})

async function start () {
  await homo.build()

  app.use((ctx) => {
    ctx.status = 200
    ctx.respond = false
    homo.render(ctx.req, ctx.res)
  })

  app.listen(9999, () => console.log('Server running at: http://127.0.0.1:9999'))
}

start()
