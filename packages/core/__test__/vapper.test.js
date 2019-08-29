const Vapper = require('@vapper/core')
const cac = require('cac')()
const { options: defaultOptions } = require('../lib/options')
const PluginApi = require('../lib/PluginApi')
const Builder = require('../lib/Builder')

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
