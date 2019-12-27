const chalk = require('chalk')
const Logger = require('../lib/Logger')

// mock chalk
jest.mock('chalk')
chalk.red = jest.fn().mockReturnValue('error')
chalk.yellow = jest.fn().mockReturnValue('warn')
chalk.magenta = jest.fn().mockReturnValue('debug')
chalk.cyan = jest.fn().mockReturnValue('tip')
chalk.green = jest.fn().mockReturnValue('info')

// mock console.error
const spyConsoleError = jest.spyOn(global.console, 'error').mockImplementation()

// mock logger
const mockLogger = jest.fn()
function createLogger () {
  return new Logger({
    logger: mockLogger
  })
}

// clear mock
afterEach(() => {
  mockLogger.mockClear()

  chalk.mockClear()
  chalk.red.mockClear()
  chalk.yellow.mockClear()
  chalk.magenta.mockClear()
  chalk.cyan.mockClear()
  chalk.green.mockClear()

  spyConsoleError.mockClear()
})

function runLogger (logger) {
  logger.log('log')
  logger.error('error')
  logger.warn('warn')
  logger.debug('debug')
  logger.tip('tip')
  logger.info('info')
}

function runLoggerWithFn (logger) {
  logger.log(() => 'log')
  logger.error(() => 'error')
  logger.warn(() => 'warn')
  logger.debug(() => 'debug')
  logger.tip(() => 'tip')
  logger.info(() => 'info')
}

describe('Logger: ', () => {
  test('setting the wrong level should console the error', () => {
    const logger = createLogger()
    logger.setLogLevel('string')

    expect(spyConsoleError).toHaveBeenCalledTimes(1)
  })

  test('lock `level` in unit test environment', () => {
    const logger = createLogger()
    logger.setLogLevel(3)

    expect(logger.logLevel).toBe(0)
  })

  test('set level to `0`', () => {
    const logger = createLogger()
    logger.setLogLevel(0)

    expect(logger.logLevel).toBe(0)
    runLogger(logger)
    expect(mockLogger.mock.calls.length).toBe(1)
    expect(mockLogger.mock.calls[0][0]).toBe('log')
  })

  test('set level to `1`', () => {
    const logger = createLogger()
    process.env.NODE_ENV = 'unlock'
    logger.setLogLevel(1)
    process.env.NODE_ENV = 'unittest'

    expect(logger.logLevel).toBe(1)
    runLogger(logger)
    expect(mockLogger.mock.calls.length).toBe(2)
    expect(mockLogger.mock.calls[0][0]).toBe('log')
    expect(mockLogger.mock.calls[1][0]).toBe('error')
    expect(chalk.red).toHaveBeenCalledTimes(1)
  })

  test('set level to `2`', () => {
    const logger = createLogger()
    process.env.NODE_ENV = 'unlock'
    logger.setLogLevel(2)
    process.env.NODE_ENV = 'unittest'

    expect(logger.logLevel).toBe(2)
    runLogger(logger)
    expect(mockLogger.mock.calls.length).toBe(3)
    expect(mockLogger.mock.calls[0][0]).toBe('log')
    expect(mockLogger.mock.calls[1][0]).toBe('error')
    expect(mockLogger.mock.calls[2][0]).toBe('warn')
    expect(chalk.yellow).toHaveBeenCalledTimes(1)
  })

  test('set level to `3`', () => {
    const logger = createLogger()
    process.env.NODE_ENV = 'unlock'
    logger.setLogLevel(3)
    process.env.NODE_ENV = 'unittest'

    expect(logger.logLevel).toBe(3)
    runLogger(logger)
    expect(mockLogger.mock.calls.length).toBe(4)
    expect(mockLogger.mock.calls[0][0]).toBe('log')
    expect(mockLogger.mock.calls[1][0]).toBe('error')
    expect(mockLogger.mock.calls[2][0]).toBe('warn')
    expect(mockLogger.mock.calls[3][0]).toBe('debug')
    expect(chalk.magenta).toHaveBeenCalledTimes(1)
  })

  test('set level to `4`', () => {
    const logger = createLogger()
    process.env.NODE_ENV = 'unlock'
    logger.setLogLevel(4)
    process.env.NODE_ENV = 'unittest'

    expect(logger.logLevel).toBe(4)
    runLogger(logger)
    expect(mockLogger.mock.calls.length).toBe(5)
    expect(mockLogger.mock.calls[0][0]).toBe('log')
    expect(mockLogger.mock.calls[1][0]).toBe('error')
    expect(mockLogger.mock.calls[2][0]).toBe('warn')
    expect(mockLogger.mock.calls[3][0]).toBe('debug')
    expect(mockLogger.mock.calls[4][0]).toBe('tip')
    expect(chalk.cyan).toHaveBeenCalledTimes(1)
  })

  test('set level to `5`', () => {
    const logger = createLogger()
    process.env.NODE_ENV = 'unlock'
    logger.setLogLevel(5)
    process.env.NODE_ENV = 'unittest'

    expect(logger.logLevel).toBe(5)
    runLogger(logger)
    expect(mockLogger.mock.calls.length).toBe(6)
    expect(mockLogger.mock.calls[0][0]).toBe('log')
    expect(mockLogger.mock.calls[1][0]).toBe('error')
    expect(mockLogger.mock.calls[2][0]).toBe('warn')
    expect(mockLogger.mock.calls[3][0]).toBe('debug')
    expect(mockLogger.mock.calls[4][0]).toBe('tip')
    expect(mockLogger.mock.calls[5][0]).toBe('info')
    expect(chalk.green).toHaveBeenCalledTimes(1)
  })

  test('using functions as arguments to logger', () => {
    const logger = createLogger()
    process.env.NODE_ENV = 'unlock'
    logger.setLogLevel(5)
    process.env.NODE_ENV = 'unittest'

    expect(logger.logLevel).toBe(5)
    runLoggerWithFn(logger)
    expect(mockLogger.mock.calls.length).toBe(6)
    expect(mockLogger.mock.calls[0][0]).toBe('log')
    expect(mockLogger.mock.calls[1][0]).toBe('error')
    expect(mockLogger.mock.calls[2][0]).toBe('warn')
    expect(mockLogger.mock.calls[3][0]).toBe('debug')
    expect(mockLogger.mock.calls[4][0]).toBe('tip')
    expect(mockLogger.mock.calls[5][0]).toBe('info')
    expect(chalk.green).toHaveBeenCalledTimes(1)
  })
})
