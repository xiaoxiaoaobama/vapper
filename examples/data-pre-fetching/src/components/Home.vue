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
  async created () {
    const fetchName = this.$createFetcher(fetch)
    this.res = await fetchName('Home')
  }
}
</script>
