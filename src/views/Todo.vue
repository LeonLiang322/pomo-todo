<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, } from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'


const ipc = (window as any).ipcRenderer;
const tasks = ref([]);

const add = async () => {
  await ipc.sendSync('task-add', { description: 'New todo' });
  getAllTasks();
}

const getAllTasks = () => {
  tasks.value = ipc.sendSync('task-get-all');
}

onMounted(() => {
  getAllTasks();
});
</script>

<template>
  <ResizablePanelGroup
      id="handle-demo-group-1"
      direction="horizontal"
      class="h-full w-full"
  >
    <ResizablePanel id="handle-demo-panel-1" :default-size="75">
      <div class="flex h-full items-center justify-center overflow-scroll">
        <div class="">
          {{ tasks }}
          <Button @click="add">Click me</Button>
        </div>
      </div>
    </ResizablePanel>
    <ResizableHandle id="handle-demo-handle-1" with-handle />
    <ResizablePanel class="min-w-[200px] sm:min-w-[300px]" id="handle-demo-panel-2" :default-size="25">
      <div class="flex h-full justify-center p-4">
        <span class="font-semibold">Sidebar</span>
      </div>
    </ResizablePanel>
  </ResizablePanelGroup>

</template>

<style scoped>

</style>
