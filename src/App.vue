<template>
  <div id="app">
    <Index></Index>
    
  </div>
</template>

<script>
import Index from '@/views/index.vue'
export default {
  name: 'App',
  components: {
    Index
  }
}
</script>

<style lang="scss">
*{
  margin: 0;
  padding: 0;
}
body{
  overflow: hidden;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #fff;
}
</style>
