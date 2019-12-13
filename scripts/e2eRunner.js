
const path = require('path')
const cypress = require('cypress')
const waitOn = require('wait-on')
const chalk = require('chalk')
const fs = require('fs-extra')
const { setupProject, getCurrentProcess, getProjectNames, serverUrl } = require('./utils')

const fixturesPath = path.resolve(process.cwd(), `./__e2e_fixtures__`)

/**
 * Projects in the ../examples directory as test fixtures.
 *
 * Test specified project: `yarn test [...projectName]`.
 * examples: `yarn test fallback-sap redirect`.
 *
 * Test all project: `yarn test`.
 */

async function runTest (projectName, npmCommand) {
  try {
    const projPath = path.resolve(fixturesPath, `./${projectName}`)
    setupProject(projPath, npmCommand)

    await waitOn({
      resources: [serverUrl]
    })

    console.log(chalk.green(`Start ${projectName} project.`))

    await cypress.run({
      spec: `./cypress/integration/${projectName}.js`
    })

    const sub = getCurrentProcess()
    sub && sub.kill()
  } catch (err) {
    console.log(chalk.red('Running test failed:'))
    console.error(err)
  }
}

async function run () {
  const projectNames = await getProjectNames(fixturesPath)

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
