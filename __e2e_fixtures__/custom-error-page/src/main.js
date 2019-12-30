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
      },
      {
        path: '/bar',
        component: () => import('./components/Foo.vue'),
        meta: {
          ssr: true
        }
      }
    ]
  })

  router.beforeEach((to, from, next) => {
    try {
      if (to.path === '/bar') {
        throw Error('error in the routing guard')
      }
    } catch (e) {
      router.err = e
    }
    next()
  })

  // 2. Create a app instance
  const app = {
    router,
    // This is necessary, it is for vue-meta
    head: {},
    render (h) {
      return router.err || this.error ? h('h1', String(router.err || this.error)) : h(App)
    }
  }

  // 3. return
  return app
}