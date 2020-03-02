const Vapper = require('@vapper/core')
const { createBundleRenderer } = require('vue-server-renderer')
const fs = require('fs-extra')
const cac = require('cac')()
const { options: defaultOptions } = require('../lib/options')
const PluginApi = require('../lib/PluginApi')
const Builder = require('../lib/Builder')

jest.mock('vue-server-renderer')
jest.mock('fs-extra')

beforeEach(() => {
  createBundleRenderer.mockClear()
  fs.statSync.mockClear()
  fs.readFileSync.mockClear()
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

describe('Renderer tempalte', () => {
  test('The `template` option', () => {
    const options = {
      template: '<!--vue-ssr-outlet-->'
    }
    const vapper = new Vapper(options)

    const serverBundle = {}
    const clientManifest = {}

    vapper.createRenderer({
      serverBundle,
      clientManifest
    })

    expect(createBundleRenderer).toHaveBeenCalledWith(serverBundle, {
      ...vapper.options.rendererOptions,
      runInNewContext: false,
      template: '<!--vue-ssr-outlet-->',
      clientManifest
    })
  })

  test('The `templatePath` option', () => {
    // mock
    fs.statSync.mockReturnValue({
      isFile: true
    })
    fs.readFileSync.mockReturnValue('<!--vue-ssr-outlet-->')

    const options = {
      templatePath: 'ssr.html'
    }
    const vapper = new Vapper(options)

    const serverBundle = {}
    const clientManifest = {}

    vapper.createRenderer({
      serverBundle,
      clientManifest
    })

    expect(createBundleRenderer).toHaveBeenCalledWith(serverBundle, {
      ...vapper.options.rendererOptions,
      runInNewContext: false,
      template: '<!--vue-ssr-outlet-->',
      clientManifest
    })
  })

  test('updateRender', () => {
    // mock
    fs.statSync.mockReturnValue({
      isFile: true
    })
    fs.readFileSync.mockReturnValue('<!--vue-ssr-outlet-->')

    const options = {
      templatePath: 'ssr.html'
    }
    const vapper = new Vapper(options)

    const serverBundle = {}
    const clientManifest = {}

    vapper.createRenderer({
      serverBundle,
      clientManifest
    })

    expect(createBundleRenderer).toHaveBeenCalledWith(serverBundle, {
      ...vapper.options.rendererOptions,
      runInNewContext: false,
      template: '<!--vue-ssr-outlet-->',
      clientManifest
    })

    // update 1
    const serverBundle2 = {}
    const clientManifest2 = {}
    vapper.updateRenderer({
      serverBundle: serverBundle2,
      clientManifest: clientManifest2
    })

    expect(createBundleRenderer).toHaveBeenCalledWith(serverBundle2, {
      ...vapper.options.rendererOptions,
      runInNewContext: false,
      template: '<!--vue-ssr-outlet-->',
      clientManifest: clientManifest2
    })

    // update 2
    vapper.template = '<div><!--vue-ssr-outlet--></div>'
    vapper.updateRenderer()

    expect(createBundleRenderer).toHaveBeenCalledWith(serverBundle2, {
      ...vapper.options.rendererOptions,
      runInNewContext: false,
      template: vapper.template,
      clientManifest: clientManifest2
    })
  })
})
