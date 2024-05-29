<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger }
  from '@/components/ui/drawer'
import { ChevronRight, Ban, Cross, ListTodo } from 'lucide-vue-next';
import { parseDate, type DateValue, } from '@internationalized/date';
import { cn, getCurrentTime } from '@/lib/utils';
import TaskRecords from "@/components/todo/TaskRecords.vue";
import TaskLists from "@/components/todo/TaskLists.vue";
import TaskDetail from "@/components/todo/TaskDetail.vue";

const ipc = (window as any).ipcRenderer;
const incompleteTasks = ref<Task[]>([]);
const completedTasks = ref<Task[]>([]);
const lists = ref<TaskList[]>([]);

const selectedLists = ref(new Set<number>());
const completeExpanded = ref(false);
const showAddDialog = ref(false);
const showTaskDetailDrawer = ref(false);
const showDeleteDialog = ref(false);

const newTaskDescription = ref('');

const taskIndex = ref(0);
const taskDescription = ref('');
const taskNote = ref('');
const taskDueDate = ref<DateValue>();
const taskCreateTime = ref();
const taskFinishTime = ref();
const taskBelongList = ref('1');

// 获取所有任务和列表
const fetchAllData = () => {
  incompleteTasks.value = ipc.sendSync('db-operation', { action: 'select-all', table: 'task', condition: 'WHERE completed = 0 ORDER BY pinned DESC, id DESC' });
  completedTasks.value = ipc.sendSync('db-operation', { action: 'select-all', table: 'task', condition: 'WHERE completed = 1 ORDER BY pinned DESC, id DESC' });
  lists.value = ipc.sendSync('db-operation', { action: 'select-all', table: 'list' });
  lists.value[0].name = '默认';
};

// 计算选中列表中的任务
const filteredIncompleteTasks = computed(() => {
  if (selectedLists.value.size === 0) {
    return incompleteTasks.value;
  }
  return incompleteTasks.value.filter((task: Task) => selectedLists.value.has(task.list_id));
});

const filteredCompletedTasks = computed(() => {
  if (selectedLists.value.size === 0) {
    return completedTasks.value;
  }
  return completedTasks.value.filter((task: Task) => selectedLists.value.has(task.list_id));
});

const cleanTaskInfo = () => {
  taskIndex.value = 0;
  taskDescription.value = '';
  taskNote.value = '';
  taskDueDate.value = undefined;
  taskCreateTime.value = '';
  taskFinishTime.value = '';
  taskBelongList.value = '1';
};

const addTask = () => {
  if (newTaskDescription.value.length === 0) return;
  const newTask: Partial<Task> = {
    description: newTaskDescription.value,
  };
  ipc.sendSync('db-operation', { action: 'insert', table: 'task', data: newTask });
  fetchAllData();
  newTaskDescription.value = '';
};

const cancelNewTask = () => {
  newTaskDescription.value = '';
  cleanTaskInfo();
};

const updateTask = (id: number, updatedData: any) => {
  console.log('updating')
  if (updatedData.description?.length === 0) return;
  ipc.sendSync('db-operation', { action: 'update', table: 'task', id, data: updatedData });
  fetchAllData();
};

const pinTask = (id: number, pin: boolean) => {
  updateTask(id, { pinned: pin ? 1 : 0 });
};

const handleTaskSelect = (task: Task) => {
  if (task.id === taskIndex.value) {
    cleanTaskInfo();
    return;
  }
  taskIndex.value = task.id;
  taskDescription.value = task.description;
  taskNote.value = task.note;
  taskDueDate.value = task.due_date ? parseDate(task.due_date) : undefined;
  taskCreateTime.value = task.create_time;
  taskFinishTime.value = task.finish_time;
  taskBelongList.value = task.list_id + '';
  if (window.innerWidth <= 640) {
    showTaskDetailDrawer.value = true;
  }
};

const deleteTask = (id: number) => {
  ipc.sendSync('db-operation', { action: 'delete', table: 'task', id });
  fetchAllData();
  showDeleteDialog.value = false;
};

const addList = (name: string) => {
  if (name.length === 0) return;
  ipc.sendSync('db-operation', { action: 'insert', table: 'list', data: { name: name } });
  fetchAllData();
  showAddDialog.value = false;
};

const deleteList = (id: number) => {
  if (id === 1) return;
  ipc.sendSync('db-operation', { action: 'delete', table: 'list', id });
  fetchAllData();
};

const updateComplete = (id: number, state: boolean) => {
  const currentTime = getCurrentTime();
  taskFinishTime.value = state ? currentTime : null;
  updateTask(id, { completed: state ? 1 : 0, finish_time: state ? currentTime : null });
  fetchAllData();
};

// 切换选中列表
const toggleListSelection = (listId: number) => {
  if (selectedLists.value.has(listId)) {
    selectedLists.value.delete(listId);
  } else {
    selectedLists.value.add(listId);
  }
  ipc.send('config-store-set', { 'todoSelectedLists': Array.from(selectedLists.value) });
};

const handleExpandCompleted = () => {
  completeExpanded.value = !completeExpanded.value;
  ipc.send('config-store-set', { 'todoCompleteExpanded': completeExpanded.value });
};

const onTaskDetailDrawerStateChange = () => {
  if (!showTaskDetailDrawer.value) {
    setTimeout(() => {
      cleanTaskInfo();
    }, 300);
  }
};

