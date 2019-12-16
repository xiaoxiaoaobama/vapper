<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return { root: true }
  },
  needPrefetch: true,
  async created () {
    await this.$store.dispatch('setFoo')
  }
}
</script>
