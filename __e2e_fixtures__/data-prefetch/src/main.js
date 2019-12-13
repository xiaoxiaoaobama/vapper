import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import { fetch } from './fetch'
import App from './App.vue'

Vue.config.productionTip = false

Vue.use(VueRouter)
Vue.use(Vuex)

// Export factory function
export default function createApp (ctx) {
  const store = new Vuex.Store({
    state: { storeMsg: '' },
    mutations: {
      SET_FOO (state, msg) {
        state.storeMsg = msg
      }
    },
    actions: {
      async setFoo ({ commit }) {
        const msg = await fetch()
        commit('SET_FOO', msg)
      }
    }
  })
  ctx.replaceState(store)

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

  // 2. Create a app instance
  const app = new Vue({
    router,
    store,
    // This is necessary, it is for vue-meta
    head: {},
    render: h => h(App)
  })

  // 3. return
  return { app, router, store }
}