onMounted(() => {
  fetchAllData();
  selectedLists.value = new Set(ipc.sendSync('config-store-get', 'todoSelectedLists') || []);
  completeExpanded.value = ipc.sendSync('config-store-get', 'todoCompleteExpanded') || false;
});
</script>

<template>
  <div class="flex h-full relative">
    <div class="flex-1 relative">
      <div class="w-full h-full pb-20 overflow-auto">
        <div class="flex items-center gap-2 px-8 sticky top-0 h-12 sm:h-14 w-full bg-white/40 backdrop-blur-sm">
          <span class="text-xl sm:text-2xl font-bold">任务清单</span>
          <Drawer>
            <DrawerTrigger as-child>
              <Button class="sm:hidden" variant="ghost" size="icon">
                <ListTodo class="size-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader class="hidden">
                <DrawerTitle>任务列表</DrawerTitle>
                <DrawerDescription>所有创建的列表</DrawerDescription>
              </DrawerHeader>
              <div class="pl-4 pr-2 max-h-[60vh] overflow-auto">
                <TaskLists
                    :lists="lists"
                    :selectedLists="selectedLists"
                    @toggle="toggleListSelection"
                    @add="addList"
                    @delete="deleteList"
                />
              </div>
            </DrawerContent>
          </Drawer>
        </div>
        <div class="px-4 sm:px-8">
          <TaskRecords
              v-model:taskIndex="taskIndex"
              :tasks="filteredIncompleteTasks"
              @select="handleTaskSelect"
              @complete="updateComplete"
              @delete="deleteTask"
              @pin="pinTask"
          />
          <div class="pt-2">
            <Button
                :class="cn('w-28 flex gap-2 items-center justify-between border-2 border-green-500 p-1 rounded-lg',
            completeExpanded && 'bg-green-500 text-white')"
                variant="outline"
                @click="handleExpandCompleted"
            >
              <ChevronRight :class="cn('h-5 w-5 transform transition-transform duration-300', completeExpanded && 'rotate-90')" />
              <span>已完成</span>
              <span class="mr-2 font-black" :class="cn('mr-2 font-black', !completeExpanded && 'text-green-500')">
                {{ filteredCompletedTasks.length }}
              </span>
            </Button>
          </div>
          <transition name="fade">
            <div v-if="completeExpanded">
              <TaskRecords
                  v-model:taskIndex="taskIndex"
                  :tasks="filteredCompletedTasks"
                  @select="handleTaskSelect"
                  @complete="updateComplete"
                  @delete="deleteTask"
                  @pin="pinTask"
              />
            </div>
          </transition>
        </div>
      </div>
      <div class="absolute inset-x-0 bottom-0 w-full px-4">
        <div class="h-full w-full bg-white/50 backdrop-blur-sm pb-4 relative">
          <div class="relative w-full">
            <Input
                class="w-full pr-36 h-12 sm:h-14 bg-white border-black border-2"
                v-model="newTaskDescription"
                placeholder="添加任务"
                @keyup.enter="addTask"
            />
            <transition name="fade">
              <div
                  v-if="newTaskDescription.length > 0"
                  class="flex items-center justify-center gap-1 absolute end-0 inset-y-0 pr-3"
              >
                <Button variant="ghost" size="icon">
                  <Ban class="size-5" @click="cancelNewTask"/>
                </Button>
                <Button variant="ghost" size="icon" @click="addTask">
                  <Cross class="size-5" />
                </Button>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
    <div class="border-l-2 p-4 pt-6 w-[240px] md:w-[360px] hidden sm:block overflow-auto">
      <div class="max-h-[290px] overflow-auto">
        <TaskLists
            :lists="lists"
            :selectedLists="selectedLists"
            @toggle="toggleListSelection"
            @add="addList"
            @delete="deleteList"
        />
      </div>
      <transition name="fade">
        <div class="mt-4" v-if="taskIndex">
          <TaskDetail
              v-model:taskIndex="taskIndex"
              v-model:taskDescription="taskDescription"
              v-model:taskNote="taskNote"
              v-model:taskDueDate="taskDueDate"
              v-model:taskCreateTime="taskCreateTime"
              v-model:taskFinishTime="taskFinishTime"
              v-model:taskBelongList="taskBelongList"
              v-model:lists="lists"
              @update="updateTask"
          />
        </div>
      </transition>
    </div>
    <Drawer v-model:open="showTaskDetailDrawer" @update:open="onTaskDetailDrawerStateChange">
      <DrawerContent>
        <DrawerHeader class="hidden">
          <DrawerTitle>Move Goal</DrawerTitle>
          <DrawerDescription>aaa</DrawerDescription>
        </DrawerHeader>
        <div class="px-2 max-h-[60vh] overflow-auto">
          <TaskDetail
              v-if="taskIndex"
              v-model:taskIndex="taskIndex"
              v-model:taskDescription="taskDescription"
              v-model:taskNote="taskNote"
              v-model:taskDueDate="taskDueDate"
              v-model:taskCreateTime="taskCreateTime"
              v-model:taskFinishTime="taskFinishTime"
              v-model:taskBelongList="taskBelongList"
              v-model:lists="lists"
              @update="updateTask"
          />
        </div>
      </DrawerContent>
    </Drawer>
  </div>
</template>

<style scoped>

</style>
