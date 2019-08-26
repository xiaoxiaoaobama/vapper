<template>
  <div id="app">
    <h1>REDIRECT</h1>
    <router-link to="/about">Go About</router-link>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>
