<template>
  <div id="foo">
    <p class="p1">{{ msg }}</p>
    <p class="p2">{{ $store.state.storeMsg }}</p>
  </div>
</template>

<script>
import { fetch } from '../fetch'
export default {
  name: 'Foo',
  data () {
    return { msg: '' }
  },
  needSerialize: true,
  async created () {
    this.msg = await fetch()
    await this.$store.dispatch('setFoo')
  }
}
</script>
