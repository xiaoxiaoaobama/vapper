import Vue from 'vue'
import VueRouter from 'vue-router'

// install vue-router
Vue.use(VueRouter)

export default () => {
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
        path: '/about',
        component: () => import('./components/About.vue'),
        meta: {
          ssr: true
        }
      },
      {
        path: '/bar',
        component: () => import('./components/Bar.vue'),
        meta: {
          ssr: true
        }
      }
    ]
  })

  router.beforeEach((to, from, next) => {
    if (to.path === '/foo') {
      router.$$redirect('/bar')
      return
    }
    next()
  })

  return router
}