function serverPlugin (Vue) {
  const beforeCreateHook = function () {
    this.__promiser = new Promise((resolve, reject) => {
      this.__resolveData = resolve
      this.__reject = reject
    })

    // The component's own `created` hook
    const selfCreatedHook = this.$options.created[this.$options.created.length - 1]

    // Rewrite created hook
    this.$options.created[this.$options.created.length - 1] = async function (...args) {
      let pro
      try {
        pro = selfCreatedHook.apply(this, args)
        await pro
      } catch (e) {
        this.__reject && this.__reject(e)
        return e
      }

      this.__resolveData && this.__resolveData()

      return pro
    }
  }

  const createdHook = function () {
    const keyMap = this.$root.$$keyMap || (this.$root.$$keyMap = {})

    const $$selfStore = this.$root.$$selfStore || (this.$root.$$selfStore = {})

    const key = getKey(keyMap, this)

    this.__vapper_data_key = key
    $$selfStore[key] = this.$data
  }

  const prefetchHook = function () {
    // Remove data that does not need to be serialized
    if (!this.$options.needSerialize) delete this.$root.$$selfStore[this.__vapper_data_key]
    return this.__promiser
  }

  Vue.mixin({
    serverPrefetch: prefetchHook,
    beforeCreate: beforeCreateHook,
    created: createdHook
  })
}
serverPlugin.__name = 'vapperServerPlugin'

const clientPlugin = function (Vue) {
  const keyMap = {}

  Vue.mixin({
    beforeCreate: function () {
      // The component's own `created` hook
      const selfCreatedHook = this.$options.created[this.$options.created.length - 1]
      if (selfCreatedHook.constructor.name !== 'AsyncFunction') return

      // Rewrite created hook
      this.$options.created[this.$options.created.length - 1] = async function (...args) {
        if (!clientPlugin.$$resolved) {
          // TODO: VapperError
          const err = new Error('vue-ssr-prefetcher: custom error')
          err.isVueSsrPrefetcher = true
          throw err
        }
        return selfCreatedHook.apply(this, args)
      }
    },
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
