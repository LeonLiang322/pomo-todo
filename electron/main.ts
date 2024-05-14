import { app, ipcMain, BrowserWindow } from 'electron'
import Store from 'electron-store'
import path from 'node:path'

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegrationInWorker: true,
    },
    frame: false
  })

  win.webContents.openDevTools()
  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})


ipcMain.on('min', (e) => {
  win?.minimize()
})

ipcMain.on('max', (e) => {
  if (win?.isMaximized()) {
    win?.unmaximize()
  } else {
    win?.maximize()
  }
})

ipcMain.on('close', (e) => {
  win?.close()
})

ipcMain.on('log', (e, data) => {
  console.log('log', data)
});

const db = require('../src/db/connect.ts')
console.log(db ? 'db connected' : 'db not connected')

const configStore = new Store({ name: 'config' })
const sessionStore = new Store({ name: 'session' })

ipcMain.on('cStoreGet', (e, key) => {
  const value = configStore.get(key)
  e.returnValue = value || ""
})

ipcMain.on('cStoreSet', (e, key, value) => {
  configStore.set(key, value)
})

ipcMain.on('cStoreDel', (e, key) => {
  configStore.delete(key)
})

ipcMain.on('sStoreGet', (e, key) => {
  const value = sessionStore.get(key)
  e.returnValue = value || ""
})

ipcMain.on('sStoreSet', (e, key, value) => {
  sessionStore.set(key, value)
})

ipcMain.on('sStoreDel', (e, key) => {
  sessionStore.delete(key)
})

app.whenReady().then(() => {
  createWindow();
})
