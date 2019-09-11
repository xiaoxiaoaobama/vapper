<template>
  <div id="app">
    <h1>Use vapper with vue-apollo</h1>
    <p>{{ allFiles }}</p>
    <router-view/>
  </div>
</template>

<script>
import gql from 'graphql-tag'

export default {
  name: 'app',
  apollo: {
    // Simple query that will update the 'hello' vue property
    allFiles: gql`query {
      allFiles {
        id
      }
    }`,
  }
}
</script>
