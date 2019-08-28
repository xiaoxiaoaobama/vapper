const cypress = require('cypress')

// 启动项目 server

async function run () {
  try {
    await cypress.run()
  } catch (err) {
    console.log('Running test failed:')
    console.error(err)
  }
}

run()
