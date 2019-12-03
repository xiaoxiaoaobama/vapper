import VapperError from './VapperError'
import VueRouter from 'vue-router'

export function createServerRedirect (res) {
  return function (url) {
    res.writeHead(302, {
      Location: url
    })
    res.end()
    // If the `$$redirect` function is called in a route guard, don't throw the error,
    // otherwise UnhandledPromiseRejection will be triggered
    if (this instanceof VueRouter) return
    throw new VapperError({
      code: 'REDIRECT'
    })
  }
}

const isAbs = /^(?:[a-z]+:)?\/\//i
export function createClientRedirect (router) {
  let redirectFn = null
  router.beforeHooks.unshift((to, from, next) => {
    redirectFn = next
    next()
  })
  function redirect (url) {
    if (isAbs.test(url)) {
      // eslint-disable-next-line
      location.href = url
      return
    }
    redirectFn(url)
  }

  return redirect
}
