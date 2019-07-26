#!/usr/bin/env node

const cli = require('cac')()
const Homo = require('@homo/core')

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
    const starter = homo.loadServerStarter()
    starter(homo)
  })

cli
  .command('start', 'Start the production server')
  .allowUnknownOptions()
  .option('-p, --port <port>', 'Specify the port number')
  .option('-h, --host <host>', 'Specify the host')
  .action(async flags => {
    delete flags['--']
    const homo = new Homo({ ...(flags || {}), mode: 'production' })
    const starter = homo.loadServerStarter()
    starter(homo)
  })

cli.help()
cli.version(require('../package.json').version)

cli.parse()
