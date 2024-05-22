<script setup lang="ts">
import { Badge } from '@/components/ui/badge';

defineProps<{
  lists: TaskList[];
  selectedLists: Set<number>;
}>();

const emit = defineEmits(['toggle', 'add']);

const toggleListSelection = (listId: number) => {
  emit('toggle', listId);
};

const addNewList = () => {
  emit('add', { name: '新列表' });
};
</script>

<template>
  <div
      class="flex flex-col gap-2 p-2 mb-4 border-2 rounded-lg max-h-[300px] overflow-auto"
      v-if="lists && lists.length > 0">
    <Badge
        class="sticky top-0 w-full p-2 cursor-pointer border-green-500 border-2 bg-white hover:bg-green-500 hover:text-white"
        variant="outline"
        @click="addNewList">
      <div>
        <span class="mr-2">+</span>
        <span>新建列表</span>
      </div>
    </Badge>
    <Badge
        class="p-2 cursor-pointer border-2 border-gray-400"
        :variant="selectedLists.has(lists[0].id) ? 'default' : 'secondary'"
        @click="toggleListSelection(lists[0].id)">
      <div>
        <span class="mr-2 text-green-500">{{ lists[0].todo_count }}</span>
        <span>默认</span>
      </div>
    </Badge>
    <Badge
        class="p-2 cursor-pointer border-2 border-gray-400"
        v-for="list in lists.slice(1)"
        :variant="selectedLists.has(list.id) ? 'default' : 'secondary'"
        :key="list.id"
        @click="toggleListSelection(list.id)">
      <div class="flex items-center">
        <span class="mr-2 text-green-500">{{ list.todo_count }}</span>
        <span>{{ list.name }}</span>
      </div>
    </Badge>
  </div>
</template>

<style scoped>
</style>
