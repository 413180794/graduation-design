'use strict'
import {app, BrowserWindow, Menu, ipcMain, dialog} from 'electron'
import {getFilesByDirectory, getFilesBySelect} from './tools'
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  Menu.setApplicationMenu(null)
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
    frame: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false
    }
  })

  mainWindow.loadURL(winURL)
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  mainWindow.on('resize', (event) => {
    let sizeData = mainWindow.getContentBounds()
    event.sender.send('resizeEvent', sizeData)
  })
}

app.on('ready', () => {
  createWindow()
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('getFilesBySelect', (event, arg) => {
  event.sender.send('getFilesBySelect-reply', getFilesBySelect(mainWindow))
})

ipcMain.on('getFilesByDirectory', (event, arg) => {
  // 读取文件夹下所有的图片
  getFilesByDirectory(mainWindow).then(function (files) {
    event.sender.send('getFilesByDirectory-reply', files)
  }).catch((error) => {
    dialog.showErrorBox('错误', error)
  })
})
/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
