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
                                    color="#3498db"
                                    :size="60"
                                    v-if="originIsLoading"
                            />
                        </div>
                        <vue-slideshow :data="items" :config="originConfig" :currentIndex="currentIndex" v-on:indexChange="handleIndexChange"></vue-slideshow>
                        <!--图片的文字说明-->
                        <!--添加向左向右的箭头-->
                    </div>
                </div>
                <div class="taskOneImage">
                    <div class="box">
                        <div class="spinner">
                            <half-circle-spinner
                                    :animation-duration="1000"
                                    color="#3498db"
                                    :size="60"
                                    v-if="taskOneIsLoading"
                            />
                        </div>
                        <vue-slideshow :data="taskOneResult" :config="taskOneConfig"></vue-slideshow>
                    </div>
                </div>
                <div class="taskTwoImage">
                    <div class="box">
                        <div class="spinner">
                            <half-circle-spinner
                                    :animation-duration="1000"
                                    color="#3498db"
                                    :size="60"
                                    v-if="taskTwoIsLoading"
                            />
                        </div>
                        <vue-slideshow :data="taskTwoResult" :config="taskTwoConfig"></vue-slideshow>
                    </div>
                </div>
            </div>
            <div class="galleryThumbnails">
                <div class="galleryThumbnailsContent" id="galleryThumnailsContent">
                    <div :key="index" class="galleryThumbnailsContentElem" v-for="(item, index) in items">
                        <img
                                :alt="Object.prototype.hasOwnProperty.call(item, 'alt') ? item.alt : ''"
                                :src="item.src"
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
  import {ipcRenderer} from 'electron'
  import path from 'path'
  import Viewer from 'viewerjs'
  import 'viewerjs/dist/viewer.css'
  import VueSlideShow from './SlideShow'

  export default {
    name: 'PicFlow',
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
      }
    },
    methods: {
      handleIndexChange (index) {
        // 使得子组件响应父组件，得到双向绑定的效果
        this.currentIndex = index
      },
      initGallery () {
        // 初始化动作
        // 这里要考虑到items为空的可能
        this.windowWidth = window.innerWidth
        this.windowHeight = window.innerHeight
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
      thumbnailStyle (index) {
        let color = this.currentIndex === index ? '#3498db' : '#fff'
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
        currentIndex: 0,
        windowWidth: 0,
        windowHeight: 0,
        originIsLoading: false,
        taskOneIsLoading: false,
        taskTwoIsLoading: false,
        taskThreeIsLoading: false,
        originConfig: {
          effect: 'fade'
        },
        taskOneConfig: {
          effect: 'fade'
        },
        taskTwoConfig: {
          effect: 'fade'
        },
        taskThreeConfig: {
          effect: 'fade'
        }
      }
    },
    components: {
      HalfCircleSpinner,
      LargeView,
      VueSlideshow: VueSlideShow
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
                    display: none;
                    width: 40px;
                    height: 40px;
                    background-image: url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNTU1NzI0MjA4NjA5IiBjbGFzcz0iaWNvbiIgc3R5bGU9IiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjIyOTAiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjgiIGhlaWdodD0iMjgiPjxkZWZzPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+PC9zdHlsZT48L2RlZnM+PHBhdGggZD0iTTY3MC42NzY5MjkgNzc3LjU5Mjk4NCA0MDMuNjI3NzggNTEzLjM2MjAyMWwyNjUuMzIwNzg1LTI2OC4xNDYxMzNjMTEuNzc2MjA4LTExLjc3NTE4NCAxMS43MzQyNTItMzAuOTA4OTY0LTAuMDkxMDc0LTQyLjczNDI5bC0wLjAwMTAyMyAwYy0xMS44MjUzMjYtMTEuODI2MzUtMzAuOTU4MDgyLTExLjg2NzI4Mi00Mi43MjgxNSAyLjkzMDc0OUwzNDMuMTAwMjQyIDQ4OC40NDA0MjFjLTMuODE3OTU1IDQuMjczMzI3LTguMjA1ODkyIDkuMzIxMjk2LTguOTMzNDYzIDEyLjA0NTMzNy00LjQ3MDgyNSAxMS4xMTIwODItMi4yMzI4NTQgMjQuNzY1MDMzIDYuNzEwODQyIDM1Ljk4NzYzMmwyODYuOTgyMTMgMjg2Ljk4MjEzYzExLjg3NTQ2OCA4Ljg0NzUwNSAzMS4wOTYyMjkgOC44OTM1NTQgNDIuOTIyNTc4LTIuOTMyNzk2QzY4Mi42MDY2MzMgODA4LjY5NjM3NiA2ODIuNTYwNTg0IDc4OS40NzY2MzkgNjcwLjY3NjkyOSA3NzcuNTkyOTg0eiIgcC1pZD0iMjI5MSIgZmlsbD0iI2ZmZmZmZiI+PC9wYXRoPjwvc3ZnPg==");
                    background-color: rgba(0, 0, 0, .5);
                    background-position: center;
                    background-repeat: no-repeat;
                    position: absolute;
                    top: 50%;
                    border-radius: 50%;
                    cursor: pointer;
                    transform: translateY(-50%);

                    &:hover {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }

                    &.left {
                        left: 15px;
                    }

                    &.right {
                        right: 15px;
                        transform: translateY(-50%) rotate(180deg)
                    }
                }

                &:hover {
                    a.control {
                        display: block;
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

                    vue-slideshow {
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
