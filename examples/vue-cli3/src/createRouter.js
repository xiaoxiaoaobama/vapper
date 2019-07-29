import Vue from 'vue'
import VueRouter from 'vue-router'

// install vue-router
Vue.use(VueRouter)

export default () => {
  return new VueRouter({
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
        component: () => import('./components/Foo.vue'),
        meta: {
          ssr: true
        }
      }
    ]
  })
}