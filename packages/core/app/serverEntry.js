import Vue from 'vue'
import { createServerPlugin } from 'vue-ssr-prefetcher'
import createApp from './createApp'
import { redirect } from './redirect'
import HomoError from './HomoError'

export default async context => {
  const serverPlugin = createServerPlugin()
  Vue.use(serverPlugin)
  const { app, router, store } = createApp()

  // This is a fake rendering in the `setup` to get the router instance
  if (context.fake) {
    throw new HomoError({
      router
    })
  }

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

  // Add helpers
  app.$$redirect = redirect
  app.$$type = 'server'

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
