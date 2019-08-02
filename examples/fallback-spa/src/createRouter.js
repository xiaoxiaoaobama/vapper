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
      }
    ]
  })
}