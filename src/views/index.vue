<template>
    <div>
        <div id="WebGL-output"></div>
    </div>
</template>
<script>
// import Runner from '@/assets/js/scene.js'
import Runner from './js/scene'
export default {
    mounted() {
        new Runner('WebGL-output')
    }
}
</script>
<style lang="scss" scoped>
#page-wrapper{
    overflow: hidden;
}
#change{
    position: fixed;
    z-index: 999;
    
}
</style>