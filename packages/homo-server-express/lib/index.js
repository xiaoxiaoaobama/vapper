const express = require('express')
const app = express()

module.exports = async function starter (homo) {
  await homo.setup()

  if (homo.isProd) {
    app.get('/_homo_/*', (req, res, ...args) => {
      req.url = req.url.replace(/^\/_homo_/, '')
      express.static('dist', {
        dotfiles: 'allow',
        index: false
      })(req, res, ...args)
    })
  }

  app.use(express.static('public', { index: false }))

  app.get('*', (req, res) => {
    homo.render(req, res)
  })

  app.listen(9999, () => homo.logger.info('Server running at: http://127.0.0.1:9999'))
}
