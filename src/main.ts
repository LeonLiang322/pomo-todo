import { createApp } from 'vue'
import App from './App.vue'
import './assets/index.css'
import './assets/global.css'
import msgToaster from "@/lib/toast.ts";
import router from './router'

const app = createApp(App);

app.config.globalProperties.$toast = msgToaster;

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $toast: (msg: string, title?: string) => void;
  }
}

app.use(router);
app.mount('#app').$nextTick(() => {
  // Use contextBridge
  window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message);
  })
}).then()
