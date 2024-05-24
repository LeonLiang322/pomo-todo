<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateFormatter, type DateValue, getLocalTimeZone, isEqualDay, today } from '@internationalized/date';
import { cn, getCurrentTime } from '@/lib/utils';
import { ChevronRight, List, Ban, Cross, Bolt, X, CalendarDays, Tag } from 'lucide-vue-next';
import TaskRecord from "@/components/TaskRecord.vue";
import TaskLists from "@/components/TaskLists.vue";

const ipc = (window as any).ipcRenderer;
const incompleteTasks = ref<Task[]>([]);
const completedTasks = ref<Task[]>([]);
const lists = ref<TaskList[]>([]);

const selectedLists = ref(new Set<number>());
const completeExpanded = ref(false);
const showAddDialog = ref(false);
const showDeleteDialog = ref(false);
const showDueDatePopover = ref(false);

const newTaskDescription = ref('');
const editTemp = ref<any>();

const taskIndex = ref(0);
const taskDescription = ref('');
const taskNote = ref('');
const taskDueDate = ref<DateValue>();
const taskCreateTime = ref();
const taskUpdateTime = ref();
const taskFinishTime = ref();
const taskBelongList = ref('1');

const df = new DateFormatter('zh-cn', {
  dateStyle: 'long',
});

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
  taskCreateTime.value = '';
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
  updatedData.update_time = getCurrentTime();
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
  taskCreateTime.value = task.create_time;
  taskBelongList.value = task.list_id + '';
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

const updateComplete = (id: number, completed: boolean) => {
  updateTask(id, { completed: completed ? 1 : 0, finish_time: completed ? getCurrentTime() : null });
  fetchAllData();
};

// 更新任务列表
const updateTaskList = () => {
  updateTask(taskIndex.value, { list_id: parseInt(taskBelongList.value) });
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

const saveDueDate = (date: any) => {
  showDueDatePopover.value = false;
  taskDueDate.value = date;
};

const editGate = (v: any, e: Function) => {
  if (v === editTemp.value) {
    return;
  } else {
    e();
  }
  editTemp.value = null;
}

onMounted(() => {
  fetchAllData();
  selectedLists.value = new Set(ipc.sendSync('config-store-get', 'todoSelectedLists') || []);
  completeExpanded.value = ipc.sendSync('config-store-get', 'todoCompleteExpanded') || false;
});
</script>

<template>
  <div class="flex h-full relative">
    <div class="flex-1 relative">
      <div class="w-full h-full px-8 pt-4 pb-20 overflow-auto">
        <div class="grid gap-2 mb-4">
          <TaskRecord
              v-for="task in filteredIncompleteTasks"
              :key="task.id"
              :task="task"
              :lists="lists"
              @select="handleTaskSelect"
              @complete="updateComplete"
              @delete="deleteTask"
              @pin="pinTask"
          />
        </div>
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
        <transition name="fade">
          <div class="grid gap-2 mt-2" v-if="completeExpanded">
            <TaskRecord
                v-for="task in filteredCompletedTasks"
                :key="task.id"
                :task="task"
                :lists="lists"
                @select="handleTaskSelect"
                @complete="updateComplete"
                @delete="deleteTask"
            />
          </div>
        </transition>

      </div>
      <div class="absolute inset-x-0 bottom-0 w-full px-4">
        <div class="h-full w-full bg-white/50 backdrop-blur-sm pb-4 relative">
          <div class="relative w-full">
            <Input
                class="w-full pr-36 h-14 bg-white border-black border-2"
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
      {{ taskCreateTime }}
      <TaskLists
          :lists="lists"
          :selectedLists="selectedLists"
          @toggle="toggleListSelection"
          @add="addList"
          @delete="deleteList"
      />
      <transition name="fade">
        <div class="grid gap-2 border-t-2 mt-4 py-4" v-if="taskDescription.length > 0">
          <div class="flex items-center">
            <Tag class="size-4 mr-3" />
            <Input
                class="w-full pl-4"
                v-model="taskDescription"
                placeholder="任务名称"
                @keyup.enter="$event.target.blur()"
                @focus="editTemp = taskDescription"
                @blur="editGate(taskDescription, () => {
                  updateTask(taskIndex, { description: taskDescription })
                })"
            />
          </div>
          <div class="flex items-center">
            <CalendarDays class="size-4 mr-3" />
            <Popover v-model:open="showDueDatePopover">
              <PopoverTrigger as-child>
                <Button
                    :class="cn('grow justify-start', !taskDueDate && 'text-muted-foreground')"
                    variant="outline"
                >
                  {{ taskDueDate ? df.format(taskDueDate.toDate(getLocalTimeZone())) : "设置截止日期" }}
                </Button>
              </PopoverTrigger>
              <PopoverContent class="h-[300px] flex w-auto flex-col gap-y-2 p-2 overflow-auto">
                <Button
                    v-if="!taskDueDate || !isEqualDay(taskDueDate, today(getLocalTimeZone()))"
                    variant="outline"
                    class="w-full justify-start"
                    @click="saveDueDate(today(getLocalTimeZone()))"
                >
                  <CalendarDays class="mr-2 h-4 w-4" />今天截止
                </Button>
                <Button
                    v-if="!taskDueDate || !isEqualDay(taskDueDate, today(getLocalTimeZone()).add({ days: 1 }))"
                    variant="outline"
                    class="w-full justify-start"
                    @click="saveDueDate(today(getLocalTimeZone()).add({ days: 1 }))"
                >
                  <CalendarDays class="mr-2 h-4 w-4" />明天截止
                </Button>
                <Calendar class="-mt-2" v-model="taskDueDate" />
                <!--<Button-->
                <!--    class="-mt-2 w-full text-green-500"-->
                <!--    v-if="taskDueDate"-->
                <!--    variant="outline"-->
                <!--    @click="saveDueDate(taskDueDate)"-->
                <!--&gt;-->
                <!--  <Check class="size-4 mr-4" />确定-->
                <!--</Button>-->
              </PopoverContent>
            </Popover>
            <Button
                class="ml-2 text-red-500"
                v-if="taskDueDate"
                variant="outline"
                size="icon"
                @click="showDueDatePopover = false; taskDueDate = undefined;"
            >
              <X class="size-5" />
            </Button>
          </div>
          <div class="flex items-center">
            <List class="size-4 mr-3" />
            <div class="grow">
              <Select v-model="taskBelongList" @update:modelValue="updateTaskList">
                <SelectTrigger>
                  <SelectValue class="ml-1" placeholder="选择列表" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="list in lists" :value="list.id+''">
                    {{ list.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Textarea
              class="min-h-24"
              v-model="taskNote"
              placeholder="添加备注"
              @focus="editTemp = taskNote"
              @keyup.enter="$event.target.blur()"
              @blur="editGate(taskNote, () => {
                updateTask(taskIndex, { note: taskNote })
              })"
          />
          <p
              class="text-xs text-gray-500 italic text-end">
            创建于 {{ taskCreateTime }}
          </p>
          <!--<p-->

          <!--    class="text-xs text-gray-500 italic text-end">-->
          <!--  更新于 {{ df2.format(taskUpdateTime) }}-->
          <!--</p>-->
          <!--<p-->

          <!--    class="text-xs text-gray-500 italic text-end">-->
          <!--  完成于 {{ df2.format(taskFinishTime) }}-->
          <!--</p>-->
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>

</style>
