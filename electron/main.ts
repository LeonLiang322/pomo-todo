import { app, ipcMain, BrowserWindow } from 'electron';
import Store from 'electron-store';
import path from 'node:path';
import windowStateKeeper from 'electron-window-state';
import { Worker } from 'worker_threads';

process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public');

let win: BrowserWindow | null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

const configStore = new Store({ name: 'config' });

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
    win.loadURL(VITE_DEV_SERVER_URL).then(() => {
      console.log('Dev Server', VITE_DEV_SERVER_URL);
    })
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html')).then();
  }

  win.on('closed', () => {
    win = null;
    if (timerWorker) {
      timerWorker.terminate();
      timerWorker = null;
    }
  });
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

ipcMain.on('timer-create-worker', (event, startData) => {
  if (!timerWorker) {
    timerWorker = new Worker(path.join(__dirname, '../worker/timerWorker.js'), { workerData: startData });

    console.log('timerWorker created', startData)

    timerWorker.on('message', (data: any) => {
      win?.webContents.send('timer-update', data);
    });

    timerWorker.on('error', (err: any) => {
      console.error('Worker error:', err);
    });

    timerWorker.on('exit', (code: any) => {
      if (code !== 0) console.log(`Worker stopped with exit code ${code}`);
      timerWorker = null;
    });
  }
});

ipcMain.on('timer-terminate', () => {
  timerWorker?.terminate();
  timerWorker = null;
});

// 接收来自渲染进程的控制命令
ipcMain.on('timer-control', (event, message) => {
  console.log('timer-control', message)
  timerWorker?.postMessage(message);
});

ipcMain.on('get-timer-status', (event) => {
  if (timerWorker) {
    console.log('get-timer-status')
    timerWorker.postMessage({ command: 'get-status' });
    timerWorker.once('message', (data) => {
      event.reply('timer-status', {
        isRunning: data.isRunning,
        remainingTime: data.remainingTime,
        isFocusPeriod: data.isFocusPeriod
      });
    });
  } else {
    event.reply('timer-status', null);
  }
});

ipcMain.on('min', (e) => {
  win?.minimize();
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

const sessionStore = new Store({ name: 'session' })

ipcMain.on('config-store-get', (e, key) => {
  const value = configStore.get(key)
  e.returnValue = value || ""
})

ipcMain.on('config-store-set', (e, data) => {
  configStore.set(data)
})

ipcMain.on('config-store-del', (e, keys) => {
  for (const key of keys) configStore.delete(key)
})

ipcMain.on('session-store-get', (e, key) => {
  const value = sessionStore.get(key)
  e.returnValue = value || ""
})

ipcMain.on('sStoreSet', (e, data) => {
  sessionStore.set(data)
})

ipcMain.on('sStoreDel', (e, keys) => {
  for (const key of keys) sessionStore.delete(key)
})

app.whenReady().then(() => {
  createWindow();
})
