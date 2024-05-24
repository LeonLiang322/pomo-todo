<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon } from '@radix-icons/vue'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DateFormatter, type DateValue, getLocalTimeZone, isEqualDay, today, } from '@internationalized/date'
import { cn } from '@/lib/utils'
import { ChevronRight, List, Check, Cross, Bolt, X } from 'lucide-vue-next';
import TaskRecord from "@/components/TaskRecord.vue";
import TaskLists from "@/components/TaskLists.vue";

interface DeleteInfo {
  msg: string;
  id: number | null;
}

const ipc = (window as any).ipcRenderer;
const tasks = ref<Task[]>([]);
const lists = ref<TaskList[]>([]);
const deleteInfo = ref<DeleteInfo>();
const newListTitle = ref('无标题列表');

const selectedLists = ref(new Set<number>());
const expandCompleted = ref(false);
const showAddDialog = ref(false);
const showDeleteDialog = ref(false);
const showDueDatePopover = ref(false);

const taskDescription = ref('');
const taskNote = ref('');
const taskDueDate = ref<DateValue>();
const taskCreateTime = ref('');
const taskUpdateTime = ref('');
const taskFinishTime = ref('');
const taskBelongList = ref('1');

const df = new DateFormatter('en-US', {
  dateStyle: 'long',
})

