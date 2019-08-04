<template>
  <div class="home">
    <!-- There will be an error here -->
    {{ a.b.c }}
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>
