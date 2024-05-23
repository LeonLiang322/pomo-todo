<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DateFormatter,
  type DateValue,
  getLocalTimeZone,
  today,
} from '@internationalized/date'

import { CalendarIcon } from '@radix-icons/vue'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

const df = new DateFormatter('en-US', {
  dateStyle: 'long',
})

const items = [
  { value: 0, label: 'Today' },
  { value: 1, label: 'Tomorrow' },
  { value: 3, label: 'In 3 days' },
  { value: 7, label: 'In a week' },
]

const value = ref<DateValue>()
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ChevronRight, Check, Cross, Bolt } from 'lucide-vue-next';
import TaskRecord from "@/components/TaskRecord.vue";
import TaskLists from "@/components/TaskLists.vue";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const ipc = (window as any).ipcRenderer;
const tasks = ref<Task[]>([]);
const lists = ref<TaskList[]>([]);
const selectedLists = ref(new Set<number>());
const expandCompleted = ref(false);
const showAddDialog = ref(false);
const newListTitle = ref('无标题列表');
const newTaskInfo = ref({
  description: '',
});

const showDeleteDialog = ref(false);
const deleteInfo = ref({});

// 获取所有任务和列表
const fetchAllData = () => {
  tasks.value = ipc.sendSync('db-operation', { action: 'select-all', table: 'task' });
  lists.value = ipc.sendSync('db-operation', { action: 'select-all', table: 'list' });
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
    description: newTaskInfo.value.description,
  };
  ipc.sendSync('db-operation', { action: 'insert', table: 'task', data: newTask });
  fetchAllData();
};

const updateTask = (id: number, updatedData: any) => {
  ipc.sendSync('db-operation', { action: 'update', table: 'task', id, data: updatedData });
  fetchAllData();
};

const openDeleteDialog = (info: object) => {
  deleteInfo.value = info;
  showDeleteDialog.value = true;
};

const deleteTask = (id: number) => {
  ipc.sendSync('db-operation', { action: 'delete', table: 'task', id });
  fetchAllData();
  showDeleteDialog.value = false;
};

const addList = (list: Partial<TaskList>) => {
  ipc.sendSync('db-operation', { action: 'insert', table: 'list', data: list });
  fetchAllData();
  showAddDialog.value = false;
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

onMounted(() => {
  fetchAllData();
  selectedLists.value = new Set(ipc.sendSync('config-store-get', 'todoSelectedLists') || []);
});
</script>

<template>

  <div class="flex h-full relative">
    <div class="flex-1 relative">
      <div class="w-full h-full px-8 pt-4 pb-20 overflow-auto">
        <ul>
          <li v-for="task in filteredTodoTasks" :key="task.id">
            <TaskRecord :task="task" :lists="lists" @delete="openDeleteDialog" @changeList="changeTaskList" @complete="updateComplete"/>
            <!--<select @change="event => changeTaskList(task, Number((event.target as HTMLSelectElement).value))" :value="task.list_id">-->
            <!--  <option v-for="list in lists" :value="list.id" :key="list.id">{{ list.name }}</option>-->
            <!--</select>-->
          </li>
        </ul>
        <Button
            :class="cn('flex gap-2 items-center justify-between border-2 border-green-500 p-1 rounded-lg',
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
                v-model="newTaskInfo.description"
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
          @add="showAddDialog=true" />
      <div class="border">
        <div class="grid w-full gap-1.5">
          <Textarea id="message" placeholder="添加备注" />
          {{ value }}
        </div>
        <Popover>
          <PopoverTrigger as-child>
            <Button
                variant="outline"
                :class="cn(
          'w-[280px] justify-start text-left font-normal',
          !value && 'text-muted-foreground',
        )"
            >
              <CalendarIcon class="mr-2 h-4 w-4" />
              {{ value ? df.format(value.toDate(getLocalTimeZone())) : "Pick a date" }}
            </Button>
          </PopoverTrigger>
          <PopoverContent class="flex w-auto flex-col gap-y-2 p-2">
        <!--    <Select-->
        <!--        @update:model-value="(v) => {-->
        <!--  if (!v) return;-->
        <!--  value = today(getLocalTimeZone()).add({ days: Number(v) });-->
        <!--}"-->
        <!--    >-->
        <!--      <SelectTrigger>-->
        <!--        <SelectValue placeholder="Select" />-->
        <!--      </SelectTrigger>-->
        <!--      <SelectContent>-->
        <!--        <SelectItem v-for="item in items" :key="item.value" :value="item.value.toString()">-->
        <!--          {{ item.label }}-->
        <!--        </SelectItem>-->
        <!--      </SelectContent>-->
        <!--    </Select>-->

            <Calendar v-model="value" />
          </PopoverContent>
        </Popover>
        <p>到期时间</p>
        <p>列表</p>
        <p>置顶</p>
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
        <Button class="size-12 hover:text-green-500" variant="ghost" size="icon">
          <Check class="size-6" @click="showAddDialog=false" />
        </Button>
      </div>
    </DialogContent>
  </Dialog>
  <Dialog v-model:open="showDeleteDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle class="ml-1">删除确认</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <div class="text-center">
        <p>{{ deleteInfo.msg }}</p>
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
