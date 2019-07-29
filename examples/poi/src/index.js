import Vue from 'vue'
import App from './App.vue'
import createRouter from './createRouter'

Vue.config.productionTip = false

// Export factory function
export default function createApp () {
  // 1. Create a router instance
  const router = createRouter()

  // 2. Create a app instance
  const app = new Vue({
    router,
    render: h => h(App)
  })

  // 3. return
  return { app, router }
}

