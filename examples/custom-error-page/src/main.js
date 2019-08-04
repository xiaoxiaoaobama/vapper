import Vue from 'vue'
import createRouter from './createRouter'
import App from './App.vue'

Vue.config.productionTip = false

// Export factory function
export default function createApp () {
  // 1. Create a router instance
  const router = createRouter()

  // Use `router.onError` to catch routing errors
  // router.onError((err) => {
  //   router.app.error = err
  // })

  // 2. Create a app instance
  const app = new Vue({
    router,
    render (h) {
      return this.error ? h('h1', 'error') : h(App)
    }
  })

  // 3. return
  return { app, router }
}

