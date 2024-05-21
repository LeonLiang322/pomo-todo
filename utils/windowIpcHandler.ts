import { ipcMain, BrowserWindow } from 'electron';

export function initWindowHandlers(win: BrowserWindow | null) {
    ipcMain.on('min', () => {
        win?.minimize();
    });

    ipcMain.on('max', () => {
        if (win?.isMaximized()) {
            win?.unmaximize();
        } else {
            win?.maximize();
        }
    });

    ipcMain.on('close', () => {
        win?.close();
    });
}
