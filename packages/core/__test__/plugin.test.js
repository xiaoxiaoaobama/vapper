const path = require('path')
const Vapper = require('@vapper/core')
const serveStaticPlugin = require('../lib/plugins/serveStatic')
const fallbackSpaPlugin = require('../lib/plugins/fallbackSpa')
const microCachingPlugin = require('../lib/plugins/microCaching')
const PluginApi = require('../lib/PluginApi')

// mock a plugin
const pluginA = path.resolve(__dirname, './__fixtures__/pluginA.js')
jest.mock(pluginA)
const pluginAFn = require(pluginA)

beforeEach(() => {
  pluginAFn.mockClear()
})

test('The built-in plugin should be initialized correctly', () => {
  const vapper = new Vapper()

  expect(vapper.buildInPlugins.length).toBe(3)
  expect(vapper.buildInPlugins).toEqual([
    serveStaticPlugin,
    fallbackSpaPlugin,
    [microCachingPlugin, vapper.options.pageCache]
  ])
})

test('Function type plugin should be initialized correctly', () => {
  const pluginA = jest.fn()
  const options = {
    plugins: [pluginA]
  }

  const vapper = new Vapper(options)

  expect(pluginA.mock.calls[0][0]).toEqual(vapper)
})

test('Function type plugin with parameters should be initialized correctly', () => {
  const pluginA = jest.fn()
  const pluginOptions = {}
  const options = {
    plugins: [
      [pluginA, pluginOptions]
    ]
  }

  const vapper = new Vapper(options)

  expect(pluginA.mock.calls[0][0]).toEqual(vapper)
  expect(pluginA.mock.calls[0][1]).toEqual(pluginOptions)
})

test('String type plugin should be initialized correctly', () => {
  const options = {
    plugins: [pluginA]
  }

  const vapper = new Vapper(options)

  expect(pluginAFn.mock.calls[0][0]).toEqual(vapper)
})

test('String type plugin with parameters should be initialized correctly', () => {
  const pluginOptions = {}
  const options = {
    plugins: [
      [pluginA, pluginOptions]
    ]
  }

  const vapper = new Vapper(options)

  expect(pluginAFn.mock.calls[0][0]).toEqual(vapper)
  expect(pluginAFn.mock.calls[0][1]).toEqual(pluginOptions)
})

test('Enhancement files should be added correctly', () => {
  const enhanceObj = {
    client: 'client.js',
    server: 'server.js',
    clientModuleName: 'test'
  }
  const enhancePlugin = jest.fn(function (api) {
    api.addEnhanceFile(enhanceObj)
  })
  const options = {
    plugins: [enhancePlugin]
  }

  const vapper = new Vapper(options)

  expect(vapper.enhanceFiles instanceof Set).toBe(true)
  expect(vapper.enhanceFiles.size).toBe(1)
  expect(vapper.enhanceFiles).toContain(enhanceObj)
})

test('Add and call hooks correctly', () => {
  const pluginApi = new PluginApi()
  const hookFn = jest.fn()
  pluginApi.hookInto('hookName', hookFn)
  pluginApi.invokeHook('hookName', 'args')

  expect(hookFn.mock.calls.length).toBe(1)
  expect(hookFn.mock.calls[0][0]).toBe('args')
})

test('Add middleware correctly', () => {
  const pluginApi = new PluginApi()
  const mw1 = () => {}
  const mw2 = () => {}
  pluginApi.use(mw1)
  pluginApi.use('after:render', mw2)

  expect(pluginApi.middlewares['before:render'] instanceof Set).toBe(true)
  expect(pluginApi.middlewares['after:render'] instanceof Set).toBe(true)
  expect(pluginApi.middlewares['before:render'].size).toBe(1)
  expect(pluginApi.middlewares['after:render'].size).toBe(1)
  expect(pluginApi.middlewares['before:render']).toContain(mw1)
  expect(pluginApi.middlewares['after:render']).toContain(mw2)
})

test('Should pick the right dependency', () => {
  const pluginApi = new PluginApi()
  jest.mock(pluginApi.resolveCWD('package.json'))
  const deps = pluginApi.pickDependencies(/some-*/)

  expect(deps.length).toBe(2)
  expect(deps).toEqual(['some-dev-dep', 'some-dep'])
})

test('The configuration file should be loaded correctly', () => {
  const pluginApi = new PluginApi()

  jest.mock('fs-extra')
  const fs = require('fs-extra')
  fs.statSync.mockReturnValue({
    isFile: true
  })
  pluginApi.resolveCWD = jest.fn().mockReturnValue(
    path.resolve(process.cwd(), '__mocks__/vapper.config.js')
  )
  jest.mock(pluginApi.resolveCWD('vapper.config.js'))

  const config = pluginApi.loadConfig()

  expect(config).toEqual({
    ssr: true
  })
})

describe('getRouteInfo: ', () => {
  // mock router
  const fakePath = '/fake/path'
  const matchedRes = {
    resolved: { matched: [{ path: fakePath }], meta: {} }
  }
  const nonMatchedRes = {
    resolved: { matched: [], meta: {} }
  }
  const mockMatchedResolveFn = jest.fn()
  mockMatchedResolveFn.mockReturnValue(matchedRes)
  const mockNonMatchedResolveFn = jest.fn()
  mockNonMatchedResolveFn.mockReturnValue(nonMatchedRes)

  beforeEach(() => {
    mockMatchedResolveFn.mockClear()
    mockNonMatchedResolveFn.mockClear()
  })

  test('Should be able to get route information correctly', () => {
    const pluginApi = new PluginApi()
    pluginApi.router = { resolve: mockMatchedResolveFn }

    const routerInfo = pluginApi.getRouteInfo(fakePath)

    expect(mockMatchedResolveFn).toHaveBeenCalledWith({ path: fakePath })
    expect(routerInfo).toEqual(matchedRes.resolved)
  })

  test('The getRouteInfo function should return an empty object when there is no router instance', () => {
    const pluginApi = new PluginApi()
    expect(pluginApi.getRouteInfo(fakePath)).toEqual({})
  })

  test('The getRouteInfo function should return an empty object when the match fails.', () => {
    const pluginApi = new PluginApi()
    const meta = {}
    const resolved = { matched: [], meta }
    pluginApi.router = { resolve (path) { return { resolved } } }
    expect(pluginApi.getRouteInfo(fakePath)).toEqual({})
  })

  test('Routing meta should be obtained correctly', () => {
    const pluginApi = new PluginApi()
    pluginApi.router = { resolve: mockMatchedResolveFn }

    const routeMeta = pluginApi.getRouteMeta(fakePath)

    expect(mockMatchedResolveFn).toHaveBeenCalledWith({ path: fakePath })
    expect(routeMeta).toEqual({})
  })

  test('The getRouteMeta function should return null when there is no router instance', () => {
    const pluginApi = new PluginApi()
    expect(pluginApi.getRouteMeta(fakePath)).toBeNull()
  })

  test('The getRouteMeta function should return an empty object when the match fails.', () => {
    const pluginApi = new PluginApi()
    pluginApi.router = { resolve: mockNonMatchedResolveFn }

    const routeMeta = pluginApi.getRouteMeta(fakePath)

    expect(mockNonMatchedResolveFn).toHaveBeenCalledWith({ path: fakePath })
    expect(routeMeta).toBeNull()
  })
})
