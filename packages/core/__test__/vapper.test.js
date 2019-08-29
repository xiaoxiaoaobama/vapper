const path = require('path')
const Vapper = require('@vapper/core')
const cac = require('cac')()
const { options: defaultOptions } = require('../lib/options')
const PluginApi = require('../lib/PluginApi')
const Builder = require('../lib/Builder')
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

test('Ensure static properties and methods of the Vapper class', () => {
  expect(Vapper.defaultOptions).toEqual(defaultOptions)
  expect(Vapper.PluginApi).toEqual(PluginApi)
  expect(Vapper.cli).toEqual(cac)
})

test('The Vapper class should be instantiated correctly', () => {
  const options = {}
  const vapper = new Vapper(options)

  // options
  expect(vapper.defaultOptions).toEqual(defaultOptions)
  expect(vapper.options).toEqual(defaultOptions)

  // instance
  expect(vapper instanceof PluginApi).toBe(true)
  expect(vapper.builder instanceof Builder).toBe(true)

  expect(vapper.handler).toEqual(vapper.app)
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
