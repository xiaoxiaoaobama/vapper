import Vue from 'vue'

Vue.mixin({
  created () {
    this.$sentry = this.$root.$options.$sentry
  }
})

export default function (ctx) {
  const sentry = process.sentry || {}

  ctx.$sentry = sentry
  ctx.rootOptions.$sentry = sentry
}
