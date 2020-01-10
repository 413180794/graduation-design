<template>
    <div id="nav-menu" style="-webkit-app-region:drag">
        <el-menu
                default-active="1"
                class="el-menu-demo"
                mode="horizontal"
                background-color="#545c64"
                text-color="#fff"
                active-text-color="#ffd04b"
        >
            <el-submenu index="1" style="-webkit-app-region:no-drag">
                <template slot="title">文件</template>
                <el-menu-item index="1-1" @click.native="readImages">导入图片-多选</el-menu-item>
                <el-menu-item index="1-2" @click.native="readImagesByDirectory">导入图片-文件夹</el-menu-item>
            </el-submenu>
            <el-submenu index="2" style="-webkit-app-region:no-drag">
                <template slot="title">工具</template>
                <el-menu-item index="2-1">选项1</el-menu-item>
                <el-menu-item index="2-2">选项2</el-menu-item>
                <el-menu-item index="2-3">选项3</el-menu-item>
                <el-submenu index="2-4">
                    <template slot="title">选项4</template>
                    <el-menu-item index="2-4-1">选项1</el-menu-item>
                    <el-menu-item index="2-4-2">选项2</el-menu-item>
                    <el-menu-item index="2-4-3">选项3</el-menu-item>
                </el-submenu>
            </el-submenu>
            <el-menu-item index="3" style="-webkit-app-region:no-drag">消息中心</el-menu-item>
            <el-menu-item index="4" style="float: right;-webkit-app-region:no-drag" @click="close">关闭</el-menu-item>
        </el-menu>
    </div>
</template>
<script>
  import {remote, ipcRenderer} from 'electron'
  import {mapState} from 'vuex'

  export default {
    name: 'nav-menu',
    data () {
      return {}
    },
    computed: mapState({
      imagePaths: (state) => state.ThriftClient.images
    }),
    created () {
      ipcRenderer.on('getFilesBySelect-reply', (event, files) => {
        console.log('files' + files)
        this.$store.dispatch('ThriftClient/clear_images')
        this.$store.dispatch('ThriftClient/set_images', files)
      })
      ipcRenderer.on('getFilesByDirectory-reply', (event, files) => {
        console.log(files)
        this.$store.dispatch('ThriftClient/set_images', files)
      })
    },
    methods: {
      close () {
        // 关闭 主窗口
        let win = remote.getCurrentWindow()
        win.close()
      },
      readImages: function () {
        // 读取图片路径
        ipcRenderer.send('getFilesBySelect')
      },
      readImagesByDirectory: function () {
        // 读取图片-通过选择文件夹
        ipcRenderer.send('getFilesByDirectory')
      }
    }
  }
</script>
<style>
 #nav-menu {
     margin: 0;
     width: 100%;
 }
</style>
