<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { CircleCheckBig, Trash2, CheckCheck, Undo } from 'lucide-vue-next';
import TaskMenu from "@/components/menus/TaskMenu.vue";

const props = defineProps<{
  task: Task;
}>();

const emits = defineEmits(['delete', 'changeList', 'complete']);

const handleDeleteTask = () => {
  emits('delete', { msg: '确定要删除任务 ' + props.task.description + ' 吗？', id: props.task.id });
};

const handleCompleteTask = () => {
  emits('complete', props.task.id, !props.task.completed);
};
</script>

<template>
  <TaskMenu>
    <template #trigger>
      <div
          class="flex min-w-68 items-center justify-between my-2 p-2 border-2 border-gray-400 rounded-lg cursor-pointer"
          @click="console.log('click')"
      >
        <div class="flex items-center pl-2" >
          <CheckCheck v-if="task.completed" class="h-5 w-5 mr-2 text-green-500" />
          <p :class="task.completed ? 'text-gray-400 line-through' : ''">{{ task.description }}</p>
        </div>
        <div class=" sm:flex gap-1 ml-2 ">
          <Button variant="ghost" size="icon" @click="handleDeleteTask">
            <Trash2 class="h-5 w-5 text-red-500" />
          </Button>
          <Button v-if="task.completed" variant="ghost" size="icon" @click="handleCompleteTask">
            <Undo class="h-5 w-5 text-yellow-500" />
          </Button>
          <Button v-else variant="ghost" size="icon" @click="handleCompleteTask">
            <CircleCheckBig class="h-5 w-5 text-green-500" />
          </Button>
        </div>
      </div>
    </template>
  </TaskMenu>
</template>

<style scoped>

</style>
