const path = require('path')
const Vapper = require('@vapper/core')
const serveStaticPlugin = require('../lib/plugins/serveStatic')
const fallbackSpaPlugin = require('../lib/plugins/fallbackSpa')
const microCachingPlugin = require('../lib/plugins/microCaching')

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
