import Vue from 'vue'
import createRouter from './createRouter'
import App from './App.vue'

Vue.config.productionTip = false

// Export factory function
export default function createApp () {
  const initialState = {}

  // 1. Create a router instance
  const router = createRouter()
  
  router.beforeEach((from, to, next) => {
    setTimeout(() => {
      initialState.foo = 1
      next()
    }, 1000)
  })

  // 2. Create root component option
  const app = {
    router,
    head: {},
    initialState,
    render: h => h(App)
  }

  // 3. return
  return app
}

