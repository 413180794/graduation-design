<template>
    <div class="galleryContainer">
        <div class="gallery" style="height: 100%">
            <!--大图显示，large-view后续换一个更好的-->
            <large-view
                    id="largeView"
                    :accent-color="accentColor"
                    :item="items[currentIndex]"
                    v-if="showLargeView"
                    @close-large-view="showLargeView=false"
            />
            <div class="imageBox">

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
                                :class="{ loading: isLoading }"
                                :src="currentImage"
                                @click="handleLargeImageClick"
                                @load="handleImageLoaded"
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
                    <img src="file:///home/zhangfan/workData/LinuxCode/WebProject/graduation-design/static/img_1.jpg"
                         alt="">
                </div>
                <div class="taskTwoImage">
                    <img src="file:///home/zhangfan/workData/LinuxCode/WebProject/graduation-design/static/img_2.jpg"
                         alt="">
                </div>
            </div>
            <div class="galleryThumbnails">
                <div class="galleryThumbnailsContent">
<!--                    <div-->
<!--                            :key="index"-->
<!--                            class="galleryThumbnailsContentElem"-->
<!--                            v-for="(item, index) in items"-->
<!--                    >-->
<!--                        <img-->
<!--                                :alt="Object.prototype.hasOwnProperty.call(item, 'alt') ? item.alt : ''"-->
<!--                                :src="item.thumbnail"-->
<!--                                :style="thumbnailStyle(index)"-->
<!--                                height="64"-->
<!--                                v-on="-->
<!--                        currentIndex !== index-->
<!--                          ? { click: () => handleImageClick(index) }-->
<!--                          : {}-->
<!--                      "-->
<!--                        />-->
<!--                    </div>-->
                    <div class="pic-flow" v-pic-flow>
                        <img v-for="(item,index) of items"
                             :src="item.middleSrc"
                             :key="index"
                             alt="123">
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
  import picFlow from '../directives/picflow'

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
      }
    },
    methods: {
      handleChange (index) {
        this.currentIndex = index
        this.$emit('change', index)
      },
      initGallery () {
        // 初始化动作
        console.log(this.items)
        console.log(this.startImageIndex)
        this.currentImage = this.items[this.startImageIndex].middleSrc
        this.currentCaption = this.items[this.startImageIndex].caption
        this.currentId = this.items[this.startImageIndex].id
        this.currentIndex = this.startImageIndex
        this.windowWidth = window.innerWidth
        this.windowHeight = window.innerHeight
      },
      handleImageLoaded () {
        // 响应@load，即响应onload=Xxx
        this.isLoading = false
        // 修改isLoading为false，更改当前图片的大小
        this.updateCurrentImageSizes()
      },
      updateCurrentImageSizes () {
        let img =
          this.$refs.mainImage && Object.prototype.hasOwnProperty.call(this.$refs.mainImage, 'src')
            ? this.$refs.mainImage
            : this.$refs.mainImage.$el ? this.$refs.mainImage.$el.getElementsByTagName('img')[0] : null
        if (img) {
          this.currentImageWidth = img.naturalWidth
          this.currentImageHeight = img.naturalHeight
        }
      },
      handleLargeImageClick () {
        // 显示出图片的大图
        this.showLargeView = true
      },
      pickImage (index) {
        // 根据index选择图片
        this.isLoading = true // 显示出加载标示
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
        // 显示上一张图片
        this.isLoading = true

        if (this.items.length > this.currentIndex + 1) {
          this.currentIndex = this.currentIndex + 1
        } else {
          this.currentIndex = 0
        }

        this.pickImage(this.currentIndex)
      },
      showPreviousImage () {
        // 显示下一张图片
        this.isLoading = true

        if (this.currentIndex !== 0) {
          this.currentIndex = this.currentIndex - 1
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
      this.initGallery()
    },
    created () {
      ipcRenderer.on('resizeEvent', (event, sizeData) => {
        console.log(sizeData)
        this.windowHeight = sizeData.windowHeight
        this.windowWidth = sizeData.windowWidth
      })
    },
    data () {
      return {
        currentImage: null, // 当前的图片
        currentImageWidth: 0,
        currentImageHeight: 0,
        currentId: null,
        currentCaption: '',
        currentAlt: '',
        currentIndex: 0,
        windowWidth: 0,
        windowHeight: 0,
        isLoading: true,
        showLargeView: false
      }
    },
    components: {
      HalfCircleSpinner,
      LargeView
    },
    directives: {
      picFlow
    }
  }
</script>

<style lang="scss" scoped>
    /**/
    ::-webkit-scrollbar {
        display: none;
    }

    .galleryContainer {
        height: 100%;

        .imageBox {
            width: 100%;
            height: 75%;
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
                    height: 100%;

                    img {
                        position: relative;
                        transform: translate(-50%, -50%);
                        left: 50%;
                        top: 50%;
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
                    height: 100%;
                    width: 100%;
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
            height: 25%;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            &::-webkit-scrollbar {
                height: 6px;
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
            .galleryThumbnailsContent{
                margin-top: 2px;
                width: auto;
                white-space: nowrap;
                .galleryThumbnailsContentElem {
                    display: inline-block;
                    scroll-snap-align: start;
                    img {
                        border: 2px solid #fff;
                        cursor: pointer;
                    }
                }
            }
        }
    }
</style>
