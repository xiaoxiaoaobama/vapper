<template>
  <div id="foo">
    {{ msg }}
  </div>
</template>

<script>
export default {
  name: 'Foo',
  data () {
    return { msg: '' }
  },
  needSerialize: true,
  async created () {
    this.msg = await fetch()
  }
}

function fetch () {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('bar')
    }, 200) 
  })
}
</script>
