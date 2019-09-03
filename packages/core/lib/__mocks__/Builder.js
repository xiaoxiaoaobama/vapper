
const mockRun = jest.fn()
mockRun.mockReturnValue({
  serverBundle: {},
  clientManifest: {}
})

const mockOn = jest.fn()
const mockDevMiddleware = () => {}
const mockHotMiddleware = () => {}

const Builder = jest.fn().mockImplementation(() => {
  return {
    run: mockRun,
    on: mockOn,
    devMiddleware: mockDevMiddleware,
    hotMiddleware: mockHotMiddleware,
    clientWebpackConfig: {
      output: {
        path: 'mockClientWebpackConfig'
      }
    },
    serverWebpackConfig: {
      output: {
        path: 'mockServerWebpackConfig'
      }
    }
  }
})

module.exports = Builder

module.exports.mockRun = mockRun
module.exports.mockOn = mockOn
module.exports.mockDevMiddleware = mockDevMiddleware
module.exports.mockHotMiddleware = mockHotMiddleware
