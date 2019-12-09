const execa = require('execa')
const path = require('path')
const fs = require('fs-extra')

exports.serverUrl = 'http://0.0.0.0:4000'

exports.getProjectNames = async (fixturesPath) => {
  const projectNames = process.argv.slice(2)

  if (!projectNames.length) {
    const files = await fs.readdir(fixturesPath)

    await Promise.all(
      files.map(async f => {
        const stat = await fs.stat(path.resolve(fixturesPath, f))
        if (stat.isDirectory()) {
          projectNames.push(f)
        }
      })
    )
  }

  return projectNames
}

let subprocess = null
exports.setupProject = async function (projPath, npmCommand = 'dev') {
  const opts = {
    cwd: projPath,
    stdio: 'inherit'
  }
  const installed = await fs.pathExists(path.resolve(projPath, './node_modules'))
  if (!installed) await execa('yarn', ['install'], opts)

  subprocess = execa('npm', ['run', npmCommand], opts)
}

exports.getCurrentProcess = () => subprocess
