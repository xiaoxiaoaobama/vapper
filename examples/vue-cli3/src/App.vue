<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app',
  created () {
    console.log(this.$cookie)
    console.log(process.env.VUE_APP_FOO)
  }
}
</script>

<style>
#app {
  color: red;
}
</style>

