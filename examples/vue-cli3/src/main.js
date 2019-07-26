import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'

Vue.config.productionTip = false

// install vue-router
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
        path: '/about',
        component: () => import('./components/About.vue'),
        meta: {
          ssr: false
        }
      },
      {
        path: '/foo/bar',
        component: () => import('./components/About.vue'),
        meta: {
          ssr: true
        }
      }
    ]
  })

  // 2. Create a app instance
  const app = new Vue({
    router,
    render: h => h(App)
  })

  // 3. return
  return { app, router }
}

