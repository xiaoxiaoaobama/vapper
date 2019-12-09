const path = require('path')
const waitOn = require('wait-on')
const chalk = require('chalk')
const autocannon = require('autocannon')
const { setupProject, getCurrentProcess, getProjectNames, serverUrl } = require('./utils')

const fixturesPath = path.resolve(process.cwd(), `./examples`)

const stressTestConfig = {
  poi: {
    connections: 10,
    duration: 10
  },
  'vue-cli3': {
    connections: 10,
    duration: 10
  }
}

function startStressTest (serverUrl, stressOptions) {
  return new Promise((resolve, reject) => {
    const instance = autocannon({
      url: serverUrl,
      ...stressOptions
    })

    // render ProgressBar
    autocannon.track(instance, { renderProgressBar: true })

    // Emitted when the autocannon finishes a benchmark
    instance.on('done', () => {
      resolve()
    })

    // Emitted if there is an error during the setup phase of autocannon.
    instance.on('error', err => {
      reject(err)
    })
  })
}

async function runTest (projectName, stressOptions, npmCommand) {
  try {
    const projPath = path.resolve(fixturesPath, `./${projectName}`)
    setupProject(projPath, npmCommand)

    await waitOn({
      resources: [serverUrl]
    })

    console.log()
    console.log(chalk.green(`🚀  Start to stress test in ${projectName} project...`))
    console.log()

    await startStressTest(serverUrl, stressOptions)

    const sub = getCurrentProcess()
    sub && sub.kill()

    console.log()
    console.log(chalk.green(`📄  The stress test has been completed in ${projectName} project.`))
    console.log()
  } catch (err) {
    console.log(chalk.red('Running test failed:'))
    console.error(err)
  }
}

async function run () {
  const projectNames = await getProjectNames(fixturesPath)
  let pn = projectNames.shift()
  while (pn) {
    const stressOptions = stressTestConfig[pn]
    if (!stressOptions) {
      console.log(
        chalk.red(`Skip the stress test for \`${pn}\` because no config options were found in stressTestConfig.js`)
      )
      pn = projectNames.shift()
      continue
    }

    await runTest(pn, stressOptions)
    pn = projectNames.shift()
  }
}

run()
