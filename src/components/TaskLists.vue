<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Check, Trash2, TriangleAlert } from 'lucide-vue-next';
import { onMounted, ref } from "vue";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

defineProps<{
  lists: TaskList[];
  selectedLists: Set<number>;
}>();

const emit = defineEmits(['toggle', 'add', 'delete']);
const showDeleteDialog = ref(false);
const showAddDialog = ref(false);
const deleteInfo = ref<TaskList | null>();
const newListTitle = ref('无标题列表');
const showWarning = ref(true);
const hideWarning = ref(false);

const handleShowDelete = (task: TaskList) => {
  deleteInfo.value = task;
  showDeleteDialog.value = true;
};

const deleteList = () => {
  if (hideWarning.value) {
    (window as any).ipcRenderer.send('config-store-set', { 'hideDeleteListWarning': true });
  }
  emit('delete', deleteInfo.value?.id);
  showDeleteDialog.value = false;
};

const toggleListSelection = (listId: number) => {
  emit('toggle', listId);
};

const handleAddNewList = () => {
  emit('add', newListTitle.value);
  showAddDialog.value = false;
  newListTitle.value = '无标题列表';
};

onMounted(() => {
  showWarning.value = !(window as any).ipcRenderer.sendSync('config-store-get', 'hideDeleteListWarning');
});
</script>

<template>
  <div
      class="grid gap-2 pr-2 pb-4 max-h-[300px] overflow-auto"
      v-if="lists && lists.length > 0">
    <Badge
        class="px-4 py-1 sticky top-0 w-full cursor-pointer shadow-lg border border-green-500
          bg-white hover:bg-green-500 hover:text-white z-10 rounded-t-none"
        variant="outline"
        @click="showAddDialog=true"
    >
      <div class="flex items-center justify-between w-full">
        <span>新建列表</span>
        <span class="mr-2 text-lg">+</span>
      </div>
    </Badge>
    <Badge
        class="pl-4 cursor-pointer shadow-lg border border-gray-400"
        v-for="list in lists"
        :variant="selectedLists.has(list.id) ? 'default' : 'outline'"
        :key="list.id"
        @click="toggleListSelection(list.id)"
    >
      <div class="group flex items-center justify-between w-full">
        <div class="flex-1 my-1">{{ list.name }}</div>
        <Button
            class="hoverable ml-2"
            :disabled="list.id === 1"
            variant="link"
            size="icon"
            @click.stop="handleShowDelete(list)"
        >
          <Trash2 class="hover-item size-4 text-red-500" />
          <span class="default-item text-green-500">{{ list.todo_count }}</span>
        </Button>
      </div>
    </Badge>
  </div>
  <Dialog v-model:open="showDeleteDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle class="ml-1">删除确认</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <div class="flex flex-col gap-3 items-center justify-center">
        <p>确定要删除列表 <span class="font-bold">{{ deleteInfo?.name }}</span> 吗?</p>

        <div v-if="showWarning" class="flex items-center italic">
          <TriangleAlert class="size-4 mr-2 text-red-500" />
          <p class="mr-4 text-red-500">列表中的任务将被全部删除</p>
          <Checkbox id="terms" :checked="hideWarning" @update:checked="hideWarning = !hideWarning" />
          <label class="ml-1 text-xs" for="terms">不再显示红字提醒</label>
        </div>
      </div>
      <DialogFooter class="justify-end">
        <DialogClose as-child>
          <Button variant="secondary">取消</Button>
        </DialogClose>
        <Button variant="destructive" @click="deleteList">删除</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  <Dialog v-model:open="showAddDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle class="ml-1">新增列表</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <div class="flex items-center justify-center">
        <Input
            class="w-full h-12 bg-white border-black border-2 mr-2"
            v-model="newListTitle"
            @keyup.enter="handleAddNewList"
        />
        <Button class="size-12 hover:text-green-500" variant="ghost" size="icon">
          <Check class="size-6" @click="handleAddNewList" />
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.hoverable {
  position: relative;
}
.hover-item {
  display: none;
}
.hoverable:hover .default-item {
  display: none;
}
.hoverable:hover .hover-item {
  display: block;
}
</style>
