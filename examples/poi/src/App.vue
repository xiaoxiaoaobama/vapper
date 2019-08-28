<template>
  <div id="app">
    <router-view/>
    <p>{{ res }}</p>
  </div>
</template>

<script>
import fetch from '../fetch'

export default {
  data () {
    return {
      res: ''
    }
  },
  name: 'App',
  async created() {
    const fetchName = this.$createFetcher(fetch)
    this.res = await fetchName()
  }
}
</script>

<style>
.app {
  color: red;
}
</style>

