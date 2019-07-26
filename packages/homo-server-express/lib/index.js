const express = require('express')
const app = express()

module.exports = async function starter (homo) {
  const {
    options: {
      port,
      host
    }
  } = homo

  await homo.setup()

  app.get('*', (req, res) => {
    homo.render(req, res)
  })

  app.listen(port, host, () => homo.logger.info(`Server running at: http://${host}:${port}`))
}
