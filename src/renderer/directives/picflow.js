function setTransform3D (el, degree, perspective, z) {
  degree = Math.max(Math.min(degree, 90), -90)
  z -= 5
  el.style['-webkit-perspective'] = el.style['perspective'] = el.style['-moz-perspective'] = perspective + 'px'
  el.style['-webkit-transform'] = el.style['transform'] = 'rotateY(' + degree + 'deg) translateZ(' + z + 'px)'
}

function displayIndex (imgSize, spacing, left, imgs, index, flat, width, vnode) {
  let mLeft = (width - imgSize) * 0.5 - spacing * (index + 1) - imgSize * 0.5

  for (let i = 0; i <= index; i++) {
    imgs[i].style.left = (left + i * spacing + spacing) + 'px'
    imgs[i].style.marginLeft = mLeft + 'px'
    imgs[i].style['-webkit-filter'] = 'brightness(0.65)'
    imgs[i].style.zIndex = i + 1
    setTransform3D(imgs[i], flat ? 0 : ((index - i) * 10 + 45), 300, flat ? -(index - i) * 10 : (-(index - i) * 30 - 20))
  }

  imgs[index].style['-webkit-filter'] = 'none'
  imgs[index].style.marginLeft = (mLeft + imgSize * 0.5) + 'px'
  imgs[index].style.zIndex = imgs.length

  setTransform3D(imgs[index], 0, 0, 5)

  for (let j = index + 1; j < imgs.length; ++j) {
    imgs[j].style.left = (left + j * spacing + spacing) + 'px'
    imgs[j].style.marginLeft = (mLeft + imgSize) + 'px'
    imgs[j].style['-webkit-filter'] = 'brightness(0.7)'
    imgs[j].style.zIndex = imgs.length - j
    setTransform3D(imgs[j], flat ? 0 : ((index - j) * 10 - 45), 300, flat ? (index - j) * 10 : ((index - j) * 30 - 20))
  }

  if (vnode.context.currentIndex !== index) {
    vnode.context.handleChange(index)
  }
}

function bindAndUpdated (el, binding, vnode) {
  /**
   * el 指令所绑定的元素，可以用来直接操作DOM
   * binding: 一个对象，什么对象？
   * vnode：Vue编译生成的虚拟节点。
   * oldVnode：上一个虚拟节点
   * @type {number}
   */
  console.log(arguments)
  console.log('执行')
  let coverWidth = parseInt(vnode.context.coverWidth)
  let coverHeight = parseInt(vnode.context.coverHeight)
  // 空隙？
  let spacing = (coverWidth + coverHeight) / 2 + 10
  // 阴影
  let shadow = vnode.context.coverShadow
  // 背景颜色
  let bgColor = vnode.context.bgColor
  // 展开？
  let flat = vnode.context.coverFlat
  // 什么宽度？
  let width = vnode.context.width

  let startImageIndex = vnode.context.startImageIndex
  vnode.context.currentIndex = startImageIndex
  let imgSize = Math.max(coverWidth, coverHeight)

  let imgs = []
  for (let i = 0; i < el.childNodes.length; i++) {
    let childNode = el.childNodes[i]
    // 拿到添加的每一个图片节点,为图片节点设置样式
    childNode.style.position = 'absolute'
    childNode.style.width = imgSize + 'px'
    childNode.style.height = imgSize + 'px'
    childNode.style.bottom = '60px'
    childNode.style.transition = 'transform .4s ease, margin-left .4s ease, -webkit-filter .4s ease'
    imgs.push(childNode)
  }
  el.style.overflowX = 'hidden'
  el.style.backgroundColor = bgColor
  el.style.width = width + 'px'

  if (shadow) {
    el.style.height = (imgSize * 2 + 80) + 'px'
    el.style['-webkit-perspective-origin'] = el.style['perspective-origin'] = el.style['-moz-perspective-origin'] = '50% 25%'

    for (let k = 0; k < imgs.length; k++) {
      imgs[k].style.bottom = (20 + imgSize) + 'px'
      imgs[k].style['-webkit-box-reflect'] = 'below 0 -webkit-gradient(linear, 30% 20%, 30% 100%, from(transparent), color-stop(0.3, transparent), to(rgba(0, 0, 0, 0.8)))'
    }
  } else {
    el.style.height = (imgSize + 80) + 'px'
  }

  el.style.position = 'relative'

  displayIndex(imgSize, spacing, el.scrollLeft, imgs, startImageIndex, flat, parseInt(el.style.width), vnode)

  function handleClick (event) {
    if (event.target && event.target.nodeName.toUpperCase() === 'IMG') {
      let index = imgs.indexOf(event.target)
      console.log('点击', index)
      displayIndex(imgSize, spacing, el.scrollLeft, imgs, index, flat, parseInt(el.style.width), vnode)
    }
  }

  el.addEventListener('click', handleClick, false)
  let wheel = false
  el.addEventListener('mousewheel', (event) => {
    let index = vnode.context.currentIndex
    if (event.deltaY > 0 && !wheel) {
      // 滚轮向下滑动
      wheel = true
      if (index < imgs.length - 1) {
        console.log('向下')
        displayIndex(imgSize, spacing, el.scrollLeft, imgs, index + 1, flat, parseInt(el.style.width), vnode)
      }
      setTimeout(function () {
        wheel = false
      }, 200)
    } else if (event.deltaY < 0 && !wheel) {
      // 滚轮向上滑动
      wheel = true
      console.log('向上')
      if (index > 0) {
        displayIndex(imgSize, spacing, el.scrollLeft, imgs, index - 1, flat, parseInt(el.style.width), vnode)
      }
      setTimeout(function () {
        wheel = false
      }, 200)
    }
  })
  el.$destroy = () => {
    el.removeEventListener('click', handleClick, false)
  }
}

export default {
  bind: bindAndUpdated,
  inserted: bindAndUpdated,
  unbind: function (el) {
    el.$destroy()
  }
}
