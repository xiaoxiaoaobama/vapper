const express = require('express')
const app = express()
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

  app.get('*', vapper.handler)

  app.listen(port, host, () => vapper.logger.info(`Server running at: http://${host}:${port}`))
}

starter()