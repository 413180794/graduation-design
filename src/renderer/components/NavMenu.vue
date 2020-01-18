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
                <template slot="title">操作</template>
                <el-menu-item index="2-1" ref='startConnect' @click.native="startConnect" :disabled='connected'
                              class="startConnect">建立连接
                </el-menu-item>
                <el-menu-item index="2-2" ref='taskOneOperate' :disabled='!connected'
                              v-on="{click:() => taskOneOperate(images)}"
                              class="operate"
                >病灶分割
                </el-menu-item>
                <el-menu-item index="2-3" ref='taskTwoOperate' :disabled='!connected' @click.native="taskTwoOperate"
                              class="operate"
                >病灶属性分割
                </el-menu-item>
                <el-menu-item index="2-4" ref='taskThreeOperate' :disabled='!connected'
                              @click.native="taskThreeOperate" class="operate"
                >病变诊断
                </el-menu-item>
                <el-menu-item index="2-5" ref='taskFourOperate' :disabled='!connected' @click.native="taskFourOperate"
                              class="operate"
                >癌变良恶性诊断
                </el-menu-item>
                <el-submenu index="2-4">
                    <template slot="title">选项4</template>
                    <el-menu-item index="2-4-1">选项1</el-menu-item>
                    <el-menu-item index="2-4-2">选项2</el-menu-item>
                    <el-menu-item index="2-4-3">选项3</el-menu-item>
                </el-submenu>
            </el-submenu>
            <el-submenu index="3" style="-webkit-app-region:no-drag">
                <template slot="title">工具栏</template>
                <el-menu-item index="3-1">原图展示</el-menu-item>
                <el-menu-item index="3-1">病灶分割栏</el-menu-item>
                <el-menu-item index="3-1">病灶属性检测栏</el-menu-item>
            </el-submenu>
            <el-menu-item index="4" style="float: right;-webkit-app-region:no-drag" @click="close">关闭</el-menu-item>
        </el-menu>
    </div>
</template>
<script>
  import {remote, ipcRenderer} from 'electron'
  import thrift from 'thrift'

  const predictService = require('../../../static/thrift_js/predictService')

  export default {
    name: 'nav-menu',
    data () {
      return {
        connection: null,
        client: null
      }
    },
    computed: {
      connected () {
        console.log(this.$store.getters['ThriftClient/connected'])
        return this.$store.getters['ThriftClient/connected']
      },
      images () {
        return this.$store.getters['ThriftClient/images']
      }
    },
    created () {
      this.startConnect()
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
      },
      startConnect: function () {
        // 开始建立链接
        // const clientTypes = require('../../../../static/thrift_js/client_types')
        // const predictService = require('../../../../static/thrift_js/predictService')
        this.connection = thrift.createConnection('127.0.0.1', 8088)
        this.connection.on('error', (msg) => {
          alert('尝试连接RPC错误', msg)
          this.$store.dispatch('ThriftClient/set_connection_state', false) // 重置链接
        })
        this.connection.on('connect', () => {
          console.log('连接RPC成功')
          this.client = thrift.createClient(predictService, this.connection)
          this.$store.dispatch('ThriftClient/set_connection_state', true)
        })
        this.connection.on('close', () => {
          alert('连接关闭')
          this.$store.dispatch('ThriftClient/set_connection_state', false)// 重置链接
        })
      },
      taskOneOperate: function (images) {
        // 任务一操作
        if (this.client === null) {
          alert('请尝试重新与后端建立连接')
        }
        this.client.seg_predict_images_task1(images, (err, res) => {
          if (err) {
            alert('出错，请检查task1', err)
          } else {
            console.log('res:', res)
            this.$store.dispatch('ThriftClient/set_task1_result', res)
          }
        })
      },
      taskTwoOperate: function () {
        // 任务二操作
      },
      taskThreeOperate: function () {
        // 任务三操作
      },
      taskFourOperate: function () {
        // 任务四操作
      }
    }
  }
</script>
<style>
    #nav-menu {
        margin: 0;
        width: 100%;
        height: 8%;
    }
</style>
