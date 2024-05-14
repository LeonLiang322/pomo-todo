<script setup lang="ts">
const min = () => {
  (window as any).ipcRenderer.min()
}
const max = () => {
  (window as any).ipcRenderer.max()
}
const close = () => {
  (window as any).ipcRenderer.close()
}
</script>

<template>
  <div class="absolute right-0 flex items-center h-full">
    <!--<div class="ctl-btn bg-green-500 border-green-600" />-->
    <div class="ctl-btn z-10" @click="min">
      <div class="bg-green-500 border-green-600 cursor-pointer" />
    </div>
    <div class="ctl-btn" @click="max">
      <div class="bg-yellow-400 border-amber-500" />
    </div>
    <div class="ctl-btn" @click="close">
      <div class="bg-red-500 border-red-600" />
    </div>
  </div>
</template>

<style scoped>
</style>
