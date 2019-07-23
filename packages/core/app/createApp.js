import Vue from 'vue'
import Meta from 'vue-meta'
import createApp from '#entry'
import NoSsr from './NoSsr'

Vue.component('NoSsr', NoSsr)

// Install vue-meta
Vue.use(Meta, {
  keyName: 'head'
})

// Make `$$initialData` accessible to every component instance
Vue.mixin({
  beforeCreate () {
    if (!this.$options.fetchInitialData) return
    this.$$initialData = this.$$initialData ? this.$$initialData : this.$root.$$initialData
  },
  data () {
    if (!this.$options.fetchInitialData) return {}
    const key = this.$options.$$initialDataKey
    return {
      ...this.$$initialData[key]
    }
  }
})

export default createApp
