<template>
  <div id="app">
    <h1>Pre-render</h1>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app',
  needSerialize: true,
  async created () {
    this.res = await fetch()
  }
}

function fetch () {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 0,
        data: { name: 'hcy' }
      })
    }, 2000)
  })
}
</script>
