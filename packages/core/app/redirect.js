import VapperError from './VapperError'

export function redirect (url) {
  throw new VapperError({
    code: 'REDIRECT',
    redirectURL: url
  })
}

export function createClientRedirect (router) {
  let redirectFn = null
  router.beforeHooks.unshift((to, from, next) => {
    redirectFn = next
    next()
  })
  function redirect (url) {
    redirectFn(url)
  }

  return redirect
}
