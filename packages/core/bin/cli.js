#!/usr/bin/env node

const Homo = require('../lib')
const cli = Homo.cli

const pluginApi = new Homo.PluginApi()

const config = pluginApi.loadConfig()
if (config && config.plugins) {
  ;(config.plugins || [])
    .forEach(plugin => {
      if (typeof plugin.CLI === 'function') {
        plugin.CLI(Homo)
      } else if (Array.isArray(plugin)) {
        plugin[0].CLI(Homo, plugin[0])
      }
    })
}

cli
  .command('build', 'Build the project for the production environment')
  .allowUnknownOptions()
  .action(async flags => {
    delete flags['--']
    const homo = new Homo({ ...(flags || {}), mode: 'production' })
    homo.build()
  })

cli
  .command('dev', 'Start the development server')
  .allowUnknownOptions()
  .option('-p, --port <port>', 'Specify the port number')
  .option('-h, --host <host>', 'Specify the host')
  .action(async flags => {
    delete flags['--']
    const homo = new Homo({ ...(flags || {}), mode: 'development' })
    homo.startServer()
  })

cli
  .command('start', 'Start the production server')
  .allowUnknownOptions()
  .option('-p, --port <port>', 'Specify the port number')
  .option('-h, --host <host>', 'Specify the host')
  .action(async flags => {
    delete flags['--']
    const homo = new Homo({ ...(flags || {}), mode: 'production' })
    homo.startServer()
  })

cli.help()
cli.version(require('../package.json').version)

cli.parse()
