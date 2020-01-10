import Vue from 'vue'
import Meta from 'vue-meta'
import createApp from '#entry'
import ClientOnly from './ClientOnly'

// When an async lifecycle hook (usually `created`) throws an error,
// it needs to be captured using `Vue.config.errorHandler`,
// but the user has probably already specified it.
const originalConfigErrorHandler = Vue.config.errorHandler
Vue.config.errorHandler = (err, vm, info) => {
  originalConfigErrorHandler && originalConfigErrorHandler(err, vm, info)
  // Discard the async error because it triggers the `unhandledRejection` event.
  if (process.server && info.indexOf('(Promise/async)') > 0) return

  throw err
}

Vue.component('ClientOnly', ClientOnly)

// Install vue-meta
Vue.use(Meta, {
  keyName: 'head'
})

Vue.mixin({
  beforeCreate () {
    this.$$redirect = this.$root.$$redirect
    this.$$type = this.$root.$$type
  }
})

export default createApp