// 获取所有任务和列表
const fetchAllData = () => {
  tasks.value = ipc.sendSync('db-operation', { action: 'select-all', table: 'task' });
  lists.value = ipc.sendSync('db-operation', { action: 'select-all', table: 'list' });
  lists.value[0].name = '默认';
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

const addTask = () => {
  const newTask: Partial<Task> = {
    description: taskDescription.value,
  };
  ipc.sendSync('db-operation', { action: 'insert', table: 'task', data: newTask });
  fetchAllData();
};

const updateTask = (id: number, updatedData: any) => {
  ipc.sendSync('db-operation', { action: 'update', table: 'task', id, data: updatedData });
  fetchAllData();
};

const pinTask = (id: number, pin: boolean) => {
  updateTask(id, { pinned: pin ? 1 : 0});
};

const openDeleteDialog = (info: DeleteInfo) => {
  deleteInfo.value = info;
  showDeleteDialog.value = true;
};

const deleteTask = (id: number) => {
  ipc.sendSync('db-operation', { action: 'delete', table: 'task', id });
  fetchAllData();
  showDeleteDialog.value = false;
};

const addList = (name: string) => {
  if (!name) return;
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
  ipc.send('config-store-set', { 'todoSelectedLists': Array.from(selectedLists.value) });
};

const saveDueDate = (date: any) => {
  showDueDatePopover.value = false;
  taskDueDate.value = date;
}

onMounted(() => {
  fetchAllData();
  selectedLists.value = new Set(ipc.sendSync('config-store-get', 'todoSelectedLists') || []);
});
</script>

<template>
  <div class="flex h-full relative">
    <div class="flex-1 relative">
      <div class="grid w-full h-full px-8 pt-4 pb-20 overflow-auto">
        <TaskRecord
            v-for="task in filteredTodoTasks"
            :key="task.id"
            :task="task"
            :lists="lists"
            @delete="openDeleteDialog"
            @complete="updateComplete"
            @pin="pinTask"
        />
        <Button
            :class="cn('w-28 flex gap-2 items-center justify-between border-2 border-green-500 p-1 rounded-lg',
              expandCompleted && 'bg-green-500 text-white')"
            variant="outline"
            @click="expandCompleted = !expandCompleted"
        >
          <ChevronRight :class="cn('h-5 w-5 transform transition-transform duration-300', expandCompleted && 'rotate-90')" />
          <span>已完成</span>
          <span class="mr-2 font-black" :class="cn('mr-2 font-black', !expandCompleted && 'text-green-500')">
            {{ filteredCompletedTasks.length }}
          </span>
        </Button>
        <ul v-if="expandCompleted">
          <li v-for="task in filteredCompletedTasks" :key="task.id">
            <TaskRecord :task="task" :lists="lists" @delete="deleteTask" @changeList="changeTaskList" @complete="updateComplete"/>
          </li>
        </ul>
      </div>
      <div class="absolute inset-x-0 bottom-0 w-full px-4">
        <div class="h-full w-full bg-white/50 backdrop-blur-sm pb-4 relative">
          <div class="relative w-full">
            <Input
                class="w-full pr-24 h-14 bg-white border-black border-2"
                v-model="taskDescription"
                placeholder="添加任务"
                @keyup.enter="addTask"
            />
            <div class="flex items-center justify-center gap-1 absolute end-0 inset-y-0 pr-3">
              <Button variant="ghost" size="icon">
                <Bolt class="size-5" />
              </Button>
              <Button variant="ghost" size="icon" @click="addTask">
                <Cross class="size-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="border-l-2 p-4 pt-6 w-[240px] md:w-[360px] hidden sm:block overflow-auto">
      <TaskLists
          :lists="lists"
          :selectedLists="selectedLists"
          @toggle="toggleListSelection"
          @add="addList"
          @delete="deleteList"
      />
      <div class="grid gap-2">

        <div class="flex items-center">
          <div class="size-5 mr-2">
            <CalendarIcon class="size-4" />
          </div>
          <Popover v-model:open="showDueDatePopover">
            <PopoverTrigger as-child>
              <Button
                  :class="cn('grow justify-start',!taskDueDate && 'text-muted-foreground')"
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
                今天截止
              </Button>
              <Button
                  v-if="!taskDueDate || !isEqualDay(taskDueDate, today(getLocalTimeZone()).add({ days: 1 }))"
                  variant="outline"
                  class="w-full justify-start"
                  @click="saveDueDate(today(getLocalTimeZone()).add({ days: 1 }))"
              >
                <CalendarIcon class="mr-2 h-4 w-4" />明天截止
              </Button>
              <Calendar class="-mt-2" v-model="taskDueDate" />
              <Button
                  class="-mt-2 w-full text-green-500"
                  v-if="taskDueDate"
                  variant="outline"
                  @click="saveDueDate(taskDueDate)"
              >
                <Check class="size-4 mr-4" />确定
              </Button>
            </PopoverContent>
          </Popover>
          <Button
              class="ml-2 text-red-500"
              v-if="taskDueDate"
              variant="outline"
              size="icon"
              @click="showDueDatePopover = false; taskDueDate = null;"
          >
            <X class="size-5" />
          </Button>
        </div>

        <div class="flex items-center">
          <div class="size-5 mr-2">
            <List class="size-4" />
          </div>
          <div class="grow">
            <Select v-model="taskBelongList">
              <SelectTrigger>
                <SelectValue class="ml-1" placeholder="选择列表" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="list in lists" :value="list.id+''">
                    {{ list.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Textarea class="min-h-24" placeholder="添加备注" />
        <p>创建于 {{}}</p>
        <p>置顶</p>
      </div>
    </div>
  </div>
  <!--<Dialog v-model:open="showDeleteDialog">-->
  <!--  <DialogContent>-->
  <!--    <DialogHeader>-->
  <!--      <DialogTitle class="ml-1">删除确认</DialogTitle>-->
  <!--      <DialogDescription />-->
  <!--    </DialogHeader>-->
  <!--    <div class="text-center">-->
  <!--      <p>{{ deleteInfo && deleteInfo.msg }}</p>-->
  <!--    </div>-->
  <!--    <DialogFooter class="justify-end">-->
  <!--      <DialogClose as-child>-->
  <!--        <Button variant="secondary">取消</Button>-->
  <!--      </DialogClose>-->
  <!--      <Button variant="destructive" @click="deleteTask(deleteInfo.id)">删除</Button>-->
  <!--    </DialogFooter>-->
  <!--  </DialogContent>-->
  <!--</Dialog>-->
</template>

<style scoped>

</style>
