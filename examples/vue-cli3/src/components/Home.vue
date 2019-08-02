<template>
  <div class="hello">
    Home {{ res }}
  </div>
</template>

<script>
import fetch from '../../fetch'
export default {
  name: 'Home',
  data () {
    return {
      res: {}
    }
  },
  async created () {
    const fetchName = this.$createFetcher(fetch)
    this.res = await fetchName()
  }
}
</script>
