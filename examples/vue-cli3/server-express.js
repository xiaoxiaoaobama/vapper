const app = require('express')()
const Homo = require('../../packages/core/lib')

const homo = new Homo({
  mode: 'development'
  // mode: 'production'
})

async function start () {
  await homo.build()

  app.get('*', (req, res) => {
    console.log(req.url)
    homo.render(req, res)
  })

  app.listen(9999, () => console.log('at: http://127.0.0.1:9999'))
}

start()
