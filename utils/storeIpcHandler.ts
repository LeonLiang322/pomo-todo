import { ipcMain } from 'electron';
import Store from 'electron-store';

const configStore = new Store({ name: 'config' });
const sessionStore = new Store({ name: 'session' });

export function initStoreHandlers() {
    ipcMain.on('config-store-get', (e, key) => {
        const value = configStore.get(key);
        e.returnValue = value || "";
    });

    ipcMain.on('config-store-set', (e, data) => {
        configStore.set(data);
    });

    ipcMain.on('config-store-del', (e, keys) => {
        for (const key of keys) configStore.delete(key);
    });

    ipcMain.on('session-store-get', (e, key) => {
        const value = sessionStore.get(key);
        e.returnValue = value || "";
    });

    ipcMain.on('session-store-set', (e, data) => {
        sessionStore.set(data);
    });

    ipcMain.on('session-store-del', (e, keys) => {
        for (const key of keys) sessionStore.delete(key);
    });
}
