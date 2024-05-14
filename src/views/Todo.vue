<script setup lang="ts">
import { Button as SButton } from '@/components/ui/button'

const add = () => {
  (window as any).ipcRenderer.dbadd("test")
}
</script>

<template>
  <div class="text-center text-xl pt-8">
    Coming soon ...
    <SButton @click="add">Click me</SButton>
  </div>
</template>

<style scoped>

</style>
