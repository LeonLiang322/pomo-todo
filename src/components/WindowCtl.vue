<script setup lang="ts">
const ipc = (window as any).ipcRenderer;
const min = () => {
  ipc.send('min');
}
const max = () => {
  ipc.send('max');
}
const close = () => {
  ipc.send('close');
}
</script>

<template>
  <div class="flex items-center h-full">
    <div class="win-ctl-btn z-10" @click="min">
      <div class="bg-green-500 border-green-600 cursor-pointer" />
    </div>
    <div class="win-ctl-btn" @click="max">
      <div class="bg-yellow-400 border-amber-500" />
    </div>
    <div class="win-ctl-btn" @click="close">
      <div class="bg-red-500 border-red-600" />
    </div>
  </div>
</template>

<style scoped>
</style>
