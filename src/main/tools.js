import {dialog} from 'electron'
import fs from 'fs'

function isPic (element, index, array) {
  // 用于数组过滤图片
  if (element.endsWith('.jpg') || element.endsWith('.jpeg') || element.endsWith('.png')) {
    return element
  }
}
// 实现打开多选图片文件、打开图片文件夹
export const getFilesBySelect = (browserWindow) => {
  const files = dialog.showOpenDialog(browserWindow, {
    properties: ['multiSelections'],
    filters: [
      {name: 'Image Files', extensions: ['png', 'jpeg', 'jpg']}
    ]
  })
  if (!files) {
    return []
  }
  return files
}

// 实现选择文件夹，打开文件下下所有的图片
export const getFilesByDirectory = (browserWindow) => {
  const directories = dialog.showOpenDialog(browserWindow, {
    properties: ['openDirectory']
  })
  if (!directories) {
    return []
  }
  const directory = directories[0] // 只选择了一个
  return new Promise((resolve, reject) => {
    let files = fs.readdirSync(directory).filter(isPic) // 只需要.png .jpg .jpeg结尾的
    try {
      resolve(files)
    } catch (e) {
      reject(e)
    }
  })
}
