function serverPlugin (Vue) {
  Vue.prototype.$createFetcher = function (fetcher) {
    const vm = this
    vm._needSerializeData = true

    return function (...params) {
      const p = fetcher(...params)
      vm.$$promises.push(p)
      return p
    }
  }

  const createdHook = function () {
    this.$$promises = []
    const keyMap = this.$root.$$keyMap || (this.$root.$$keyMap = {})

    const $$selfStore = this.$root.$$selfStore || (this.$root.$$selfStore = {})

    const key = getKey(keyMap, this)

    this.__vapper_data_key = key
    $$selfStore[key] = this.$data
  }

  const prefetchHook = function () {
    // Remove data that does not need to be serialized.
    // Only components that use `this.$createFetcher` function need to serialize their data.
    if (!this._needSerializeData) delete this.$root.$$selfStore[this.__vapper_data_key]
    return Promise.all(this.$$promises)
  }

  Vue.mixin({
    serverPrefetch: prefetchHook,
    created: createdHook
  })
}
serverPlugin.__name = 'vapperServerPlugin'

const clientPlugin = function (Vue) {
  Vue.prototype.$createFetcher = function (fetcher) {
    return function (...params) {
      if (!clientPlugin.$$resolved) {
        // TODO: VapperError
        const err = new Error('vue-ssr-prefetcher: custom error')
        err.isVueSsrPrefetcher = true
        throw err
      }
      return fetcher(...params)
    }
  }

  const keyMap = {}

  Vue.mixin({
    created: function () {
      const $$selfStore = this.$root.$$selfStore
      if (clientPlugin.$$resolved || !$$selfStore) { return }

      const key = getKey(keyMap, this)

      try {
        Object.assign(this, $$selfStore[key] || {})
      } catch (err) {}
    },
    errorCaptured: function (err) {
      if (err.isVueSsrPrefetcher) { return false }
      return true
    }
  })
}
clientPlugin.$$resolved = false

function getKey (keyMap, vm) {
  let current = vm
  let key = ''
  while (current) {
    key += current.$options.name || '$'
    current = current.$parent
  }

  if (keyMap[key]) {
    key = `${key}--${keyMap[key]++}`
    keyMap[key] = 1
  } else {
    keyMap[key] = 1
  }

  return key
}

export { clientPlugin, serverPlugin }
