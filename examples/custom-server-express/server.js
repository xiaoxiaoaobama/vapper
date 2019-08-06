const express = require('express')
const app = express()
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

  app.get('*', homo.handler)

  app.listen(port, host, () => homo.logger.info(`Server running at: http://${host}:${port}`))
}

starter()