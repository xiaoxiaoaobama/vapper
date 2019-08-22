import cookie from 'cookie'
import { getOptions } from './options'

export default function ({ Vue, pluginRuntimeOptions, type, res, req, isFake }) {
  if (isFake) return

  const isServer = type === 'server'
  const opts = getOptions(pluginRuntimeOptions)

  const rowCookie = isServer ? req.headers.cookie : document.cookie

  const cookieUtils = {
    rowCookie,
    cookies: cookie.parse(rowCookie),
    get: (name) => {
      const cookieObj = {}
      if (isServer && opts.fromRes) {
        const responseCookie = cookie.parse(
          res.getHeader('Set-Cookie')
            .map(str => {
              return str.split(';')[0]
            })
            .join('; ')
            .trim()
        )
        Object.assign(cookieObj, responseCookie)
      }

      Object.assign(cookieObj, cookieUtils.cookies)

      return name ? cookieObj[name] : cookieObj
    },

    // Set one or more cookies
    set (name, value, options) {
      const list = Array.isArray(name) ? name : [{ name, value, options }]

      list.forEach(item => {
        const { name, value, options } = item
        cookieUtils._set(name, value, options)
      })
    },
    _set (name = '', value = '', options = { path: '/' }) {
      if (typeof value !== 'string') value = JSON.stringify(value)

      if (res) {
        let exists = res.getHeader('Set-Cookie')
        exists = typeof exists === 'string' ? [exists] : exists

        exists.push(cookie.serialize(name, value, options))

        res.setHeader('Set-Cookie', exists)
      } else {
        document.cookie = cookie.serialize(name, value, options)
      }
    },

    // Delete one or all cookies
    delete (name, options) {
      if (!name) {
        // remove all
        Object.keys(cookieUtils.cookies).forEach(name => cookieUtils._delete(name))
        return
      }

      cookieUtils._delete(name, options)
    },
    _delete (name, options = { path: '/' }) {
      const cookie = cookieUtils.get(name)
      options.expires = new Date(0)
      if (cookie) cookieUtils.set(name, '', options)
    }
  }

  Vue.mixin({
    created () {
      this[opts.propertyName] = cookieUtils
    }
  })
}
