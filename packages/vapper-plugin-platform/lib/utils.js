/**
 * Copy from https://github.com/lancedikson/bowser/blob/master/src/utils.js
 * Modified by: HcySunYang
 */

import { BROWSER_MAP } from './constants.js'

export default class Utils {
  /**
   * Get first matched item for a string
   * @param {RegExp} regexp
   * @param {String} ua
   * @return {Array|{index: number, input: string}|*|boolean|string}
   */
  static getFirstMatch (regexp, ua) {
    const match = ua.match(regexp)
    return (match && match.length > 0 && match[1]) || ''
  }

  /**
   * Get second matched item for a string
   * @param regexp
   * @param {String} ua
   * @return {Array|{index: number, input: string}|*|boolean|string}
   */
  static getSecondMatch (regexp, ua) {
    const match = ua.match(regexp)
    return (match && match.length > 1 && match[2]) || ''
  }

  /**
   * Get version precisions count
   *
   * @example
   *   getVersionPrecision("1.10.3") // 3
   *
   * @param  {string} version
   * @return {number}
   */
  static getVersionPrecision (version) {
    return version.split('.').length
  }

  /**
   * Calculate browser version weight
   *
   * @example
   *   compareVersions('1.10.2.1',  '1.8.2.1.90')    // 1
   *   compareVersions('1.010.2.1', '1.09.2.1.90');  // 1
   *   compareVersions('1.10.2.1',  '1.10.2.1');     // 0
   *   compareVersions('1.10.2.1',  '1.0800.2');     // -1
   *   compareVersions('1.10.2.1',  '1.10',  true);  // 0
   *
   * @param {String} versionA versions versions to compare
   * @param {String} versionB versions versions to compare
   * @param {boolean} [isLoose] enable loose comparison
   * @return {Number} comparison result: -1 when versionA is lower,
   * 1 when versionA is bigger, 0 when both equal
   */
  /* eslint consistent-return: 1 */
  static compareVersions (versionA, versionB, isLoose = false) {
    // 1) get common precision for both versions, for example for "10.0" and "9" it should be 2
    const versionAPrecision = Utils.getVersionPrecision(versionA)
    const versionBPrecision = Utils.getVersionPrecision(versionB)

    let precision = Math.max(versionAPrecision, versionBPrecision)
    let lastPrecision = 0

    const chunks = [versionA, versionB].map(version => {
      const delta = precision - Utils.getVersionPrecision(version)

      // 2) "9" -> "9.0" (for precision = 2)
      const _version = version + new Array(delta + 1).join('.0')

      // 3) "9.0" -> ["000000000"", "000000009"]
      return _version.split('.').map(chunk => new Array(20 - chunk.length).join('0') + chunk).reverse()
    })

    // adjust precision for loose comparison
    if (isLoose) {
      lastPrecision = precision - Math.min(versionAPrecision, versionBPrecision)
    }

    // iterate in reverse order by reversed chunks array
    precision -= 1
    while (precision >= lastPrecision) {
      // 4) compare: "000000009" > "000000010" = false (but "9" > "10" = true)
      if (chunks[0][precision] > chunks[1][precision]) {
        return 1
      }

      if (chunks[0][precision] === chunks[1][precision]) {
        if (precision === lastPrecision) {
          // all version chunks are same
          return 0
        }

        precision -= 1
      } else if (chunks[0][precision] < chunks[1][precision]) {
        return -1
      }
    }

    return undefined
  }

  /**
   * Get short version/alias for a browser name
   *
   * @example
   *   getBrowserAlias('edge') // Microsoft Edge
   *
   * @param  {string} browserAlias
   * @return {string}
   */
  static getBrowserTypeByAlias (browserAlias) {
    return BROWSER_MAP[browserAlias] || ''
  }
}
