import Vue from 'vue'
import Meta from 'vue-meta'
import createApp from '#entry'
import ClientOnly from './ClientOnly'

Vue.component('ClientOnly', ClientOnly)

// Install vue-meta
Vue.use(Meta, {
  keyName: 'head'
})

export default createApp
