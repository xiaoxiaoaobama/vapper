import Vue from 'vue'
import { clientPlugin } from 'vue-ssr-prefetcher'
import createApp from './createApp'
// import { redirect } from './redirect'
import HomoError from './HomoError'

Vue.use(clientPlugin)

const { app, router, store } = createApp()

router.beforeResolve(async (to, from, next) => {
  if (!app.$$resolved) return next()

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

    /**
     * The current route is not 404, but app.$$error exists,
     * indicating that the last route was 404, so we need to force the update,
     * otherwise we will always render the 404 page.
     */
    if (app.$$error) {
      app.$$error = null
      app.$forceUpdate()
    }

    // const context = {
    //   store,
    //   router,
    //   route: to,
    //   redirect,
    //   type: 'client'
    // }

    // await Promise.all(
    //   matchedComponents
    //     .filter(C => C.fetchInitialData && typeof C.fetchInitialData === 'function')
    //     .map(async (C, i) => {
    //       const data = await C.fetchInitialData(context)
    //       app.$$initialData[C.$$initialDataKey] = data
    //     })
    // )
    next()
  } catch (err) {
    // When `redirect` is called, it essentially throws a custom error(HomoError),
    // catches the error and redirects
    if (err.name === 'HomoError' && err.code === 'REDIRECT') {
      next(err.redirectURL)
    } else if (err.name === 'HomoError' && err.code === 404) {
      // Set a 404 error and force an update in order to render a 404 page
      app.$$error = err
      app.$forceUpdate()
      next()
    } else {
      console.error(err)
    }
  }
})

router.onReady(() => {
  if (window.__INITIAL_STATE__) {
    const { $$stroe, $$selfStore, $$error } = window.__INITIAL_STATE__

    // We initialize the store state with the data injected from the server
    if ($$stroe) store.replaceState($$stroe)

    // Add `$$selfStore` to the root component instance
    if ($$selfStore) app.$$selfStore = $$selfStore

    if ($$error) app.$$error = $$error
  }

  app.$mount('#_homo_')
  // This is very important, it is used to avoid repeated data fetch,
  // and must be after the `$mount()` function
  clientPlugin.$$resolved = true
})
