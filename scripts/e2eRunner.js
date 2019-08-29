
const path = require('path')
const cypress = require('cypress')
const execa = require('execa')
const waitOn = require('wait-on')
const chalk = require('chalk')
const fs = require('fs-extra')

const fixturesPath = path.resolve(process.cwd(), `./examples`)

/**
 * Projects in the ../examples directory as test fixtures.
 *
 * Test specified project: `yarn test [...projectName]`.
 * examples: `yarn test fallback-sap redirect`.
 *
 * Test all project: `yarn test`.
 */

let subprocess
// Start the project server
async function setupProject (projectName, npmCommand = 'dev') {
  const projPath = path.resolve(process.cwd(), `./examples/${projectName}`)
  const opts = {
    cwd: projPath,
    stdio: 'inherit'
  }
  const installed = await fs.pathExists(path.resolve(projPath, './node_modules'))
  if (!installed) await execa('yarn', ['install'], opts)
  subprocess = execa('npm', ['run', npmCommand], opts)
}

async function runTest (projectName, npmCommand) {
  try {
    setupProject(projectName, npmCommand)
    await waitOn({
      resources: ['http://0.0.0.0:4000']
    })

    console.log(chalk.green(`Start ${projectName} project.`))

    await cypress.run({
      spec: `./cypress/integration/${projectName}.js`
    })

    subprocess.kill()
  } catch (err) {
    console.log(chalk.red('Running test failed:'))
    console.error(err)
  }
}

async function getProjectNames () {
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

async function run () {
  const projectNames = await getProjectNames()
  let pn = projectNames.shift()
  while (pn) {
    const testFile = path.resolve(`./cypress/integration/${pn}.js`)
    const exists = await fs.pathExists(testFile)
    if (!exists) {
      console.log(
        chalk.red(`Skip the test for \`${pn}\` because no spec files were found: `),
        chalk.blue(testFile)
      )
      pn = projectNames.shift()
      continue
    }
    await runTest(pn)
    pn = projectNames.shift()
  }
}

run()
