const Vapper = require('@vapper/core')
const fs = require('fs-extra')
const Builder = require('../lib/Builder')
const { createBundleRenderer } = require('vue-server-renderer')
const connect = require('connect')
const compression = require('compression')

jest.mock('fs-extra')
jest.mock('../lib/Builder')
jest.mock('vue-server-renderer')
jest.mock('connect')
jest.mock('compression')

// mock fs-extra
fs.readFileSync.mockReturnValue('{}')

// mock renderToString
const mockRenderToString = jest.fn().mockImplementation((ctx, fn) => {
  const err = { code: 'FAKE', router: { mockRouter: true } }
  fn(err, '')
})
createBundleRenderer.mockImplementation(() => {
  return {
    renderToString: mockRenderToString
  }
})

// mock connect's use
const mockUseFn = jest.fn()
connect.mockImplementation(() => ({ use: mockUseFn }))

// mock compression middleware
const compressionHandler = () => {}
compression.mockImplementation(() => {
  return compressionHandler
})

beforeEach(() => {
  fs.readFileSync.mockClear()
  fs.writeFileSync.mockClear()
  Builder.mockClear()
  Builder.mockRun.mockClear()
  Builder.mockOn.mockClear()
  createBundleRenderer.mockClear()
  connect.mockClear()
  compression.mockClear()
  mockUseFn.mockClear()
  mockRenderToString.mockClear()
})

describe('Dev mode: ', () => {
  test('Enhance files should be generated correctly', async () => {
    const vapper = new Vapper({ mode: 'development' })
    await vapper.generateEnhanceFile()

    expect(fs.writeFileSync.mock.calls.length).toBe(2)
    expect(fs.writeFileSync.mock.calls[0][0]).toBe(vapper.enhanceClientOutput)
    expect(fs.writeFileSync.mock.calls[0][1]).toMatchSnapshot()
    expect(fs.writeFileSync.mock.calls[1][0]).toBe(vapper.enhanceServerOutput)
    expect(fs.writeFileSync.mock.calls[1][1]).toMatchSnapshot()
  })

  test('Should be built correctly', async () => {
    const vapper = new Vapper({ mode: 'development' })

    await vapper.build()

    expect(Builder.mockRun.mock.calls.length).toBe(1)

    // createBundleRenderer
    expect(createBundleRenderer.mock.calls.length).toBe(1)
    expect(createBundleRenderer.mock.calls[0][0]).toEqual({}/* serverBundle */)
    expect(createBundleRenderer.mock.calls[0][1]).toEqual({
      runInNewContext: false,
      template: vapper.template,
      clientManifest: {}
    })

    // Listening change event
    expect(Builder.mockOn.mock.calls.length).toBe(1)
    expect(Builder.mockOn).toBeCalledWith('change', expect.any(Function))

    // Dev middlewares
    expect(vapper.devMiddleware).toEqual(Builder.mockDevMiddleware)
    expect(vapper.hotMiddleware).toEqual(Builder.mockHotMiddleware)
  })

  test('Should setup correctly', async () => {
    const vapper = new Vapper({ mode: 'development' })
    const mockBeforeSetupHook = jest.fn()
    const mockAfterSetupHook = jest.fn()
    vapper.hookInto('before:setup', mockBeforeSetupHook)
    vapper.hookInto('after:setup', mockAfterSetupHook)
    await vapper.setup()

    expect(mockRenderToString).toBeCalledWith({ fake: true }, expect.any(Function))
    expect(vapper.router).toEqual({ mockRouter: true })

    // hooks
    expect(mockBeforeSetupHook).toHaveBeenCalledTimes(1)
    expect(mockAfterSetupHook).toHaveBeenCalledTimes(1)

    // init middlewares
    expect(mockUseFn.mock.calls.length).toBe(9)
    expect(mockUseFn.mock.calls[0][0]).toEqual(compressionHandler)
    expect(mockUseFn.mock.calls[1][0]).toEqual(vapper.devMiddleware)
    expect(mockUseFn.mock.calls[2][0]).toEqual(vapper.hotMiddleware)
    expect(mockUseFn.mock.calls[3][0].__name).toBe('serve_static')
    expect(mockUseFn.mock.calls[4][0].__name).toBe('fallback_spa_pre')
    expect(mockUseFn.mock.calls[5][0].__name).toBe('micro_caching_pre')
    expect(mockUseFn.mock.calls[6][0].name).toMatch(/render/)
    expect(mockUseFn.mock.calls[7][0].__name).toBe('fallback_spa_after')
    expect(mockUseFn.mock.calls[8][0].__name).toBe('micro_caching_after')
  })
})

describe('Prod mode: ', () => {
  test('Should be built correctly', async () => {
    const vapper = new Vapper({ mode: 'production' })

    await vapper.build()

    expect(Builder.mockRun.mock.calls.length).toBe(1)
  })

  test('Should setup correctly', async () => {
    const vapper = new Vapper({ mode: 'production' })
    const mockBeforeSetupHook = jest.fn()
    const mockAfterSetupHook = jest.fn()
    vapper.hookInto('before:setup', mockBeforeSetupHook)
    vapper.hookInto('after:setup', mockAfterSetupHook)
    await vapper.setup()

    expect(mockRenderToString).toBeCalledWith({ fake: true }, expect.any(Function))
    expect(vapper.router).toEqual({ mockRouter: true })

    // hooks
    expect(mockBeforeSetupHook).toHaveBeenCalledTimes(1)
    expect(mockAfterSetupHook).toHaveBeenCalledTimes(1)

    // init middlewares
    expect(mockUseFn.mock.calls.length).toBe(7)
    expect(mockUseFn.mock.calls[0][0]).toEqual(compressionHandler)
    expect(mockUseFn.mock.calls[1][0].__name).toBe('serve_static')
    expect(mockUseFn.mock.calls[2][0].__name).toBe('fallback_spa_pre')
    expect(mockUseFn.mock.calls[3][0].__name).toBe('micro_caching_pre')
    expect(mockUseFn.mock.calls[4][0].name).toMatch(/render/)
    expect(mockUseFn.mock.calls[5][0].__name).toBe('fallback_spa_after')
    expect(mockUseFn.mock.calls[6][0].__name).toBe('micro_caching_after')
  })
})
