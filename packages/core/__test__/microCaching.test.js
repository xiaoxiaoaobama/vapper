const microCaching = require('../lib/plugins/microCaching')
const LRU = require('lru-cache')
const mockMicroCacheGet = jest.fn()
const mockMicroCacheSet = jest.fn()
const cacheable = jest.fn()

jest.mock('lru-cache', () => jest.fn())

LRU.mockImplementation(() => ({
  get: mockMicroCacheGet,
  set: mockMicroCacheSet
}))

describe('fallbackSpa: ', () => {
  let orignalPreHandler = () => {}
  let orignalAfterHandler = () => {}
  const mockPreHandler = jest.fn()
  const mockAfterHandler = jest.fn()
  const handlersMap = {
    micro_caching_pre: mockPreHandler,
    micro_caching_after: mockAfterHandler
  }
  const req = {
    url: 'url of req'
  }
  const res = {
    setHeader: jest.fn(),
    end: jest.fn()
  }
  const next = jest.fn()
  const api = {
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
    htmlContent: 'content of html'
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

  test(`init microCaching should succeed:
    1) cacheable should return false
    2) cacheOptions.max is default(100)
    3) cacheOptions.maxAge is default(1000)
  `, () => {
    cacheable.mockReturnValueOnce(false)

    microCaching(api, { cacheable })
    expect(LRU.mock.calls.length).toBe(1)
    expect(mockPreHandler.mock.calls.length).toBe(1)
    expect(mockAfterHandler.mock.calls.length).toBe(1)

    orignalPreHandler(req, res, next)
    expect(next.mock.calls.length).toBe(1)

    orignalAfterHandler(req, res, next)
    expect(next.mock.calls.length).toBe(2)
  })

  test('init microCaching should succeed: cacheable should return true', () => {
    cacheable.mockReturnValueOnce(true)

    microCaching(api, { cacheOptions: { max: 200, maxAge: 2000 }, cacheable })

    expect(LRU.mock.calls.length).toBe(1)

    mockMicroCacheGet.mockReturnValueOnce(true)

    orignalPreHandler(req, res, next)

    expect(next.mock.calls.length).toBe(0)
    expect(mockMicroCacheGet.mock.calls.length).toBe(1)
    expect(mockMicroCacheGet.mock.calls[0][0]).toBe(req.url)
    expect(mockMicroCacheGet.mock.results[0].value).toBe(true)
    expect(api.logger.debug.mock.calls.length).toBe(1)
    expect(res.setHeader.mock.calls.length).toBe(1)
    expect(res.end.mock.calls.length).toBe(1)

    orignalAfterHandler(req, res, next)

    expect(mockMicroCacheSet.mock.calls.length).toBe(1)
    expect(mockMicroCacheSet.mock.calls[0][0]).toBe(req.url)
    expect(mockMicroCacheSet.mock.calls[0][1]).toBe(api.htmlContent)
  })
})
