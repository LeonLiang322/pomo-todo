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
    return ipcRenderer.sendSync('sStoreGet', key)
  },
  sStoreSet(data: object) {
    ipcRenderer.send('sStoreSet', data)
  },
  sStoreDel(keys: string[]) {
    ipcRenderer.send('sStoreDel', keys)
  },
  cStoreGet(key: string) {
    return ipcRenderer.sendSync('cStoreGet', key)
  },
  cStoreSet(data: object) {
    ipcRenderer.send('cStoreSet', data)
  },
  cStoreDel(keys: string[]) {
    ipcRenderer.send('cStoreDel', keys)
  },


  // You can expose other APTs you need here.
  // ...
})
