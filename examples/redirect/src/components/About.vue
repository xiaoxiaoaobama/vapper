<template>
  <h1>About</h1>
</template>

<script>
export default {
  name: 'About',
  created () {
    this.$$redirect('/foo')
  }
}
</script>
