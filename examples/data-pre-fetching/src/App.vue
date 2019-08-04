<template>
  <div id="app">
    <h1>Data pre-fetching</h1>
    <p>App data: {{ res }}</p>
    <router-view/>
  </div>
</template>

<script>
import fetch from './fetch'

export default {
  name: 'app',
  data () {
    return {
      res: {}
    }
  },
  async created () {
    const fetchName = this.$createFetcher(fetch)
    this.res = await fetchName('App')
  }
}
</script>
