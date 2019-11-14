import Vue from 'vue'
import Meta from 'vue-meta'
import createApp from '#entry'
import ClientOnly from './ClientOnly'

// When an async lifecycle hook (usually `created`) throws an error,
// it needs to be captured using `Vue.config.errorHandler`,
// but the user has probably already specified it.
if (!Vue.config.errorHandler) {
  Vue.config.errorHandler = (err, vm, info) => {
    vm.$root.error = err
    // Discard the async error because it triggers the `unhandledRejection` event.
    if (info.indexOf('(Promise/async)') > 0) return

    throw err
  }
}

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
