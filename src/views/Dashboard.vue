<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ref } from "vue";

const ipc = (window as any).ipcRenderer;

const showToast = () => {
  console.log('show toast');
}

const show = ref(false);
</script>

<template>
  <Button @click="showToast">
    Show Toast
  </Button>
  <button @click="show = !show">Toggle</button>
  <Transition>
    <p v-if="show">hello</p>
  </Transition>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
