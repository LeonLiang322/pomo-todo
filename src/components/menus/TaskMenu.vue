<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from '@/components/ui/context-menu';

const menuVisible = ref(false);
const menuPosition = ref({ x: 0, y: 0 });
const currentTarget = ref<HTMLElement | null>(null);

const showMenu = (event: MouseEvent) => {
  event.preventDefault();
  menuVisible.value = true;
  menuPosition.value = { x: event.clientX, y: event.clientY };
  currentTarget.value = event.target as HTMLElement;
};

const hideMenu = () => {
  menuVisible.value = false;
};

const handleEdit = () => {
  if (currentTarget.value) {
    // 处理编辑逻辑
    console.log('Edit', currentTarget.value);
  }
  hideMenu();
};

const handleDelete = () => {
  if (currentTarget.value) {
    // 处理删除逻辑
    console.log('Delete', currentTarget.value);
  }
  hideMenu();
};

onMounted(() => {
  document.addEventListener('contextmenu', showMenu);
  document.addEventListener('click', hideMenu);
});

onUnmounted(() => {
  document.removeEventListener('contextmenu', showMenu);
  document.removeEventListener('click', hideMenu);
});
</script>

<template>
  <ContextMenu v-if="menuVisible" :style="{ top: `${menuPosition.y}px`, left: `${menuPosition.x}px` }">
    <ContextMenuContent>
      <ContextMenuItem @click="handleEdit">Edit</ContextMenuItem>
      <ContextMenuItem @click="handleDelete">Delete</ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>

<style scoped>
</style>
