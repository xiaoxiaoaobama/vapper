<template>
  <div id="app">
    <div @click="ppp">Push</div>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app',
  methods: {
    ppp () {
      this.$router.push({ name: 'about' })
    }
  }
}
</script>

<style>
#app {
  color: red;
}
</style>

