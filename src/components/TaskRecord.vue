<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { CircleCheckBig, Trash2, CheckCheck, Undo, Pin, PinOff } from 'lucide-vue-next';
// import TaskMenu from "@/components/menus/TaskMenu.vue";

const props = defineProps<{
  task: Task;
}>();

const emits = defineEmits(['delete', 'complete', 'pin']);

const handleDelete = () => {
  emits('delete', { msg: '确定要删除任务 ' + props.task.description + ' 吗？', id: props.task.id });
};

const handlePin = () => {
  emits('pin', props.task.id, !props.task.pinned);
};

const handleComplete = () => {
  emits('complete', props.task.id, !props.task.completed);
};
</script>

<template>
  <div class="flex items-center justify-between min-w-68 my-2 p-2 border-2 border-gray-400 rounded-lg cursor-pointer"
       :class="!task.completed && task.pinned ? 'order-first' : ''"
  >
    <div class="flex items-center" >
      <CheckCheck v-if="task.completed" class="size-5 ml-2 mr-3 text-green-500" />
      <Button class="mr-1" v-else variant="ghost" size="icon" @click="handlePin">
        <PinOff v-if="task.pinned"  class="size-4 text-blue-500" />
        <Pin v-else class="size-4 text-gray-500" />
      </Button>
      <p :class="task.completed ? 'text-gray-400 line-through' : ''">{{ task.description }}</p>
    </div>
    <div class="sm:flex gap-1 ml-2">
      <Button variant="ghost" size="icon" @click="handleDelete">
        <Trash2 class="size-5 text-red-500" />
      </Button>
      <Button v-if="task.completed" variant="ghost" size="icon" @click="handleComplete">
        <Undo class="size-5 text-yellow-500" />
      </Button>
      <Button v-else variant="ghost" size="icon" @click="handleComplete">
        <CircleCheckBig class="size-5 text-green-500" />
      </Button>
    </div>
  </div>
</template>

<style scoped>

</style>
