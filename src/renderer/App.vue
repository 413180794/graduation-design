<template>
    <div id="app" style="height: 100%">
        <MainPage></MainPage>
    </div>
</template>

<script>
  import MainPage from './components/MainPage'

  const bodyStyle = 'height: 100%;margin:0;overflow:hidden'
  const htmlStyle = 'height: 100%; margin:0;width:100%'

  export default {
    name: 'graduation-design',
    components: {MainPage},
    // 在这里处理body 和 html的样式、目前没有找到更好的方法
    mounted: function () {
      document.getElementsByTagName('body')[0].style = bodyStyle
      document.getElementsByTagName('html')[0].style = htmlStyle
    }
  }
</script>

<style type="text/css" xml:lang="scss">
</style>
