import Vue from 'vue'
import { clientPlugin } from 'vue-ssr-prefetcher'
import createApp from './createApp'
import { redirect } from './redirect'
import HomoError from './HomoError'

Vue.use(clientPlugin)

const { app, router, store } = createApp()

router.beforeResolve(async (to, from, next) => {
  try {
    const matchedComponents = router.getMatchedComponents(to)
    // no matched routes, reject with 404
    if (!matchedComponents.length) {
      throw new HomoError({
        url: to.path,
        code: 404,
        message: 'Page Not Found'
      })
    }

    // Add helpers
    app.$$redirect = redirect
    app.$$type = 'client'

    next()
  } catch (err) {
    // When `redirect` is called, it essentially throws a custom error(HomoError),
    // catches the error and redirects
    if (err.name === 'HomoError' && err.code === 'REDIRECT') {
      next(err.redirectURL)
    } else {
      console.error(err)
    }
  }
})

router.onReady(() => {
  // In poi, when we fall back to spa mode,
  // the html page doesn't include `#_home_`, so use `#app`
  const el = document.querySelector('#_homo_') || document.querySelector('#app')

  if (window.__INITIAL_STATE__) {
    const { $$stroe, $$selfStore } = window.__INITIAL_STATE__

    // We initialize the store state with the data injected from the server
    if ($$stroe) store.replaceState($$stroe)

    // Add `$$selfStore` to the root component instance
    if ($$selfStore) app.$$selfStore = $$selfStore

    app.$mount(el)
    // This is very important, it is used to avoid repeated data fetch,
    // and must be after the `$mount()` function
    clientPlugin.$$resolved = true
  } else {
    // fallback SPA mode
    clientPlugin.$$resolved = true
    app.$mount(el)
  }
})
