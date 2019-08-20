<template>
  <div class="box">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app',
  created () {
    console.log(this.$cookie)
  }
}
</script>

<style>
.box {
  color: red;
}
</style>

