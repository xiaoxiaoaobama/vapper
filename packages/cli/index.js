#!/usr/bin/env node

const JoyCon = require('joycon')
const cli = require('cac')()
const merge = require('lodash.merge')
const Homo = require('@homo/core')

const joycon = new JoyCon({
  packageKey: 'homo'
})

cli
  .command('build', 'Build the project for the production environment')
  .action(async flags => {
    const config = await getConfig(flags)
    const homo = new Homo(config)
    homo.build()
  })

cli
  .command('dev', 'Start the development server')
  .option('-p, --port <port>', 'Specify the port number')
  .action(async flags => {
    const config = await getConfig(flags)
    const homo = new Homo(config)
    homo.startServer()
  })

cli
  .command('start', 'Start the production server')
  .option('-p, --port <port>', 'Specify the port number')
  .action(async flags => {
    const config = await getConfig(flags)
    const homo = new Homo(config)
    homo.startServer(true /* production */)
  })

cli.help()
cli.version(require('../package.json').version)

cli.parse()

/**
 * Get the final configuration.
 * Configured priority: Command line argument > Configuration file > default options
 */
async function getConfig (flags) {
  const { path, data } = await joycon.load([
    'homo.config.js',
    'package.json'
  ])
  const config = {
    entry: 'src/main',
    port: 9999,
    logLevel: 5,
    serverMiddlewares: {
      dev: [],
      prod: [],
      all: []
    },
    useVueCli3: true
  }
  if (path) merge(config, data)
  merge(config, flags || {})
  return config
}
