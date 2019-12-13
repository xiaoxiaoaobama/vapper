<template>
  <div id="bar">
    <p class="p2">Bar</p>
  </div>
</template>

<script>
export default {
  name: 'Bar',
  created () {
    this.$$redirect('/baz')
  }
}
</script>
