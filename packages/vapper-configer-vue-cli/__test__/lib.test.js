const webpackConfig = require('@vapper/webpack-config')
const Service = require('@vue/cli-service')
const Configer = require('../lib')

jest.mock('@vapper/webpack-config')
jest.mock('@vue/cli-service')

webpackConfig.base = jest.fn()
webpackConfig.server = jest.fn()
webpackConfig.client = jest.fn()

const mockServiceInstanceInit = jest.fn()
const mockServiceInstanceResolveWebpackConfig = jest.fn()
const mockServiceInstanceWebpackChainFuns = {
  push: jest.fn(),
  splice: jest.fn(),
  indexOf: jest.fn()
}

Service.mockImplementation(() => ({
  init: mockServiceInstanceInit,
  webpackChainFns: mockServiceInstanceWebpackChainFuns,
  resolveWebpackConfig: mockServiceInstanceResolveWebpackConfig
}))

describe('lib: ', () => {
  const noop = () => {}
  const api = {
    logger: noop,
    ENV_OBJECT: {
      production: 'production',
      test: 'test',
      development: 'development'
    },
    resolveCore: jest.fn(),
    isProd: false,
    options: {
      vueCliMode: 'test',
      mode: 'test'
    }
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('constructor and methods', () => {
    const instance = new Configer(api)

    // constructor
    expect(instance.mode).toBe(api.options.vueCliMode)
    expect(instance.service.init.mock.calls.length).toBe(1)
    expect(instance.service.init.mock.calls[0][0]).toBe(api.options.vueCliMode)
    expect(instance.service.webpackChainFns.push.mock.calls.length).toBe(1)

    // method: addFn
    instance.addFn(noop)
    expect(instance.service.webpackChainFns.push.mock.calls.length).toBe(2)
    expect(instance.service.webpackChainFns.push.mock.calls[1][0]).toBe(noop)

    // method: removeFn
    instance.removeFn(noop)
    expect(instance.service.webpackChainFns.indexOf.mock.calls.length).toBe(1)
    expect(instance.service.webpackChainFns.splice.mock.calls.length).toBe(1)

    // mock addFn & removeFn
    instance.addFn = jest.fn()
    instance.removeFn = jest.fn()

    // method: getServerConfig
    instance.getServerConfig()
    expect(instance.service.resolveWebpackConfig.mock.calls.length).toBe(1)
    expect(instance.addFn.mock.calls.length).toBe(1)
    expect(instance.removeFn.mock.calls.length).toBe(1)

    // method: getClientConfig
    instance.getClientConfig()
    expect(instance.service.resolveWebpackConfig.mock.calls.length).toBe(2)
    expect(instance.addFn.mock.calls.length).toBe(2)
    expect(instance.removeFn.mock.calls.length).toBe(2)

    // mock config

    const mockOriginJsRuleFn = jest.fn()
    const config = {
      plugin: jest.fn(),
      use: jest.fn(),
      module: {
        rule: jest.fn()
      },
      uses: {
        delete: jest.fn()
      },
      tap: jest.fn(),
      test: jest.fn(),
      exclude: {
        store: [mockOriginJsRuleFn],
        clear: jest.fn()
      },
      add: jest.fn(),
      init: jest.fn(),
      entryPoints: {
        delete: jest.fn()
      },
      entry: jest.fn(),
      clear: jest.fn(),
      when: jest.fn()
    }

    config.plugin.mockReturnValue(config)
    config.module.rule.mockReturnValue(config)
    config.test.mockReturnValue(config)
    config.exclude.clear.mockReturnValue(config)

    // method: baseChainFn
    instance.baseChainFn(config)
    expect(config.plugin.mock.calls.length).toBe(3)
    expect(config.plugin.mock.calls[0][0]).toBe('PrintStatusPlugin')
    expect(config.plugin.mock.calls[1][0]).toBe('define')
    expect(config.plugin.mock.calls[2][0]).toBe('friendly-errors')
    expect(config.use.mock.calls.length).toBe(1)
    expect(config.use.mock.calls[0][1][0].printFileStats).toBe(true)
    expect(config.use.mock.calls[0][1][0].logger).toBe(api.logger)
    expect(config.module.rule.mock.calls.length).toBe(3)
    expect(config.module.rule.mock.calls[0][0]).toBe('vue')
    expect(config.module.rule.mock.calls[1][0]).toBe('js')
    expect(config.module.rule.mock.calls[2][0]).toBe('js')
    expect(config.uses.delete.mock.calls.length).toBe(1)
    expect(config.uses.delete.mock.calls[0][0]).toBe('cache-loader')
    expect(config.tap.mock.calls.length).toBe(1)

    const tapArgFn = config.tap.mock.calls[0][0]
    const args = [{
      'process.env': {
        VAPPER_TARGET: null,
        VAPPER_ENV: null
      },
      'process.server': null,
      'process.browser': null,
      'process.client': null
    }]
    const result = tapArgFn(args)

    expect(result[0]['process.env']['VAPPER_TARGET']).toBeUndefined()
    expect(result[0]['process.env']['VAPPER_ENV']).toBeUndefined()
    Object.keys(api.ENV_OBJECT).forEach(k => {
      expect(result[0]['process.env'][k]).toBe(JSON.stringify(api.ENV_OBJECT[k]))
    })
    expect(result[0]['process.server']).toBe(false)
    expect(result[0]['process.browser']).toBe(false)
    expect(result[0]['process.client']).toBe(false)

    expect(config.test.mock.calls.length).toBe(2)
    expect(config.test.mock.calls[0][0].toString()).toBe(/\.m?jsx?$/.toString())
    expect(config.test.mock.calls[1][0].toString()).toBe(/\.m?jsx?$/.toString())
    expect(config.exclude.clear.mock.calls.length).toBe(1)
    expect(config.exclude.clear.mock.calls[0][0]).toBeUndefined()

    const addArgFn = config.add.mock.calls[0][0]
    mockOriginJsRuleFn.mockReturnValue(true)
    expect(addArgFn('biz')).toBe(true)
    expect(addArgFn('@vapper/foo')).toBe(false)

    // method: clientChainFn
    config.entry.mockReturnValue(config)
    config.clear.mockReturnValue(config)
    config.when.mockReturnValue(config)

    instance.clientChainFn(config)
    expect(webpackConfig.client.mock.calls.length).toBe(1)
    expect(config.entryPoints.delete.mock.calls.length).toBe(1)
    expect(config.entryPoints.delete.mock.calls[0][0]).toBe('index')
    expect(config.entry.mock.calls.length).toBe(1)
    expect(config.entry.mock.calls[0][0]).toBe('app')
    expect(config.clear.mock.calls.length).toBe(1)
    expect(config.clear.mock.calls[0][0]).toBeUndefined()
    expect(config.when.mock.calls.length).toBe(1)
    expect(config.when.mock.calls[0][0]).toBe(true)
    const whenArgFn = config.when.mock.calls[0][1]
    const arg = {
      add: jest.fn()
    }
    whenArgFn(arg)
    expect(arg.add.mock.calls.length).toBe(1)
  })
})
