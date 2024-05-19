<script setup lang="ts">
import Toaster from '@/components/ui/toast/Toaster.vue'
import { useToast } from '@/components/ui/toast/use-toast';
import { onMounted, onUnmounted } from "vue";

const { toast } = useToast();
const ipc = (window as any).ipcRenderer;

onMounted(() => {
  ipc.on('show-toast', (event: any, data: any) => {
    toast({
      title: data.title,
      description: data.description,
    });
  });
});

onUnmounted(() => {
  ipc.removeAllListeners('show-toast');
});
</script>

<template>
  <Toaster />
  <RouterView />
</template>

<style scoped>

</style>
