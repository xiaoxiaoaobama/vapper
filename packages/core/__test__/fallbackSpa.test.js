const fallbackSpa = require('../lib/plugins/fallbackSpa')
const serveStatic = require('serve-static')
const finalhandler = require('finalhandler')
jest.mock('serve-static')
jest.mock('finalhandler')

describe('fallbackSpa: ', () => {
  let orignalPreHandler = () => {}
  let orignalAfterHandler = () => {}
  const mockServerStatic = jest.fn()
  const expectedFinalHandler = () => {}
  const mockPreHandler = jest.fn()
  const mockAfterHandler = jest.fn()
  const handlersMap = {
    fallback_spa_pre: mockPreHandler,
    fallback_spa_after: mockAfterHandler
  }
  const fallbackSpaHandler = jest.fn()
  const api = {
    handler: jest.fn(),
    getRouteMeta: jest.fn(),
    options: {
      ssr: false,
      fallBackSpa: false,
      fallbackSpaHandler,
      static: 'index.html'
    },
    logger: {
      debug: jest.fn()
    },
    use: jest.fn((title, fn) => {
      let name = ''

      if (typeof title === 'function') {
        name = title.__name
        orignalPreHandler = title
      } else {
        name = fn.__name
        orignalAfterHandler = fn
      }

      return handlersMap[name]()
    }),
    isProd: false,
    publicPath: 'your.public.path',
    devMiddleware: {
      fileSystem: {
        readFileSync: jest.fn()
      },
      getFilenameFromUrl: jest.fn()
    }
  }
  const req = {
    url: 'url of req'
  }
  const res = {
    setHeader: jest.fn(),
    end: jest.fn()
  }
  const next = jest.fn()

  beforeAll(() => {
    serveStatic.mockReturnValue(mockServerStatic)
    finalhandler.mockReturnValue(expectedFinalHandler)
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  afterEach(() => {
    api.use.mockClear()
    api.handler.mockClear()
    api.getRouteMeta.mockClear()
    serveStatic.mockClear()
    mockServerStatic.mockClear()
    finalhandler.mockClear()
  })

  test('init fallbackSpa should succeed', () => {
    fallbackSpa(api)
    expect(api.use.mock.calls.length).toBe(2)
    expect(api.use.mock.calls[0][0] === orignalPreHandler).toBe(true)
    expect(api.use.mock.calls[1][1] === orignalAfterHandler).toBe(true)
  })

  test('invoke fallbackSPA should succeed', () => {
    fallbackSpa(api)
    api.fallbackSPA(req, res)
    expect(req._forceFallback).toBe(true)
    expect(api.handler.mock.calls.length).toBe(1)
    delete req._forceFallback
  })

  describe('preHandler: ', () => {
    beforeAll(() => {
      api.getRouteMeta
        .mockReturnValueOnce({ ssr: false })
        .mockReturnValueOnce({ ssr: false })
        .mockReturnValueOnce({ ssr: true })
        .mockReturnValue({ ssr: false })
    })

    afterEach(() => {
      api.getRouteMeta.mockClear()
      api.logger.debug.mockClear()
      api.options.fallbackSpaHandler.mockClear()
      next.mockClear()
      finalhandler.mockClear()
    })

    test(`should invoke fallBack:
      1) req._forceFallback is undefined
      2) meta.ssr is false
      3) api.options.fallbackSpaHandler is exists
      4) api.isProd is false
      5) api.options.ssr is true
    `, () => {
      api.options.ssr = true

      fallbackSpa(api)
      orignalPreHandler(req, res, next)

      expect(api.getRouteMeta.mock.calls.length).toBe(1)
      expect(api.getRouteMeta.mock.calls[0][0]).toBe(req.url)
      expect(api.logger.debug.mock.calls.length).toBe(1)
      expect(api.logger.debug.mock.calls[0][0]).toBe(' Fall back SPA mode, url is: url of req')
      expect(api.options.fallbackSpaHandler.mock.calls.length).toBe(1)
      expect(next.mock.calls.length).toBe(0)

      api.options.ssr = false
    })

    test(`should invoke fallBack:
      1) req._forceFallback is undefined
      2) meta.ssr is false
      3) api.options.fallbackSpaHandler is exists
      4) api.isProd is false
    `, () => {
      fallbackSpa(api)
      orignalPreHandler(req, res, next)
      expect(api.getRouteMeta.mock.calls.length).toBe(1)
      expect(api.getRouteMeta.mock.calls[0][0]).toBe(req.url)
      expect(api.logger.debug.mock.calls.length).toBe(1)
      expect(api.logger.debug.mock.calls[0][0]).toBe(' Fall back SPA mode, url is: url of req')
      expect(api.options.fallbackSpaHandler.mock.calls.length).toBe(1)
      expect(next.mock.calls.length).toBe(0)
    })

    test(`should not invoke fallBack:
      1) req._forceFallback is undefined
      2) meta.ssr is true
      3) api.options.fallbackSpaHandler is exists
      4) api.isProd is false
    `, () => {
      fallbackSpa(api)
      orignalPreHandler(req, res, next)

      expect(api.getRouteMeta.mock.calls.length).toBe(1)
      expect(api.getRouteMeta.mock.calls[0][0]).toBe(req.url)
      expect(api.logger.debug.mock.calls.length).toBe(0)
      expect(next.mock.calls.length).toBe(1)
    })

    test(`should invoke fallBack:
      1) req._forceFallback is true
      2) meta.ssr is true
      3) api.options.fallbackSpaHandler is exists
      4) api.isProd is false
    `, () => {
      req._forceFallback = true

      fallbackSpa(api)
      orignalPreHandler(req, res, next)

      expect(api.getRouteMeta.mock.calls.length).toBe(1)
      expect(api.getRouteMeta.mock.calls[0][0]).toBe(req.url)
      expect(api.logger.debug.mock.calls.length).toBe(1)
      expect(api.logger.debug.mock.calls[0][0]).toBe('Force Fall back SPA mode, url is: url of req')
      expect(api.options.fallbackSpaHandler.mock.calls.length).toBe(1)
      expect(next.mock.calls.length).toBe(0)

      req._forceFallback = false
    })

    test(`should invoke fallBack:
      1) req._forceFallback is true
      2) meta.ssr is true
      3) api.options.fallbackSpaHandler is not exists
      4) api.isProd is false
    `, () => {
      req._forceFallback = true
      delete api.options.fallbackSpaHandler

      const html = '<html>...</html'
      const filename = 'filename'
      const orignalReqUrl = 'url of req'

      api.devMiddleware.fileSystem.readFileSync.mockReturnValueOnce(html)
      api.devMiddleware.getFilenameFromUrl.mockReturnValueOnce(filename)

      fallbackSpa(api)
      orignalPreHandler(req, res, next)

      expect(api.getRouteMeta.mock.calls.length).toBe(1)
      expect(api.getRouteMeta.mock.calls[0][0]).toBe(orignalReqUrl)
      expect(api.logger.debug.mock.calls.length).toBe(1)
      expect(api.logger.debug.mock.calls[0][0]).toBe('Force Fall back SPA mode, url is: url of req')
      expect(api.devMiddleware.fileSystem.readFileSync.mock.calls.length).toBe(1)
      expect(api.devMiddleware.fileSystem.readFileSync.mock.calls[0][0]).toBe(filename)
      expect(api.devMiddleware.getFilenameFromUrl.mock.calls.length).toBe(1)
      expect(api.devMiddleware.getFilenameFromUrl.mock.calls[0][0]).toBe(req.url)
      expect(next.mock.calls.length).toBe(0)
      expect(req.url).toBe('/your.public.path/index.html')
      expect(res.setHeader.mock.calls.length).toBe(1)
      expect(res.end.mock.calls.length).toBe(1)
      expect(res.end.mock.calls[0][0]).toBe(html)

      req._forceFallback = false
      req.url = orignalReqUrl
      api.options.fallbackSpaHandler = fallbackSpaHandler
    })

    test(`should invoke fallBack:
      1) req._forceFallback is true
      2) meta.ssr is true
      3) api.options.fallbackSpaHandler is not exists
      4) api.isProd is true
    `, () => {
      req._forceFallback = true
      api.isProd = true
      delete api.options.fallbackSpaHandler

      const orignalReqUrl = 'url of req'
      const expectedReqUrl = '/index.html'

      fallbackSpa(api)
      orignalPreHandler(req, res, next)

      expect(api.getRouteMeta.mock.calls.length).toBe(1)
      expect(api.getRouteMeta.mock.calls[0][0]).toBe(orignalReqUrl)
      expect(api.logger.debug.mock.calls.length).toBe(1)
      expect(api.logger.debug.mock.calls[0][0]).toBe('Force Fall back SPA mode, url is: url of req')
      expect(serveStatic.mock.calls.length).toBe(1)
      expect(serveStatic.mock.calls[0][0]).toBe('dist')
      expect(serveStatic.mock.calls[0][1]).toBe(expectedReqUrl.substr(1))
      expect(mockServerStatic.mock.calls.length).toBe(1)
      expect(mockServerStatic.mock.calls[0][2]).toBe(expectedFinalHandler)
      expect(next.mock.calls.length).toBe(0)
      expect(req.url).toBe(expectedReqUrl)
      req._forceFallback = false
      api.isProd = false
      req.url = orignalReqUrl
      api.options.fallbackSpaHandler = fallbackSpaHandler
    })
  })

  describe('afterHandler: ', () => {
    beforeAll(() => {
    })

    afterEach(() => {
      api.logger.debug.mockClear()
      api.options.fallbackSpaHandler.mockClear()
      next.mockClear()
      finalhandler.mockClear()
    })

    test(`should not invoke fallBack:
      1) api.options.fallBackSpa is false
      2) err.isVapper is undefined
      3) api.options.fallbackSpaHandler is exists
      4) api.isProd is false
    `, () => {
      fallbackSpa(api)
      orignalAfterHandler(null, req, res, next)

      expect(next.mock.calls.length).toBe(1)
    })

    test(`should not invoke fallBack:
      1) api.options.fallBackSpa is true
      2) err.isVapper is undefined
      3) api.options.fallbackSpaHandler is exists
      4) api.isProd is false
    `, () => {
      api.options.fallBackSpa = true

      fallbackSpa(api)
      orignalAfterHandler(null, req, res, next)

      expect(next.mock.calls.length).toBe(1)

      api.options.fallBackSpa = false
    })

    test(`should not invoke fallBack:
      1) api.options.fallBackSpa is true
      2) err.isVapper is false
      3) api.options.fallbackSpaHandler is exists
      4) api.isProd is false
    `, () => {
      api.options.fallBackSpa = true

      fallbackSpa(api)
      orignalAfterHandler({ isVapper: false }, req, res, next)

      expect(next.mock.calls.length).toBe(1)

      api.options.fallBackSpa = false
    })

    test(`should invoke fallBack:
      1) api.options.fallBackSpa is true
      2) err.isVapper is true
      3) api.options.fallbackSpaHandler is exists
      4) api.isProd is false
    `, () => {
      api.options.fallBackSpa = true

      fallbackSpa(api)
      orignalAfterHandler({ isVapper: true }, req, res, next)

      expect(api.logger.debug.mock.calls.length).toBe(2)
      expect(api.logger.debug.mock.calls[0][0]).toBe('Server rendering encountered an error:')
      expect(api.logger.debug.mock.calls[1][0]).toBe(`Will fall back SPA mode, url is: ${req.url}`)
      expect(api.options.fallbackSpaHandler.mock.calls.length).toBe(1)
      expect(next.mock.calls.length).toBe(0)

      api.options.fallBackSpa = false
    })
  })
})
