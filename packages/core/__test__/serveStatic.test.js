const serveStaticPlugin = require('../lib/plugins/serveStatic')
const path = require('path')
const finalhandler = require('finalhandler')
const serveStatic = require('serve-static')
const Url = require('url-parse')

const pathname = 'pathname'

jest.mock('path')
jest.mock('finalhandler')
jest.mock('serve-static')
jest.mock('url-parse')

Url.mockImplementation(() => ({ pathname }))
path.extname = jest.fn()

describe('serveStaticPlugin: ', () => {
  let handler
  const api = {
    publicPath: 'publicPath',
    logger: {
      debug: jest.fn()
    },
    isProd: false,
    options: {
      static: 'static'
    },
    use: fn => (handler = fn)
  }
  const req = {
    url: '/foo'
  }
  const res = {
  }
  const next = jest.fn()
  const mockResultOfserveStatic = jest.fn()

  beforeEach(() => {
    serveStatic.mockReturnValue(mockResultOfserveStatic)
  })

  afterEach(() => {
    jest.resetAllMocks()
    api.isProd = false
  })

  test(`invoke handler of serveStaticPlugin without hasExt`, () => {
    serveStaticPlugin(api)
    expect(handler.__name).toBe('serve_static')
    handler(req, res, next)
    expect(next.mock.calls.length).toBe(1)
  })

  test(`invoke handler of serveStaticPlugin with hasExt`, () => {
    path.extname.mockReturnValue(1)
    serveStaticPlugin(api)
    expect(handler.__name).toBe('serve_static')
    handler(req, res, next)
    expect(mockResultOfserveStatic.mock.calls.length).toBe(1)
    expect(finalhandler.mock.calls.length).toBe(1)
  })

  test(`invoke handler of serveStaticPlugin with isProd: true`, () => {
    api.isProd = true
    path.extname.mockReturnValue(1)
    serveStaticPlugin(api)
    expect(handler.__name).toBe('serve_static')
    handler(req, res, next)
    expect(mockResultOfserveStatic.mock.calls.length).toBe(1)
    expect(finalhandler.mock.calls.length).toBe(1)
  })
})
