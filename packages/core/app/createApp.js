import Vue from 'vue'
import Meta from 'vue-meta'
import createApp from '#entry'
import ClientOnly from './ClientOnly'

Vue.component('ClientOnly', ClientOnly)

// Install vue-meta
Vue.use(Meta, {
  keyName: 'head'
})

// For custom error page
Vue.mixin({
  data () {
    return this.$root === this._self
      // `this.error` may already be an error object, such as set in `router.onError`
      ? { error: this.error }
      : {}
  },
  errorCaptured (err) {
    if (this.$root === this._self && !err.isVueSsrPrefetcher) {
      // Display custom error page
      this.error = err
      // Throw the error to fall back to SPA mode
      throw err
    }
  }
})

Vue.mixin({
  beforeCreate () {
    this.$$redirect = this.$root.$$redirect
    this.$$type = this.$root.$$type
  }
})

export default createApp
