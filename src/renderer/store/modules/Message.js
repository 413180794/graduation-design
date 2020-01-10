const namespaced = true

const state = {
  messages: []
}
// mutaion只能实现同步变更state对象。如果需要实现异步变更，
// 那么 应该使用action
const mutations = {
  addMessage (state, newMessage) {
    console.log('添加一次')
    state.messages.push(newMessage)
  },
  addMessages (state, newMessages) {
    state.messages.push(...newMessages)
  }
}

const actions = {
  getMessages ({commit}) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('123')
      }, 1000)
    }).then((s) => {
      console.log('添加内容：', s)
      commit('addMessage', s)
    })
  }
}
export default {
  state,
  mutations,
  actions,
  namespaced
}
