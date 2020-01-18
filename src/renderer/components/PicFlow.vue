<template>
    <div class="galleryContainer">
        <div class="gallery" style="height: 100%">
            <!--大图显示，large-view后续换一个更好的-->
            <div class="imageBox" id="imageBox">

                <div class="originImage">
                    <!--                    加载图片的动画-->

                    <div class="box">
                        <div class="spinner">
                            <half-circle-spinner
                                    :animation-duration="1000"
                                    :color="accentColor"
                                    :size="60"
                                    v-if="isLoading"
                            />
                        </div>
                        <img
                                :alt="currentAlt"
                                :class="{ loading: isLoading}"
                                :src="currentImage"
                                ondragstart="return false"
                                @mousewheel="handleOriginImageMouseWheel"
                                @load="handleImageLoaded"
                                @mouseup="handleOriginImageMouseUp"
                                @mousedown="handleOriginImageMouseDown"
                                @mouseout="handleOriginImageMouseOut"
                                @mousemove="handleOriginImageMouseMove"
                                ref="mainImage"/>
                        <!--图片的文字说明-->
                        <!--添加向左向右的箭头-->
                    </div>
                    <a
                            @click="showPreviousImage"
                            class="control left"
                    >
                            <span>
                                &#9664;
                            </span>
                    </a>
                    <a
                            @click="showNextImage"
                            class="control right"
                    >
                            <span>
                                &#9654;
                            </span>
                    </a>
                </div>
                <div class="taskOneImage">
                    <div class="box">
                        <div class="spinner">
                            <half-circle-spinner
                                    :animation-duration="1000"
                                    :color="accentColor"
                                    :size="60"
                                    v-if="taskOneIsLoading"
                            />
                        </div>
                        <img :src="currentTaskOneImage"
                             alt=""
                             ondragstart="return false"
                             @load="handleTaskOneImageLoaded"
                             @mousewheel="handleTaskOneImageMouseWheel"
                             @mouseup="handleTaskOneImageMouseUp"
                             @mousedown="handleTaskOneImageMouseDown"
                             @mouseout="handleTaskOneImageMouseOut"
                             @mousemove="handleTaskOneImageMouseMove"
                             :class="{ loading: taskOneIsLoading}"
                             ref="taskOneImage"
                        >
                    </div>
                </div>
                <div class="taskTwoImage">
                    <div class="box">
                    <div class="spinner">
                        <half-circle-spinner
                                :animation-duration="1000"
                                :color="accentColor"
                                :size="60"
                                v-if="taskTwoIsLoading"
                        />
                    </div>
                    <img src=""
                         alt=""
                         ondragstart="return false"
                         @load="handleTaskOneImageLoaded"
                         @mousewheel="handleTaskTwoImageMouseWheel"
                         @mouseup="handleTaskTwoImageMouseUp"
                         @mousedown="handleTaskTwoImageMouseDown"
                         @mouseout="handleTaskTwoImageMouseOut"
                         @mousemove="handleTaskTwoImageMouseMove"
                         ref="taskTwoImage"
                    >
                    </div>
                    <a
                            @click="showPreviousImage"
                            class="control left"
                    >
                            <span>
                                &#9664;
                            </span>
                    </a>
                    <a
                            @click="showNextImage"
                            class="control right"
                    >
                            <span>
                                &#9654;
                            </span>
                    </a>
                </div>
            </div>
            <div class="galleryThumbnails">
                <div class="galleryThumbnailsContent" id="galleryThumnailsContent">
                    <div :key="index" class="galleryThumbnailsContentElem" v-for="(item, index) in items">
                        <img
                                :alt="Object.prototype.hasOwnProperty.call(item, 'alt') ? item.alt : ''"
                                :src="item.thumbnail"
                                :style="thumbnailStyle(index)"
                        />
                        <div class="info" v-on=" { click: () => handleImageClick(index)}">
                            <p>{{ item.caption }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
  import {HalfCircleSpinner} from 'epic-spinners'
  import LargeView from './LargeView'
  import {ipcRenderer, remote} from 'electron'
  import path from 'path'
  import Viewer from 'viewerjs'
  import 'viewerjs/dist/viewer.css'

  export default {
    name: 'PicFlow',
    props: {
      width: {
        type: Number,
        default: 980
      },
      bgColor: {
        type: String,
        default: 'transparent'
      },
      startImageIndex: {
        type: Number,
        default: 0
      },
      coverWidth: {
        type: Number,
        default: 100
      },
      coverHeight: {
        type: Number,
        default: 100
      },
      coverSpace: {
        type: Number,
        default: 110
      },
      coverShadow: {
        type: Boolean,
        default: true
      },
      coverFlat: {
        type: Boolean,
        default: true
      },
      accentColor: {
        type: String,
        default: '#3498db'
      },
      baseColor: {
        type: String,
        default: '#fff'
      }
    },
    computed: {
      items () {
        return this.$store.getters['ThriftClient/items']
      },
      taskOneResult () {
        return this.$store.getters['ThriftClient/taskOneResult']
      },
      taskTwoResult () {
        return this.$store.getters['ThriftClient/taskTwoResult']
      },
      taskThreeResult () {
        return this.$store.getters['ThriftClient/taskThreeResult']
      },
      taskFourResult () {
        return this.$store.getters['ThriftClient/taskFourResult']
      },
      currentTaskOneImage () {
        // 实时计算出当前任务一的结果
        if (this.currentImage === null) {
          // 如果当前图片为空，说明没有结果
          this.taskOneIsLoading = true
          return null
        } else {
          // 获得后缀名
          let extName = path.extname(this.currentImage)
          // 获得文件名
          let fileName = path.basename(this.currentImage, extName)
          let result = this.taskOneResult.find((imagePath) => {
            return imagePath.endsWith(fileName + '_result' + extName)
          })
          if (result === undefined) {
            // 表示没有找到识别的结果
            this.$message('没有识别结果, 请先进行对应的操作')
            return null
          }
          return 'file://' + result
        }
      },
      currentTaskTwoImage () {
        // TODO
      },
      client () {
        return remote.getGlobal('shareClient').client
      }
    },
    methods: {
      handleOriginImageMouseWheel (event) {
        /**
         * 原图显示的滚轮放大缩小
         */
        let img = event.target
        this.originImageParams.zoomVal += event.wheelDelta / 1200
        if (this.originImageParams.zoomVal >= 0.2) {
          img.style.setProperty('transform', `translate(-50%,-50%) scale(${this.originImageParams.zoomVal})`)
        } else {
          this.originImageParams.zoomVal = 0.2
          img.style.setProperty('transform', `translate(-50%,-50%) scale(${this.originImageParams.zoomVal})`)
          return false
        }
      },
      handleTaskOneImageMouseWheel (event) {
        /**
         * 任务一图片滚轮放大缩小
         */
        let img = event.target
        this.taskOneImageParams.zoomVal += event.wheelDelta / 1200
        if (this.taskOneImageParams.zoomVal >= 0.2) {
          img.style.setProperty('transform', `scale(${this.taskOneImageParams.zoomVal})`)
        } else {
          this.taskOneImageParams.zoomVal = 0.2
          img.style.setProperty('transform', `scale(${this.taskOneImageParams.zoomVal})`)
          return false
        }
      },
      handleTaskTwoImageMouseWheel (event) {
        /**
         * 任务二图像滚轮放大缩小
         */
        let img = event.target
        this.taskTwoImageParams.zoomVal += event.wheelDelta / 1200
        if (this.taskTwoImageParams.zoomVal >= 0.2) {
          img.style.setProperty('transform', `scale(${this.taskTwoImageParams.zoomVal})`)
        } else {
          this.taskTwoImageParams.zoomVal = 0.2
          img.style.setProperty('transform', `scale(${this.taskTwoImageParams.zoomVal})`)
          return false
        }
      },
      handleOriginImageMouseDown (event) {
        // event.preventDefault()
        if (event.which === 3) {
          event.target.style.setProperty('cursor', '-webkit-grabbing')
          this.originImageParams.flag = true
          // 鼠标按下时候的位置
          this.originImageParams.currentOffsetX = event.offsetX
          this.originImageParams.currentOffsetY = event.offsetY
        }
      },
      handleTaskOneImageMouseDown (event) {
        if (event.which === 3) {
          event.target.style.setProperty('cursor', '-webkit-grabbing')
          this.taskOneImageParams.flag = true
          // 鼠标按下时候的位置
          this.taskOneImageParams.currentOffsetX = event.offsetX
          this.taskOneImageParams.currentOffsetY = event.offsetY
        }
      },
      handleTaskTwoImageMouseDown (event) {
        // event.preventDefault()
        if (event.which === 3) {
          event.target.style.setProperty('cursor', '-webkit-grabbing')
          this.taskTwoImageParams.flag = true
          // 鼠标按下时候的位置
          this.taskTwoImageParams.currentOffsetX = event.offsetX
          this.taskTwoImageParams.currentOffsetY = event.offsetY
        }
      },
      handleOriginImageMouseUp (event) {
        event.target.style.setProperty('cursor', '-webkit-grab')
        this.originImageParams.flag = false
        // 这里存在一种可能：当按下鼠标却没有移动，会导致无法得到position
        let position = this.$refs.mainImage.style.getPropertyValue('object-position').split(' ').map((s) => {
          return parseInt(s.replace('px', ''))
        })
        if (isNaN(position[0]) || position[0] === undefined) {
          this.originImageParams.moveX = 0
        } else {
          this.originImageParams.moveX = position[0]
        }
        if (isNaN(position[1]) || position[1] === undefined) {
          this.originImageParams.moveY = 0
        } else {
          this.originImageParams.moveY = position[1]
        }
      },
      handleTaskOneImageMouseUp (event) {
        event.target.style.setProperty('cursor', '-webkit-grab')
        this.taskOneImageParams.flag = false
        let position = this.$refs.taskOneImage.style.getPropertyValue('object-position').split(' ').map((s) => {
          return parseInt(s.replace('px', ''))
        })
        if (isNaN(position[0]) || position[0] === undefined) {
          this.taskOneImageParams.moveX = 0
        } else {
          this.taskOneImageParams.moveX = position[0]
        }
        if (isNaN(position[1]) || position[1] === undefined) {
          this.taskOneImageParams.moveY = 0
        } else {
          this.taskOneImageParams.moveY = position[1]
        }
      },
      handleTaskTwoImageMouseUp (event) {
        event.target.style.setProperty('cursor', '-webkit-grab')
        this.taskTwoImageParams.flag = false
        let position = this.$refs.taskTwoImage.style.getPropertyValue('object-position').split(' ').map((s) => {
          return parseInt(s.replace('px', ''))
        })
        if (isNaN(position[0]) || position[0] === undefined) {
          this.taskTwoImageParams.moveX = 0
        } else {
          this.taskTwoImageParams.moveX = position[0]
        }
        if (isNaN(position[1]) || position[1] === undefined) {
          this.taskTwoImageParams.moveY = 0
        } else {
          this.taskTwoImageParams.moveY = position[1]
        }
      },
      handleOriginImageMouseOut (event) {
        event.target.style.setProperty('cursor', '-webkit-grab')
        this.originImageParams.flag = false
        event.preventDefault()
        let position = this.$refs.mainImage.style.getPropertyValue('object-position').split(' ').map((s) => {
          return parseInt(s.replace('px', ''))
        })
        if (isNaN(position[0]) || position[0] === undefined) {
          this.originImageParams.moveX = 0
        } else {
          this.originImageParams.moveX = position[0]
        }
        if (isNaN(position[1]) || position[1] === undefined) {
          this.originImageParams.moveY = 0
        } else {
          this.originImageParams.moveY = position[1]
        }
      },
      handleTaskOneImageMouseOut (event) {
        event.target.style.setProperty('cursor', '-webkit-grab')
        this.taskOneImageParams.flag = false
        let position = this.$refs.taskOneImage.style.getPropertyValue('object-position').split(' ').map((s) => {
          return parseInt(s.replace('px', ''))
        })
        if (isNaN(position[0]) || position[0] === undefined) {
          this.taskOneImageParams.moveX = 0
        } else {
          this.taskOneImageParams.moveX = position[0]
        }
        if (isNaN(position[1]) || position[1] === undefined) {
          this.taskOneImageParams.moveY = 0
        } else {
          this.taskOneImageParams.moveY = position[1]
        }
      },
      handleTaskTwoImageMouseOut (event) {
        event.target.style.setProperty('cursor', '-webkit-grab')
        this.taskTwoImageParams.flag = false
        let position = this.$refs.taskTwoImage.style.getPropertyValue('object-position').split(' ').map((s) => {
          return parseInt(s.replace('px', ''))
        })
        if (isNaN(position[0]) || position[0] === undefined) {
          this.taskTwoImageParams.moveX = 0
        } else {
          this.taskTwoImageParams.moveX = position[0]
        }
        if (isNaN(position[1]) || position[1] === undefined) {
          this.taskTwoImageParams.moveY = 0
        } else {
          this.taskTwoImageParams.moveY = position[1]
        }
      },
      handleOriginImageMouseMove (event) {
        if (this.originImageParams.flag) {
          let img = event.target
          let nowOffsetX = event.offsetX // 当前水平位置
          let nowOffsetY = event.offsetY // 当前垂直位置
          let moveX = nowOffsetX - this.originImageParams.currentOffsetX + this.originImageParams.moveX
          let moveY = nowOffsetY - this.originImageParams.currentOffsetY + this.originImageParams.moveY
          img.style.setProperty('object-position', `${parseInt(moveX)}px ${parseInt(moveY)}px`)
        }
        event.preventDefault()
        return false
      },
      handleTaskOneImageMouseMove (event) {
        if (this.taskOneImageParams.flag) {
          let img = event.target
          let nowOffsetX = event.offsetX // 当前水平位置
          let nowOffsetY = event.offsetY // 当前垂直位置
          let moveX = nowOffsetX - this.taskOneImageParams.currentOffsetX + this.taskOneImageParams.moveX
          let moveY = nowOffsetY - this.taskOneImageParams.currentOffsetY + this.taskOneImageParams.moveY
          img.style.setProperty('object-position', `${parseInt(moveX)}px ${parseInt(moveY)}px`)
        }
        event.preventDefault()
        return false
      },
      handleTaskTwoImageMouseMove (event) {
        if (this.taskTwoImageParams.flag) {
          let img = event.target
          let nowOffsetX = event.offsetX // 当前水平位置
          let nowOffsetY = event.offsetY // 当前垂直位置
          let moveX = nowOffsetX - this.taskTwoImageParams.currentOffsetX + this.taskTwoImageParams.moveX
          let moveY = nowOffsetY - this.taskTwoImageParams.currentOffsetY + this.taskTwoImageParams.moveY
          img.style.setProperty('object-position', `${parseInt(moveX)}px ${parseInt(moveY)}px`)
        }
        event.preventDefault()
        return false
      },
      handleChange (index) {
        this.currentIndex = index
        this.$emit('change', index)
      },
      initGallery () {
        // 初始化动作
        // 这里要考虑到items为空的可能
        if (this.items.length !== 0) {
          this.currentImage = this.items[this.startImageIndex].middleSrc
          this.currentCaption = this.items[this.startImageIndex].caption
          this.currentId = this.items[this.startImageIndex].id
          this.currentImagePath = this.items[this.startImageIndex].filePath
        }
        this.currentIndex = this.startImageIndex
        this.windowWidth = window.innerWidth
        this.windowHeight = window.innerHeight
      },
      handleImageLoaded () {
        // 响应@load，即响应onload=Xxx
        this.isLoading = false
        // 修改isLoading为false，更改当前图片的大小
        // this.updateCurrentImageSizes()
      },
      handleTaskOneImageLoaded () {
        this.taskOneIsLoading = false
      },
      pickImage (index) {
        console.log(index)
        // 根据index选择图片
        // 这里没选择一次新的图片，就需要 准备它的task1、task2,、task3、task4
        this.isLoading = true // 显示出加载标示
        this.taskOneIsLoading = true
        this.currentImage = this.items[index].middleSrc
        this.currentCaption = Object.prototype.hasOwnProperty.call(this.items[index], 'caption')
          ? this.items[index].caption
          : ''
        this.currentAlt = Object.prototype.hasOwnProperty.call(this.items[index], 'alt')
          ? this.items[index].alt
          : ''
        this.currentId = Object.prototype.hasOwnProperty.call(this.items[index], 'id')
          ? this.items[index].id
          : null
      },
      showNextImage () {
        // 显示下一张图 此处有bug，当只有一张图的时候，会重复显示index=0，而此时不会触发图片的 load
        this.isLoading = true
        if (this.items.length > this.currentIndex + 1) {
          this.currentIndex = this.currentIndex + 1
        } else if (this.items.length === 1) {
          // 如果只有一个图，直接将this.isLoading赋值为false，否则无法触发img的load导致bug
          this.isLoading = false
          return
        } else {
          this.currentIndex = 0
        }
        this.pickImage(this.currentIndex)
      },
      showPreviousImage () {
        // 显示上一张图片
        this.isLoading = true
        if (this.currentIndex !== 0) {
          this.currentIndex = this.currentIndex - 1
        } else if (this.items.length === 1) {
          this.isLoading = false
          return
        } else {
          this.currentIndex = this.items.length - 1
        }
        this.pickImage(this.currentIndex)
      },
      thumbnailStyle (index) {
        let color = this.currentIndex === index ? this.accentColor : this.baseColor
        return 'border-color:' + color
      },
      handleImageClick (index) {
        this.currentIndex = index
        this.pickImage(index)
      }
    },
    mounted () {
      // 在模板渲染成html后调用，通常是初始化页面完成后，再对html的dom节点进行一些需要的操作
      this.initGallery()
      // 立即执行函数
      void (() => {
        let img = document.getElementById('imageBox')
        // eslint-disable-next-line no-unused-vars
        const viewer = new Viewer(img)
      })()
      void (() => {
        let galleryThumbnailsContent = document.getElementById('galleryThumnailsContent')
        galleryThumbnailsContent.addEventListener('mousewheel', (event) => {
          let deltaY = event.deltaY // 用来判断是向上还是向下
          if (deltaY === 53) {
            galleryThumbnailsContent.scrollLeft += 50
          } else {
            galleryThumbnailsContent.scrollLeft -= 50
          }
        })
      })()
    },
    created () {
      ipcRenderer.on('resizeEvent', (event, sizeData) => {
        this.windowHeight = sizeData.windowHeight
        this.windowWidth = sizeData.windowWidth
      })
      ipcRenderer.on('getFilesBySelect-reply', (event, files) => {
        console.log('files' + files)
        this.$store.dispatch('ThriftClient/clear_images')
        this.$store.dispatch('ThriftClient/set_images', files)
        this.currentIndex = 0
      })
      ipcRenderer.on('getFilesByDirectory-reply', (event, files) => {
        console.log(files)
        this.$store.dispatch('ThriftClient/set_images', files)
        this.currentIndex = 0
      })
    },
    data () {
      return {
        currentImage: null, // 当前的图片file地址
        currentImagePath: null, // 当年图片的path地址
        currentImageWidth: 0,
        currentImageHeight: 0,
        currentId: null,
        currentCaption: '',
        currentAlt: '',
        currentIndex: 0,
        windowWidth: 0,
        windowHeight: 0,
        isLoading: true,
        taskOneIsLoading: false,
        taskTwoIsLoading: true,
        showLargeView: false,
        originImageParams: {
          zoomVal: 1,
          moveX: 0, // 已经在x移动的距离
          moveY: 0, // 已经在y移动的距离
          currentOffsetX: 0, // 当前的偏移x
          currentOffsetY: 0, // 当前的偏移Y
          flag: false
        },
        taskOneImageParams: {
          zoomVal: 1,
          moveX: 0,
          moveY: 0,
          currentOffsetX: 0,
          currentOffsetY: 0,
          flag: false
        },
        taskTwoImageParams: {
          zoomVal: 1,
          moveX: 0,
          moveY: 0,
          currentX: 0,
          currentY: 0,
          flag: false
        }
      }
    },
    components: {
      HalfCircleSpinner,
      LargeView
    }
    // directives: {
    //   picFlow
    // }
  }
</script>

<style lang="scss" scoped>
    /**/

    .galleryContainer {
        height: 92%;
        width: 100%;

        .imageBox {
            height: 80%;
            margin: 5px;
            padding: 5px;
            border: 1px solid black;
            display: flex;
            text-align: center;
            justify-content: space-between;

            .originImage {
                flex: 1;
                position: relative;
                margin: 10px;
                padding: 5px;
                background: #b3fab1;
                box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);
                -moz-border-radius: 4px;
                border-radius: 4px;
                color: rgba(0, 0, 0, 0.8);
                text-shadow: 0 1px 0 #fff;
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                -webkit-box-align: center;
                -ms-flex-align: center;
                align-items: center;
                -webkit-box-pack: center;
                -ms-flex-pack: center;
                justify-content: center;
                text-align: center;

                &:before &:after {
                    position: absolute;
                    content: "";
                    top: 10px;
                    bottom: 15px;
                    left: 10px;
                    width: 50%;
                    box-shadow: 0 15px 10px rgba(0, 0, 0, 0.5);
                    -webkit-transform: rotate(-3deg);
                    -moz-transform: rotate(-3deg);
                    -o-transform: rotate(-3deg);
                    -ms-transform: rotate(-3deg);
                    transform: rotate(-3deg);
                    z-index: -1;
                }

                &:after {
                    right: 10px;
                    left: auto;
                    -webkit-transform: rotate(3deg);
                    -moz-transform: rotate(3deg);
                    -o-transform: rotate(3deg);
                    -ms-transform: rotate(3deg);
                    transform: rotate(3deg);
                }

                a.control {
                    position: absolute;
                    padding-left: 5px;
                    padding-right: 5px;
                    top: 0;
                    height: 100%;
                    display: none;
                    font-size: 20px;
                    color: #fff;
                    cursor: pointer;
                    text-shadow: 0 0 20px rgba(0, 0, 0, 0.75);
                    transition: opacity 0.3s ease;
                    /*&:before {*/
                    /*    position: relative;*/
                    /*    top: calc(10%);*/
                    /*}*/
                    &:hover {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }

                    &.left {
                        left: 0;
                    }

                    &.right {
                        right: 0

                    }
                }

                &:hover {
                    a.control {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                }

                .box {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;

                    .spinner {
                        position: relative;
                        transform: translate(-50%, -50%);
                        left: 50%;
                        top: 50%;
                        width: 100%;
                        opacity: 10%;

                        .half-circle-spinner {
                            position: relative;
                            transform: translate(-50%, -50%);
                            left: 50%;
                            top: 50%;
                            width: 100%;
                            height: 100%;
                        }
                    }

                    img {
                        position: relative;
                        transform: translate(-50%, -50%);
                        left: 50%;
                        top: 50%;
                        width: 100%;
                        height: 100%;
                        border: 1px solid #fff;
                        cursor: -webkit-grab;
                        transition: opacity 0.25s ease;
                        display: block;
                        object-fit: cover;

                        &.loading {
                            opacity: 0.25;
                            transition: opacity 0.25s ease;
                        }

                    }
                }

                /*.box {*/
                /*    -webkit-transition:width 2s, height 2s,*/
                /*    background-color 2s, -webkit-transform 2s;*/
                /*    transition:width 2s, height 2s, background-color 2s, transform 2s;*/
                /*}*/
                /*.box:hover {*/
                /*    background-color: #FFCCCC;*/
                /*    -webkit-transform:rotate(180deg);*/
                /*    transform:rotate(180deg);*/
                /*}*/
            }

            .taskOneImage {
                flex: 1;
                margin: 10px;
                padding: 5px;
                background: #fafafa;
                box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);
                -moz-border-radius: 4px;
                border-radius: 4px;
                color: rgba(0, 0, 0, 0.8);
                text-shadow: 0 1px 0 #fff;
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                -webkit-box-align: center;
                -ms-flex-align: center;
                align-items: center;
                -webkit-box-pack: center;
                -ms-flex-pack: center;
                justify-content: center;
                text-align: center;
                overflow: hidden;

                &:before &:after {
                    position: absolute;
                    content: "";
                    top: 10px;
                    bottom: 15px;
                    left: 10px;
                    width: 50%;
                    box-shadow: 0 15px 10px rgba(0, 0, 0, 0.5);
                    -webkit-transform: rotate(-3deg);
                    -moz-transform: rotate(-3deg);
                    -o-transform: rotate(-3deg);
                    -ms-transform: rotate(-3deg);
                    transform: rotate(-3deg);
                    z-index: -1;
                }

                &:after {
                    right: 10px;
                    left: auto;
                    -webkit-transform: rotate(3deg);
                    -moz-transform: rotate(3deg);
                    -o-transform: rotate(3deg);
                    -ms-transform: rotate(3deg);
                    transform: rotate(3deg);
                }
                .box {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;

                    .spinner {
                        position: relative;
                        transform: translate(-50%, -50%);
                        left: 50%;
                        top: 50%;
                        width: 100%;
                        opacity: 10%;

                        .half-circle-spinner {
                            position: relative;
                            transform: translate(-50%, -50%);
                            left: 50%;
                            top: 50%;
                            width: 100%;
                            height: 100%;
                        }
                    }

                    img {
                        position: relative;
                        width: 100%;
                        height: 100%;
                        border: 1px solid #fff;
                        cursor: -webkit-grab;
                        transition: opacity 0.25s ease;
                        display: block;
                        object-fit: cover;

                        &.loading {
                            opacity: 0.25;
                            transition: opacity 0.25s ease;
                        }

                    }
                }

            }

            .taskTwoImage {
                flex: 1;
                margin: 10px;
                padding: 5px;
                background: #fafafa;
                box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);
                -moz-border-radius: 4px;
                border-radius: 4px;
                color: rgba(0, 0, 0, 0.8);
                text-shadow: 0 1px 0 #fff;
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                -webkit-box-align: center;
                -ms-flex-align: center;
                align-items: center;
                -webkit-box-pack: center;
                -ms-flex-pack: center;
                justify-content: center;
                text-align: center;
                overflow: hidden;

                &:before &:after {
                    position: absolute;
                    content: "";
                    top: 10px;
                    bottom: 15px;
                    left: 10px;
                    width: 50%;
                    box-shadow: 0 15px 10px rgba(0, 0, 0, 0.5);
                    -webkit-transform: rotate(-3deg);
                    -moz-transform: rotate(-3deg);
                    -o-transform: rotate(-3deg);
                    -ms-transform: rotate(-3deg);
                    transform: rotate(-3deg);
                    z-index: -1;
                }

                &:after {
                    right: 10px;
                    left: auto;
                    -webkit-transform: rotate(3deg);
                    -moz-transform: rotate(3deg);
                    -o-transform: rotate(3deg);
                    -ms-transform: rotate(3deg);
                    transform: rotate(3deg);
                }

                img {
                    width: 100%;
                    height: 100%;
                    border: 1px solid #fff;
                    cursor: pointer;
                    transition: opacity 0.25s ease;
                    display: block;
                    object-fit: cover;

                    &.loading {
                        opacity: 0.25;
                        transition: opacity 0.25s ease;
                    }
                }
            }
        }

        .galleryThumbnails {
            height: 15%;
            margin: 5px;
            padding: 5px;
            border: 1px solid black;
            display: flex;
            text-align: center;
            justify-content: space-between;


            .galleryThumbnailsContent {
                &::-webkit-scrollbar {
                    height: 8px;
                }

                &::-webkit-scrollbar-track {
                    border-radius: 10px;
                    background: #eaeaea;
                }

                &::-webkit-scrollbar-thumb {
                    border-radius: 10px;
                    background: #b4b4b4;
                }

                &::-webkit-scrollbar-thumb:window-inactive {
                    background: rgba(100, 100, 100, 0.4);
                }

                margin-top: 2px;
                width: auto;
                height: 100%;
                white-space: nowrap;
                display: flex;
                overflow-x: scroll;
                overflow-y: hidden;

                .galleryThumbnailsContentElem {
                    position: relative;
                    /*float: left;*/
                    margin: 20px;

                    img {
                        height: 100%;
                        border: 2px solid #fff;
                        cursor: pointer;
                        object-fit: contain;
                    }

                    .info {
                        /*   display: none; */
                        opacity: 0;
                        position: absolute;
                        transform: translate(-50%, -50%);
                        left: 50%;
                        top: 50%;
                        box-sizing: border-box;
                        background-color: rgba(0, 0, 0, .5);
                        width: 100%;
                        height: 100%;
                        text-align: center;
                        cursor: pointer;
                        /*padding-top: 40px;*/
                        -webkit-transition: .5s ease-out;

                    }

                    .info p {
                        color: #fff;
                        overflow: hidden;
                        margin: 0;
                        text-overflow: ellipsis;
                    }

                    .info:hover {
                        /*   -webkit-transition: 500ms; */
                        /*margin-top: 0;*/
                        opacity: 1;
                    }
                }
            }
        }
    }

    .galleryThumbnailsContent {
        height: 25%;
    }
</style>
