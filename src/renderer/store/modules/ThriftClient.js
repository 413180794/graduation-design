import thrift from 'thrift'
// import {nativeImage} from 'electron'
import path from 'path'
// import fs from 'fs'

const namespaced = true
const clientTypes = require('../../../../static/thrift_js/client_types')
const predictService = require('../../../../static/thrift_js/predictService')

console.log(clientTypes)
// 配置thrift的connection信息
// images用于存放当前程序中所有的图像地址
// task*列表中存放当前程序中识别后的图像
const state = {
  images: [],
  coverList: [],
  task1_result: [],
  task2_result: [],
  task3_result: [],
  task4_result: [],
  connection: null,
  client: null
}
const getters = {
  items: function (state) {
    // 这里考虑将一张图制作成以下几种图
    // 原图-缩略图（长宽乘以30%）-中型图（长宽乘以60%）
    return state.images.map(function (image) {
      return {
        originSrc: 'file://' + image,
        middleSrc: 'file://' + image,
        thumbnail: 'file://' + image,
        caption: path.basename(image)
      }
    })
  }
  // coverList: function (state) {
  //   return [
  //     {
  //       cover: 'file:///home/zhangfan/workData/LinuxCode/WebProject/graduation-design/static/img_1.jpg',
  //       title: 'fdf'
  //     },
  //     {
  //       cover: 'file:///home/zhangfan/workData/LinuxCode/WebProject/graduation-design/static/img_2.jpg',
  //       title: 'fasd'
  //     }
  //   ]
  // }
}
// mutation只能实现同步变更state对象。如果需要实现异步变更，
// 那么 应该使用action
const mutations = {
  SETUP_CONNECTION () {
    // 建立连接，不允许重复建立连接
    if (state.connection !== null && state.client !== null) {
      console.log('连接已经建立')
      return
    }
    state.connection = thrift.createConnection('127.0.0.1', 8080)
    // 根据配置的connection创建client
    state.client = thrift.createClient(predictService, state.connection)
  },
  SET_IMAGES (state, images) {
    //  重新设置数组
    state.images = images
  },
  CLEAR_IMAGES (state) {
    // 清空数组
    state.images.splice(0, state.images.length)
  },
  SET_TASK1_RESULT (state, task1Result) {
    // 设置任务一识别结果
    state.task1_result = task1Result
  },
  SET_TASK2_RESULT (state, task2Result) {
    // 置任务二识别结果
    state.task2_result = task2Result
  },
  SET_TASK3_RESULT (state, task3Result) {
    state.task3_result = task3Result
  },
  SET_TASK4_RESULT (state, task4Result) {
    state.task4_result = task4Result
  },
  CLEAR_TASK1_RESULT (state) {
    state.task1_result.splice(0, state.task1_result.length)
  },
  CLEAR_TASK2_RESULT (state) {
    state.task2_result.splice(0, state.task2_result.length)
  },
  CLEAR_TASK3_RESULT (state) {
    state.task3_result.splice(0, state.task3_result.length)
  },
  CLEAR_TASK4_RESULT (state) {
    state.task4_result.splice(0, state.task4_result.length)
  }
}
// 直接返回 promise而不是使用回调函数
const actions = {
  setup_connection ({commit}) {
    // 异步建立连接
    return new Promise((resolve) => {
      commit('SETUP_CONNECTION')
      resolve('连接已建立')
    })
  },
  set_images ({commit}, images) {
    return new Promise((resolve) => {
      commit('SET_IMAGES', images)
      resolve('图片数组设置成功')
    })
  },
  clear_images ({commit}) {
    return new Promise((resolve) => {
      commit('CLEAR_IMAGES')
      resolve('图片数组清除成功')
    })
  },
  clear_task1_result ({commit}) {
    return new Promise((resolve) => {
      commit('CLEAR_TASK1_RESULT')
      resolve('任务一结果数组清除成功')
    })
  },
  clear_task2_result ({commit}) {
    return new Promise((resolve) => {
      commit('CLEAR_TASK2_RESULT')
      resolve('任务二结果数组清除成功')
    })
  },
  clear_task3_result ({commit}) {
    return new Promise((resolve) => {
      commit('CLEAR_TASK3_RESULT')
      resolve('任务三结果数组清除成功')
    })
  },
  clear_task4_result ({commit}) {
    return new Promise((resolve) => {
      commit('CLEAR_TASK4_RESULT')
      resolve('任务四结果数组清除成功')
    })
  },
  predict_task1 ({commit}) {
    return state.client.seg_predict_images_task1(state.images)
      .then(function (err, task1Result) {
        if (err) {
          throw new Error('task1识别结果出现异常')
        }
        commit('SET_TASK1_RESULT', task1Result)
      })
  },
  predict_task2 ({commit}) {
    return state.client.seg_predict_images_task2(state.images)
      .then(function (err, task2Result) {
        if (err) {
          throw new Error('task2识别结果出现异常')
        }
        commit('SET_TASK2_RESULT', task2Result)
      })
  },
  predict_task3 ({commit}) {
    return state.client.cls_predict_images_task3(state.images)
      .then(function (err, task3Result) {
        if (err) {
          throw new Error('task3识别结果出现异常')
        }
        commit('SET_TASK3_RESULT', task3Result)
      })
  },
  predict_task4 ({commit}) {
    return state.client.cls_predict_images_task4(state.images)
      .then(function (err, task4Result) {
        if (err) {
          throw new Error('task4识别结果出现异常')
        }
        commit('SET_TASK4_RESULT', task4Result)
      })
  }
}
export default {
  state,
  mutations,
  actions,
  getters,
  namespaced
}
