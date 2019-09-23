export function createServerRedirect (res) {
  return (url) => {
    res.writeHead(302, {
      Location: url
    })
    res.end()
  }
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
