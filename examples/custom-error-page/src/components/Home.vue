<template>
  <div id="foo">
    <p class="p1">{{ msg }}</p>
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
  }
}
</script>
