<template>
    <div>
        <div id="WebGL-output"></div>
        <button @click = "clearp()">清除</button>
    </div>
</template>
<script>
// import Runner from '@/assets/js/scene.js'
import Runner from './js/scene'
export default {
    data(){
        return{
            runner1:null
        }
    },
    mounted() {
       this.runner1 = new Runner('WebGL-output')
    },
    methods:{
        clearp(){
            this.runner1.clearPoint()
        }
    }
    
    
}
</script>
<style lang="scss" scoped>
button{
    position:absolute;
    top:0;
    left:0
}
#page-wrapper{
    overflow: hidden;
}
#change{
    position: fixed;
    z-index: 999;
    
}
</style>