import Vue from 'vue'
import { clientPlugin } from './prefetcher'
import createApp from './createApp'
import VapperError from './VapperError'
import { createClientRedirect } from './redirect'

// Dynamically generated by vapper
import enhanceApp from './.vapper/enhanceClient'

const TYPE = 'client'

Vue.use(clientPlugin)

const context = {
  pluginRuntimeOptions: createApp.pluginRuntimeOptions,
  type: TYPE
}

const rootOptions = createApp(context)
const { router, store } = rootOptions
context.rootOptions = rootOptions

enhanceApp(context)

// We initialize the store state with the data injected from the server
if (window.__INITIAL_STATE__ && window.__INITIAL_STATE__.$$stroe) {
  store.replaceState(window.__INITIAL_STATE__.$$stroe)
}

const app = new Vue(rootOptions)

// Add helpers
const redirect = createClientRedirect(router)
app.$$redirect = redirect
app.$$type = TYPE
router.$$redirect = redirect
router.$$type = TYPE

router.beforeResolve(async (to, from, next) => {
  const matchedComponents = router.getMatchedComponents(to)
  // no matched routes, reject with 404
  if (!matchedComponents.length) {
    throw new VapperError({
      url: to.path,
      code: 404,
      message: 'Page Not Found'
    })
  }

  next()
})

router.onReady(() => {
  // In poi, when we fall back to spa mode,
  // the html page doesn't include `#_vapper_`, so use `#app`
  let el = document.querySelector('[data-server-rendered]')

  if (window.__INITIAL_STATE__) {
    const { $$selfStore } = window.__INITIAL_STATE__

    // Add `$$selfStore` to the root component instance
    if ($$selfStore) app.$$selfStore = $$selfStore

    app.$mount(el)
    // This is very important, it is used to avoid repeated data fetch,
    // and must be after the `$mount()` function
    clientPlugin.$$resolved = true
  } else {
    // fallback SPA mode
    el = document.querySelector('#_vapper_') || document.querySelector('#app')
    clientPlugin.$$resolved = true
    app.$mount(el)
  }
})
