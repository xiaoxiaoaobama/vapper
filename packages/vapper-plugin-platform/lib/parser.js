/**
 * Copy from https://github.com/lancedikson/bowser/blob/master/src/parser.js
 * Modified by: HcySunYang
 */

import browserParsersList, { appendBrowsers as _appendBrowsers } from './borwsersList.js'
import Utils from './utils.js'

/**
 * The main class that arranges the whole parsing process.
 */
class Parser {
  /**
   * Create instance of Parser
   *
   * @param {String} UA User-Agent string
   *
   * @throw {Error} in case of empty UA String
   *
   * @constructor
   */
  constructor (UA) {
    if (UA === void (0) || UA === null || UA === '') {
      throw new Error("UserAgent parameter can't be empty")
    }

    this._ua = UA

    /**
     * @typedef ParsedResult
     * @property {Object} browser
     * @property {String|undefined} [browser.name]
     * Browser name, like `"Chrome"` or `"Internet Explorer"`
     * @property {String|undefined} [browser.version] Browser version as a String `"12.01.45334.10"`
     */
    this.parsedResult = {}

    this.parseBrowser()
  }

  /**
   * Get parsed browser object
   * @return {Object}
   */
  parseBrowser () {
    this.parsedResult.browser = {}

    const browserDescriptor = browserParsersList.find(_browser => {
      if (typeof _browser.test === 'function') {
        return _browser.test(this)
      }

      if (_browser.test instanceof Array) {
        return _browser.test.some(condition => this.test(condition))
      }

      throw new Error("Browser's test function is not valid")
    })

    if (browserDescriptor) {
      this.parsedResult.browser = browserDescriptor.describe(this.getUA())
    }

    return this.parsedResult.browser
  }

  /**
   * Get parsed browser object
   * @return {Object}
   *
   * @public
   */
  getBrowser () {
    return this.parsedResult.browser
  }

  /**
   * Check if parsed browser matches certain conditions
   *
   * @param {Object} checkTree It's one or two layered object
   *
   * @returns {Boolean|undefined} Whether the browser satisfies the set conditions or not.
   * Returns `undefined` when the browser is no described in the checkTree object.
   *
   * @example
   * const browser = Bowser.getParser(window.navigator.userAgent);
   * if (browser.satisfies({ chrome: '>118.01.1322' }))
   */
  satisfies (checkTree) {
    const browsers = {}
    let browsersCounter = 0

    const allDefinitions = Object.keys(checkTree)

    allDefinitions.forEach((key) => {
      const currentDefinition = checkTree[key]
      if (typeof currentDefinition === 'string') {
        browsers[key] = currentDefinition
        browsersCounter += 1
      }
    })

    if (browsersCounter > 0) {
      const browserNames = Object.keys(browsers)
      const matchingDefinition = browserNames.find(name => (this.isBrowser(name, true)))

      if (matchingDefinition !== void 0) {
        return this.compareVersion(browsers[matchingDefinition])
      }
    }

    return undefined
  }

  /**
   * Check if the browser name equals the passed string
   * @param browserName The string to compare with the browser name
   * @param [includingAlias=false] The flag showing whether alias will be included into comparison
   * @returns {boolean}
   */
  isBrowser (browserName, includingAlias = false) {
    const defaultBrowserName = this.getBrowserName().toLowerCase()
    let browserNameLower = browserName.toLowerCase()
    const alias = Utils.getBrowserTypeByAlias(browserNameLower)

    if (includingAlias && alias) {
      browserNameLower = alias.toLowerCase()
    }
    return browserNameLower === defaultBrowserName
  }

  compareVersion (version) {
    let expectedResults = [0]
    let comparableVersion = version
    let isLoose = false

    const currentBrowserVersion = this.getBrowserVersion()

    if (typeof currentBrowserVersion !== 'string') {
      return void 0
    }

    if (version[0] === '>' || version[0] === '<') {
      comparableVersion = version.substr(1)
      if (version[1] === '=') {
        isLoose = true
        comparableVersion = version.substr(2)
      } else {
        expectedResults = []
      }
      if (version[0] === '>') {
        expectedResults.push(1)
      } else {
        expectedResults.push(-1)
      }
    } else if (version[0] === '=') {
      comparableVersion = version.substr(1)
    } else if (version[0] === '~') {
      isLoose = true
      comparableVersion = version.substr(1)
    }

    return expectedResults.indexOf(
      Utils.compareVersions(currentBrowserVersion, comparableVersion, isLoose)
    ) > -1
  }

  /**
   * Get UserAgent string of current Parser instance
   * @return {String} User-Agent String of the current <Parser> object
   *
   * @public
   */
  getUA () {
    return this._ua
  }

  /**
   * Test a UA string for a regexp
   * @param {RegExp} regex
   * @return {Boolean}
   */
  test (regex) {
    return regex.test(this._ua)
  }
}

export default Parser

export const appendBrowsers = _appendBrowsers
