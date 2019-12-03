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
  needSerialize: true,
  async created() {
    this.res = await fetch()
  }
}
</script>

<style>
.app {
  color: red;
}
</style>

