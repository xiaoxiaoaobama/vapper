import Vue from 'vue'
import Meta from 'vue-meta'
import createApp from '#entry'
import ClientOnly from './ClientOnly'

Vue.component('ClientOnly', ClientOnly)

// For custom error page
Vue.mixin({
  data () {
    return this.$root === this._self
      // `this.error` may already be an error object, such as set in `router.onError`
      ? { error: this.error }
      : {}
  },
  errorCaptured (err) {
    if (this.$root === this._self) this.error = err
  }
})

// Install vue-meta
Vue.use(Meta, {
  keyName: 'head'
})

export default createApp
