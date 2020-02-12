/**
 * Copy from https://github.com/nuxt/nuxt.js/blob/dev/packages/utils/src/serialize.js
 */

const serialize = require('serialize-javascript')

function normalizeFunctions (obj) {
  if (typeof obj !== 'object' || Array.isArray(obj) || obj === null) {
    return obj
  }
  for (const key in obj) {
    if (key === '__proto__' || key === 'constructor') {
      continue
    }
    const val = obj[key]
    if (val !== null && typeof val === 'object' && !Array.isArray(obj)) {
      obj[key] = normalizeFunctions(val)
    }
    if (typeof obj[key] === 'function') {
      const asString = obj[key].toString()
      const match = asString.match(/^([^{(]+)=>\s*([\0-\uFFFF]*)/)
      if (match) {
        const fullFunctionBody = match[2].match(/^{?(\s*return\s+)?([\0-\uFFFF]*?)}?$/)
        let functionBody = fullFunctionBody[2].trim()
        if (fullFunctionBody[1] || !match[2].trim().match(/^\s*{/)) {
          functionBody = `return ${functionBody}`
        }
        // eslint-disable-next-line no-new-func
        obj[key] = new Function(...match[1].split(',').map(arg => arg.trim()), functionBody)
      }
    }
  }
  return obj
}

function serializeFunction (func) {
  let open = false
  func = normalizeFunctions(func)
  return serialize(func)
    .replace(serializeFunction.assignmentRE, (_, spaces) => {
      return `${spaces}: function (`
    })
    .replace(serializeFunction.internalFunctionRE, (_, spaces, name, args) => {
      if (open) {
        return `${spaces}${name}: function (${args}) {`
      } else {
        open = true
        return _
      }
    })
    .replace(`${func.name || 'function'}(`, 'function (')
    .replace('function function', 'function')
}

serializeFunction.internalFunctionRE = /^(\s*)(?!(?:if)|(?:for)|(?:while)|(?:switch)|(?:catch))(\w+)\s*\((.*?)\)\s*\{/gm
serializeFunction.assignmentRE = /^(\s*):(\w+)\(/gm

exports.normalizeFunctions = normalizeFunctions
exports.serializeFunction = serializeFunction
