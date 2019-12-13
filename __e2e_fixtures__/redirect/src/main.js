import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'

Vue.config.productionTip = false

Vue.use(VueRouter)

// Export factory function
export default function createApp () {
  // 1. Create a router instance
  const router = new VueRouter({
    mode: 'history',
    routes: [
      {
        path: '/',
        component: () => import('./components/Foo.vue'),
        meta: {
          ssr: true
        }
      }
    ]
  })

  router.beforeEach((to, from, next) => {
    if (to.path === '/foo') {
      router.$$redirect('/')
      return
    }
    next()
  })

  // 2. Create a app instance
  const app = new Vue({
    router,
    // This is necessary, it is for vue-meta
    head: {},
    render: h => h(App)
  })

  // 3. return
  return { app, router }
}