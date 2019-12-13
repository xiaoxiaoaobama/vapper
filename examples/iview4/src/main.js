import Vue from 'vue'
import createRouter from './createRouter'
import App from './App.vue'

import 'view-design/dist/styles/iview.css'

Vue.config.productionTip = false

// Export factory function
export default function createApp () {
  // 1. Create a router instance
  const router = createRouter()

  // 2. Create a app instance
  const app = new Vue({
    router,
    head: {},
    render: h => h(App)
  })

  // 3. return
  return { app, router }
}

