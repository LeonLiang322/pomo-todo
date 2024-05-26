<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { CircleCheckBig, Trash2, CheckCheck, Undo, Pin, PinOff } from 'lucide-vue-next';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ref } from "vue";
// import TaskMenu from "@/components/menus/TaskMenu.vue";

defineProps<{ tasks: Task[]; }>();
const taskIndex = defineModel<number>('taskIndex');
const emits = defineEmits(['select', 'delete', 'complete', 'pin']);

const deleteInfo = ref<Task>();
const showDeleteDialog = ref(false);


const selectTask = (task: Task) => {
  emits('select', task);
};

const deleteTask = (id: number) => {
  emits('delete', id);
  showDeleteDialog.value = false;
}

const pinTask = (id: number, state: boolean) => {
  emits('pin', id, state);
};

const completeTask = (id: number, state: boolean) => {
  emits('complete', id, state);
};

const handleDelete = (task: Task) => {
  deleteInfo.value = task;
  showDeleteDialog.value = true;
};

</script>

<template>
  <div class="grid gap-2 my-2" v-for="task in tasks" :key="task.id">
    <div
        class="flex items-center justify-between min-w-68 shadow-lg p-2 border-gray-400 rounded-lg cursor-pointer"
        :class="taskIndex === task.id ? 'border-2 border-blue-500' : 'border'"
        @click="selectTask(task)"
    >
      <div class="flex items-center" >
        <CheckCheck v-if="task.completed" class="size-5 ml-2 mr-3 text-green-500" />
        <Button class="mr-1" v-else variant="ghost" size="icon" @click.stop="pinTask(task.id, !task.pinned)">
          <PinOff v-if="task.pinned"  class="size-4 text-blue-500" />
          <Pin v-else class="size-4 text-gray-500" />
        </Button>
        <p :class="task.completed ? 'text-gray-400 line-through' : ''">{{ task.description }}</p>
      </div>
      <div class="sm:flex gap-1 ml-2">
        <Button variant="ghost" size="icon" @click.stop="handleDelete(task)">
          <Trash2 class="size-5 text-red-500" />
        </Button>
        <Button v-if="task.completed" variant="ghost" size="icon" @click.stop="completeTask(task.id, false)">
          <Undo class="size-5 text-yellow-500" />
        </Button>
        <Button v-else variant="ghost" size="icon" @click.stop="completeTask(task.id, true)">
          <CircleCheckBig class="size-5 text-green-500" />
        </Button>
      </div>
    </div>
  </div>

  <Dialog v-model:open="showDeleteDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle class="ml-1">删除确认</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <div class="text-center">
        <p>确定要删除任务<span class="font-bold mx-2">{{deleteInfo.description}}</span>吗？</p>
      </div>
      <DialogFooter class="justify-end">
        <DialogClose as-child>
          <Button variant="secondary">取消</Button>
        </DialogClose>
        <Button variant="destructive" @click="deleteTask(deleteInfo.id)">删除</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

</template>

<style scoped>

</style>
