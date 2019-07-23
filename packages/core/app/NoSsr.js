export default {
  name: 'homo-no-ssr',
  mounted () {
    this.already = true
    this.$forceUpdate()
  },
  render (h) {
    const t = this._v('')
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
