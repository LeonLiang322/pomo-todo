import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
  min() {
    ipcRenderer.send('min')
  },
  max() {
    ipcRenderer.send('max')
  },
  close() {
    ipcRenderer.send('close')
  },
  log(data: any) {
    ipcRenderer.send('log', data)
  },
  sStoreGet(key: string) {
    return ipcRenderer.sendSync('storeGet', key)
  },
  sStoreSet(key: string, value: any) {
    ipcRenderer.send('storeSet', key, value)
  },
  sStoreDel(key: string) {
    ipcRenderer.send('storeDel', key)
  },
  cStoreGet(key: string) {
    return ipcRenderer.sendSync('cStoreGet', key)
  },
  cStoreSet(key: string, value: any) {
    ipcRenderer.send('cStoreSet', key, value)
  },
  cStoreDel(key: string) {
    ipcRenderer.send('cStoreDel', key)
  },


  // You can expose other APTs you need here.
  // ...
})
