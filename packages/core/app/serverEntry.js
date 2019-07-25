import Vue from 'vue'
import { serverPlugin } from 'vue-ssr-prefetcher'
import createApp from './createApp'
// import { redirect } from './redirect'
import HomoError from './HomoError'

Vue.use(serverPlugin)

export default async context => {
  const { app, router, store } = createApp()

  router.push(context.url)

  // Waiting for the route to be ready
  await routerReady(router)

  const matchedComponents = router.getMatchedComponents()
  // no matched routes, reject with 404
  if (!matchedComponents.length) {
    console.log('404 url: ', context.url)
    // Add error data - 404
    app.$$error = new HomoError({
      url: context.url,
      code: 404,
      message: 'Page Not Found'
    })
  }

  // Call fetchInitialData on the route component
  // const fetchContext = {
  //   store,
  //   router,
  //   route: router.currentRoute,
  //   redirect,
  //   type: 'server',
  //   ctx: context.ctx // server only
  // }
  // const $$initialData = {}
  // await Promise.all(
  //   matchedComponents
  //     .filter(C => C.fetchInitialData && typeof C.fetchInitialData === 'function')
  //     .map(async (C, i) => {
  //       const data = await C.fetchInitialData(fetchContext)
  //       $$initialData[C.$$initialDataKey] = data
  //     })
  // )

  // Set `context.rendered` to `serverPlugin.done`
  context.rendered = serverPlugin.done

  // The data will be serialized
  context.state = {
    $$stroe: store ? store.state : undefined,
    $$selfStore: app.$$selfStore,
    $$error: app.$$error
  }

  // vue-meta
  context.meta = app.$meta()
  return app
}

async function routerReady (router) {
  return new Promise((resolve, reject) => {
    router.onReady(resolve, reject)
  })
}
