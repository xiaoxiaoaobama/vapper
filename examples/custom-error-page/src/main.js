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
        component: () => import('./components/Home.vue'),
        meta: {
          ssr: true
        }
      },
      {
        path: '/bar',
        component: () => import('./components/Home.vue'),
        meta: {
          ssr: true
        }
      }
    ]
  })

  router.beforeEach(async (to, from, next) => {
    try {
      if (to.path === '/bar') {
        throw Error('error in the routing guard')
      }
      next()
    } catch (e) {
      next(e)
    }
  })

  // 2. Create root component option
  const app = {
    router,
    // This is necessary, it is for vue-meta
    head: {},
    ErrorComponent: {
      props: ['error'],
      render(h) {
        // Throws the error again and will fall back the spa mode.
        if (this.error.code === 404) throw this.error

        return h('div', [
          h('h1', this.error.code),
          h('h1', this.error.message)
        ])
      }
    },
    render (h) {
      return h(App)
    }
  }

  // 3. return
  return app
}