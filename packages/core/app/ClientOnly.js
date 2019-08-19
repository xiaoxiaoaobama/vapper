export default {
  name: 'ClientOnly',
  mounted () {
    this.already = true
    this.$forceUpdate()
  },
  render (h) {
    const t = this._e()
    if (!this.already) {
      return this.$slots.placeholder
        ? this.$slots.placeholder
        : t
    }

    return this.$slots.default
      ? handleMultipleVNode(h, this.$slots.default)
      : t
  }
}

function handleMultipleVNode (h, vnodes) {
  return vnodes.length > 1 ? h('div', vnodes) : vnodes
}
