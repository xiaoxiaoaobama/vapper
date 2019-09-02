
const mockRun = jest.fn()
mockRun.mockReturnValue({
  serverBundle: {},
  clientManifest: {}
})

const mockOn = jest.fn()
const mockDevMiddleware = {
  handle: jest.fn()
}
const mockHotMiddleware = {
  handle: jest.fn()
}

const Builder = jest.fn().mockImplementation(() => {
  return {
    run: mockRun,
    on: mockOn,
    devMiddleware: mockDevMiddleware,
    hotMiddleware: mockHotMiddleware
  }
})

module.exports = Builder

module.exports.mockRun = mockRun
module.exports.mockOn = mockOn
module.exports.mockDevMiddleware = mockDevMiddleware
module.exports.mockHotMiddleware = mockHotMiddleware
