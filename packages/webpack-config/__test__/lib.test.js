const base = require('../lib/base')
const TimeFixPlugin = require('time-fix-plugin')

jest.mock('time-fix-plugin')

describe('lib:', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  test('base:', () => {
    const api = {
      resolveCWD: jest.fn(),
      resolveCore: jest.fn(),
      options: {
        entry: 'entry'
      },
      isProd: false,
      publicPath: ''
    }

    const returnValueOfApiResovleCWD = '/current/work/dirctory'
    api.resolveCWD.mockReturnValue(returnValueOfApiResovleCWD)
    const returnValueOfApiResolveCore = '/core/path'
    api.resolveCore.mockReturnValue(returnValueOfApiResolveCore)

    const config = {
      resolve: {
        alias: {
          set: jest.fn()
        }
      },
      output: {
        get: jest.fn(),
        publicPath: jest.fn()
      },
      module: {
        rule: jest.fn(),
        use: jest.fn(),
        loader: jest.fn(),
        tap: jest.fn(),
        exclude: {
          add: jest.fn()
        }
      },
      plugins: {
        delete: jest.fn()
      },
      plugin: jest.fn(),
      use: jest.fn(),
      optimization: {
        runtimeChunk: jest.fn()
      }
    }

    config.resolve.alias.set.mockReturnValue(config.resolve.alias)
    config.module.rule.mockReturnValue(config.module)
    config.module.use.mockReturnValue(config.module)
    config.module.loader.mockReturnValue(config.module)
    config.module.exclude.add.mockReturnValue(config.module.exclude)
    config.plugin.mockReturnValue(config)
    const returnValueOfConfigOutputGet = '/public/path'
    config.output.get.mockReturnValue(returnValueOfConfigOutputGet)

    base(api, config)

    expect(config.resolve.alias.set.mock.calls.length).toBe(3)
    expect(config.resolve.alias.set.mock.calls[0][0]).toBe('#')
    expect(config.resolve.alias.set.mock.calls[0][1]).toBe(returnValueOfApiResovleCWD)
    expect(config.resolve.alias.set.mock.calls[1][0]).toBe('#entry$')
    expect(config.resolve.alias.set.mock.calls[1][1]).toBe(returnValueOfApiResovleCWD)
    expect(config.resolve.alias.set.mock.calls[2][0]).toBe('vue$')
    expect(config.resolve.alias.set.mock.calls[2][1]).toBe(returnValueOfApiResovleCWD)
    expect(config.output.get.mock.calls.length).toBe(1)
    expect(config.output.get.mock.calls[0][0]).toBe('publicPath')
    expect(config.output.publicPath.mock.calls.length).toBe(1)
    expect(config.output.publicPath.mock.calls[0][0]).toBe(returnValueOfConfigOutputGet)
    expect(config.module.rule.mock.calls.length).toBe(2)
    expect(config.module.rule.mock.calls[0][0]).toBe('vue')
    expect(config.module.rule.mock.calls[1][0]).toBe('eslint')
    expect(config.module.use.mock.calls.length).toBe(1)
    expect(config.module.use.mock.calls[0][0]).toBe('vue-loader')
    expect(config.module.loader.mock.calls.length).toBe(1)
    expect(config.module.loader.mock.calls[0][0]).toBe('vue-loader')
    expect(config.module.tap.mock.calls.length).toBe(1)
    expect(config.module.exclude.add.mock.calls.length).toBe(2)
    expect(config.module.exclude.add.mock.calls[0][0]).toBe(returnValueOfApiResolveCore)
    expect(config.module.exclude.add.mock.calls[1][0]).toBe(returnValueOfApiResolveCore)
    expect(config.plugins.delete.mock.calls.length).toBe(1)
    expect(config.plugins.delete.mock.calls[0][0]).toBe('progress')
    expect(TimeFixPlugin.__expression).toBe(`require('time-fix-plugin')`)
    expect(config.plugin.mock.calls.length).toBe(1)
    expect(config.plugin.mock.calls[0][0]).toBe('timefix')
    expect(config.use.mock.calls.length).toBe(1)
    expect(config.optimization.runtimeChunk.mock.calls.length).toBe(1)
    expect(config.optimization.runtimeChunk.mock.calls[0][0]).toBe(true)
  })
})
