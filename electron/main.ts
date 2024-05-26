import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import windowStateKeeper from 'electron-window-state';
import { Worker } from 'worker_threads';
import { initWindowHandlers } from "../utils/windowIpcHandler.ts";
import { initTimerHandlers } from "../utils/timerIpcHandler.ts";
import { initStoreHandlers } from "../utils/storeIpcHandler.ts";
import initDataBase from "../utils/dbIpcHandler.ts";

process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public');

let win: BrowserWindow | null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

let timerWorker: Worker | null = null;

function createWindow() {
  let mainWindowState = windowStateKeeper({
    defaultWidth: 800,
    defaultHeight: 600,
    fullScreen: true
  });

  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegrationInWorker: true,
    },
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minHeight: 600,
    minWidth: 300,
    frame: false,
    show: false
  })

  mainWindowState.manage(win);
  win.once('ready-to-show', () => {
    win?.show();
  });

  win.webContents.openDevTools();
  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString());
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL).then();
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html')).then();
  }

  win.on('closed', () => {
    win = null;
    if (timerWorker) {
      timerWorker.terminate().then();
      timerWorker = null;
    }
  });

  initWindowHandlers(win);
  initTimerHandlers(win);
}

initStoreHandlers();
initDataBase();

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

app.whenReady().then(() => {
  createWindow();
})
