<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '@/components/ui/dialog'
import { ChevronRight, X, Check } from 'lucide-vue-next';
import TaskRecord from "@/components/TaskRecord.vue";
import TaskLists from "@/components/TaskLists.vue";

const ipcRenderer = (window as any).ipcRenderer;
const tasks = ref<Task[]>([]);
const lists = ref<TaskList[]>([]);
const selectedLists = ref(new Set<number>());
const expandCompleted = ref(false);
const showAddDialog = ref(false);
const newListTitle = ref('无标题列表');

// 获取所有任务和列表
const fetchAllData = () => {
  tasks.value = ipcRenderer.sendSync('db-operation', { action: 'select-all', table: 'task' });
  lists.value = ipcRenderer.sendSync('db-operation', { action: 'select-all', table: 'list' });
};

// 计算选中列表中的任务
const filteredTodoTasks = computed(() => {
  const todoTasks = tasks.value.filter((task: Task) => !task.completed);
  if (selectedLists.value.size === 0) {
    return todoTasks;
  }
  return todoTasks.filter((task: Task) => selectedLists.value.has(task.list_id));
});

const filteredCompletedTasks = computed(() => {
  const completedTasks = tasks.value.filter((task: Task) => task.completed);
  if (selectedLists.value.size === 0) {
    return completedTasks;
  }
  return completedTasks.filter((task: Task) => selectedLists.value.has(task.list_id));
});


const addTask = (task: Partial<Task>) => {
  ipcRenderer.sendSync('db-operation', { action: 'insert', table: 'task', data: task });
  fetchAllData();
};

const updateTask = (id: number, updatedData: any) => {
  ipcRenderer.sendSync('db-operation', { action: 'update', table: 'task', id, data: updatedData });
  fetchAllData();
};

const deleteTask = (id: number) => {
  ipcRenderer.sendSync('db-operation', { action: 'delete', table: 'task', id });
  fetchAllData();
};

const addList = (list: Partial<TaskList>) => {
  ipcRenderer.sendSync('db-operation', { action: 'insert', table: 'list', data: list });
  fetchAllData();
  showAddDialog.value = false;
};

onMounted(fetchAllData);

const updateComplete = (id: number, completed: boolean) => {
  updateTask(id, { completed: completed ? 1 : 0 });
  fetchAllData();
};

// 更新任务列表
const changeTaskList = (task: Task, newListId: number) => {
  updateTask(task.id, { list_id: newListId });
};

// 切换选中列表
const toggleListSelection = (listId: number) => {
  if (selectedLists.value.has(listId)) {
    selectedLists.value.delete(listId);
  } else {
    selectedLists.value.add(listId);
  }
};
</script>

<template>

  <div class="flex h-full relative">
    <div class="flex-1 relative">
      <div class="w-full h-full px-8 pt-4 pb-20 overflow-auto">
        <ul>
          <li v-for="task in filteredTodoTasks" :key="task.id">
            <TaskRecord :task="task" :lists="lists" @delete="deleteTask" @changeList="changeTaskList" @complete="updateComplete"/>
            <!--<select @change="event => changeTaskList(task, Number((event.target as HTMLSelectElement).value))" :value="task.list_id">-->
            <!--  <option v-for="list in lists" :value="list.id" :key="list.id">{{ list.name }}</option>-->
            <!--</select>-->
          </li>
        </ul>
        <Button
            class="flex gap-2 items-center justify-between border-2 border-green-500 p-1 rounded-lg"
            variant="outline"
            @click="expandCompleted = !expandCompleted"
        >
          <ChevronRight class="h-5 w-5 text-green-500 transform transition-transform duration-300"
                        :class="{ 'rotate-90': expandCompleted }" />
          <span>已完成</span>
          <span class="text-green-500 mr-2 font-black">{{ filteredCompletedTasks.length }}</span>
        </Button>
        <ul v-if="expandCompleted">
          <li v-for="task in filteredCompletedTasks" :key="task.id">
            <TaskRecord :task="task" :lists="lists" @delete="deleteTask" @changeList="changeTaskList" @complete="updateComplete"/>
          </li>
        </ul>
        <button @click="addTask({ description: 'New Task' })">Add Task</button>
      </div>
      <div class="absolute inset-x-0 bottom-0 w-full px-4">
        <div class="h-full w-full bg-white/50 backdrop-blur-sm pb-4">
          <Input
              class="w-full h-14 bg-white border-black border-2"
              placeholder="添加任务"
              @enter="addTask({ description: $event })"
          />
        </div>
      </div>
    </div>
    <div class="border-l-2 p-4 pt-6 w-[240px] md:w-[360px] hidden sm:block overflow-auto">
      <div>
        <TaskLists
            :lists="lists"
            :selectedLists="selectedLists"
            @toggle="toggleListSelection"
            @add="showAddDialog=true" />
      </div>
    </div>
  </div>
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
            @keyup.enter="addList({ name: newListTitle })"
        />
        <Button class="h-12 w-12 border-green-500 border-2" variant="outline" size="icon">
          <Check class="h-8 w-8 text-green-500" @click="showAddDialog=false" />
        </Button>
      </div>

    </DialogContent>
  </Dialog>
</template>

<style scoped>

</style>
