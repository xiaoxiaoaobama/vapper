<template>
  <div class="hello">
    <Button>Default</Button>
    <Button type="primary">Primary</Button>
    <Button type="dashed">Dashed</Button>
    <Button type="text">Text</Button>
    <br><br>
    <Button type="info">Info</Button>
    <Button type="success">Success</Button>
    <Button type="warning">Warning</Button>
    <Button type="error">Error</Button>
  </div>
</template>

<script>
import { Button } from 'view-design'

export default {
  name: 'Home',
  components: {
    Button
  },
  data () {
    return {
      res: {}
    }
  }
}
</script>
