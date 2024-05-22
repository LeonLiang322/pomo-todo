import { ipcMain, BrowserWindow } from 'electron';
import { Worker } from 'worker_threads';
import path from 'node:path';

let timerWorker: Worker | null = null;

export function initTimerHandlers(win: BrowserWindow | null) {
    ipcMain.on('timer-create-worker', (event, startData) => {
        if (!timerWorker) {
            timerWorker = new Worker(path.join(__dirname, '../workers/timerWorker.js'), { workerData: startData });

            timerWorker.on('message', (data: any) => {
                switch (data.type) {
                    case 'pomo-period-toggled':
                        win?.webContents.send('show-toast', {
                            title: '专注时钟',
                            description: data.isFocusPeriod ? '专注计时开始' : '休息计时开始'
                        });
                        break;
                    case 'pomo-status-updated':
                        win?.webContents.send('pomo-update-badge', data);
                        break;
                    default:
                        win?.webContents.send('timer-update', data);
                        break;
                }
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

    ipcMain.on('get-timer-status', (event) => {
        if (timerWorker) {
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

    ipcMain.on('timer-control', (event, message) => {
        console.log('timer-control', message)
        timerWorker?.postMessage(message);
    });

    ipcMain.on('timer-terminate', () => {
        timerWorker?.terminate();
        timerWorker = null;
        win?.webContents.send('pomo-update-badge', { status: 'stopped', isFocusPeriod: true });
    });
}
