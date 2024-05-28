import { ipcMain } from 'electron';
import Store from 'electron-store';

const configStore = new Store({ name: 'config' });
const dataStore = new Store({ name: 'data' });

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

    ipcMain.on('data-store-get', (e, key) => {
        const value = dataStore.get(key);
        e.returnValue = value || "";
    });

    ipcMain.on('data-store-set', (e, data) => {
        dataStore.set(data);
    });

    ipcMain.on('data-store-del', (e, keys) => {
        for (const key of keys) dataStore.delete(key);
    });
}
