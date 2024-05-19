import { createApp } from 'vue'
import App from './App.vue'
import './assets/index.css'
import './assets/global.css'
import router from './router'

const app = createApp(App);

app.use(router);
app.mount('#app').$nextTick(() => {
  // Use contextBridge
  // window.ipcRenderer.on('main-process-message', (_event, message) => {
  //   console.log(message);
  // })
}).then()
