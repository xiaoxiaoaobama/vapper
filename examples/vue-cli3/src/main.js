import Vue from 'vue'
import createRouter from './createRouter'
import App from './App.vue'

Vue.config.productionTip = false
Vue.mixin({
  created () {
    this.$cookie = this.$root.$options.$cookie
  }
})

// Export factory function
export default function createApp (ctx) {
  // 1. Create a router instance
  const router = createRouter()

  // 2. Create a app instance
  const app = new Vue({
    $cookie: ctx.$cookie,
    router,
    head: {},
    render: h => h(App)
  })

  // 3. return
  return { app, router }
}

