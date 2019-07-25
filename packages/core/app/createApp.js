import Vue from 'vue'
import Meta from 'vue-meta'
import createApp from '#entry'
import NoSsr from './NoSsr'

Vue.component('NoSsr', NoSsr)

// Install vue-meta
Vue.use(Meta, {
  keyName: 'head'
})

export default createApp
