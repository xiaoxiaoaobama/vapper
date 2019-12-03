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
  needSerialize: true,
  async created () {
    this.res = await fetch('App')
  }
}
</script>
