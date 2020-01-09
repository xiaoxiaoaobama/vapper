const PrintStatusPlugin = require('../lib/PrintStatusPlugin')
const prettyBytes = require('../lib/PrintStatusPlugin/prettyBytes')
const path = require('path')
const chalk = require('chalk')
const gzipSize = require('gzip-size')
const textTable = require('text-table')

jest.mock('gzip-size')
jest.mock('chalk')
jest.mock('path')
jest.mock('../lib/PrintStatusPlugin/prettyBytes')
jest.mock('text-table')

chalk.bold = jest.fn()
chalk.green = jest.fn()
path.relative = jest.fn()
path.join = jest.fn()
path.dirname = jest.fn()
path.basename = jest.fn()

gzipSize.mockReturnValue(1)
path.join.mockReturnValue('')
chalk.green.mockReturnValue('')
chalk.bold.mockReturnValue('')
textTable.mockReturnValue('')
prettyBytes.mockReturnValue('')

describe('PrintStatusPlugin: ', () => {
  let logger
  let stats
  let compiler

  beforeAll(() => {
    logger = {
      log: jest.fn(),
      info: jest.fn(),
      options: {
        debug: false
      }
    }

    stats = {
      hasErrors: jest.fn(),
      hasWarnings: jest.fn(),
      endTime: 2,
      startTime: 1,
      toJson: () => {
        return {
          assets: [{ name: 'some.png', size: 1 }]
        }
      },
      compilation: {
        assets: {
          'some.png': {
            source: jest.fn()
          }
        }
      }
    }

    compiler = {
      hooks: {
        done: {
          tapPromise: (title, cb) => {
            return cb(stats)
          }
        }
      },
      options: {
        output: {
          path: 'foo/bar'
        }
      }
    }
  })

  afterEach(() => {
    jest.resetAllMocks()
    logger.options.debug = false
  })

  test(`constructor without opt`, () => {
    const instance = new PrintStatusPlugin()

    expect(instance).toBeInstanceOf(PrintStatusPlugin)
    expect(instance.opts).toEqual({})
    expect(instance.logger).toBeUndefined()
  })

  test(`apply with error and waring`, () => {
    const opt = { logger, printSucessMessage: true }
    const instance = new PrintStatusPlugin(opt)
    stats.hasErrors.mockReturnValue(1)
    stats.hasWarnings.mockReturnValue(1)

    expect(instance).toBeInstanceOf(PrintStatusPlugin)
    expect(instance.opts).toEqual(opt)

    instance.apply(compiler)
    expect(logger.info.mock.calls.length).toBe(0)
    expect(gzipSize.mock.calls.length).toBe(0)
  })

  test(`apply enable opt.printSucessMessage`, () => {
    const opt = { logger, printSucessMessage: true }
    const instance = new PrintStatusPlugin(opt)

    expect(instance).toBeInstanceOf(PrintStatusPlugin)
    expect(instance.opts).toEqual(opt)

    instance.apply(compiler)
    expect(logger.info.mock.calls.length).toBe(1)
    expect(gzipSize.mock.calls.length).toBe(0)
    expect(logger.info.mock.calls[0][0]).toBe('Build completed in 1ms')
  })

  test(`apply enable opt.printFileStats`, async () => {
    logger.options.debug = true
    process.stdout.isTTY = true
    const opt = { logger, printFileStats: true }
    const instance = new PrintStatusPlugin(opt)

    expect(instance).toBeInstanceOf(PrintStatusPlugin)
    expect(instance.opts).toEqual(opt)

    instance.apply(compiler)
    expect(logger.info.mock.calls.length).toBe(0)
    delete (process.stdout.isTTY)
  })
})
