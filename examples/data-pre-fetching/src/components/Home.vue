<template>
  <div class="home">
    <p>Home data: {{ res }}</p>
  </div>
</template>

<script>
import fetch from '../fetch'

export default {
  name: 'Home',
  data () {
    return {
      res: {}
    }
  },
  needSerialze: true,
  async created () {
    this.res = await fetch('Home')
  }
}
</script>
