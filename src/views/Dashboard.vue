<script setup lang="ts">
import { Button } from '@/components/ui/button'

const ipc = (window as any).ipcRenderer;

const showToast = () => {
  console.log('show toast');
}
</script>

<template>
  <Button @click="showToast">
    Show Toast
  </Button>
</template>
