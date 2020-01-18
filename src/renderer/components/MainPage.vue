<template>
    <div id="main-page">
        <nav-menu class="nav-menu"></nav-menu>
        <pic-flow class="pic-flow"></pic-flow>
    </div>
</template>

<script>
  import NavMenu from './NavMenu'
  import PicFlow from './PicFlow'
  export default {
    name: 'main-page',
    components: {
      NavMenu,
      PicFlow
    },
    data () {
      return {}
    },
    methods: {}
  }
</script>

<style scoped>
    #main-page {
        margin: 0;
        height: 100%;
    }
</style>
