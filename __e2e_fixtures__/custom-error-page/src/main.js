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
        const error = Error('error in the routing guard')
        error.code = 200 // For e2e testing purposes only
        throw error
      }
    } catch (e) {
      next(e)
    }
    next()
  })

  // 2. Create root component option
  const app = {
    router,
    // This is necessary, it is for vue-meta
    head: {},
    ErrorComponent: {
      props: ['error'],
      render(h) {
        return h('div', [
          h('h1', this.error.code),
          h('h2', this.error.message)
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