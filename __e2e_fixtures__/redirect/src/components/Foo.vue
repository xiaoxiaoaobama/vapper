<template>
  <div id="foo">
    <p class="p1">Foo</p>
    <router-link class="go-to-bar" :to="{ name: 'bar' }">Go to bar</router-link>
  </div>
</template>

<script>
export default {
  name: 'Foo'
}
</script>
