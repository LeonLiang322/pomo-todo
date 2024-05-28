<script setup lang="ts">
import { ref, watch } from 'vue';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tag, CalendarDays, List, Check, X } from 'lucide-vue-next';
import {
  DateFormatter,
  type DateValue,
  getLocalTimeZone,
  isEqualDay,
  today,
} from '@internationalized/date';
import { cn } from '@/lib/utils';

const df = new DateFormatter('zh-cn', { dateStyle: 'long' });

const taskIndex = defineModel<number>('taskIndex');
const taskDescription = defineModel<string>('taskDescription');
const taskNote = defineModel<string>('taskNote');
const taskDueDate = defineModel<DateValue>('taskDueDate');
const taskCreateTime = defineModel<string>('taskCreateTime');
const taskUpdateTime = defineModel<string>('taskUpdateTime');
const taskFinishTime = defineModel<string>('taskFinishTime');
const taskBelongList = defineModel<string>('taskBelongList');
const lists = defineModel<TaskList[]>('lists');

const showDueDatePopover = ref(false);
const editTemp = ref();
const calendarDate = ref<DateValue>();
const taskList = ref(taskBelongList.value);

watch(taskBelongList, (newValue) => {
  taskList.value = newValue;
});

watch(taskDueDate, (newValue) => {
  calendarDate.value = newValue;
});

const emits = defineEmits(['update']);

const saveDueDate = (date: DateValue | undefined) => {
  showDueDatePopover.value = false;
  if (!date) return;
  taskDueDate.value = date;
  emits('update', taskIndex.value, { due_date: date.toString() });
};

const updateTaskList = () => {
  if (!taskList.value) return;
  emits('update', taskIndex.value, { list_id: parseInt(taskList.value) });
};

const editGate = (v: any, e: Function) => {
  if (v === editTemp.value) {
    return;
  } else {
    e();
  }
  editTemp.value = null;
};
</script>

<template>
  <div class="grid gap-2 py-4">
    <div class="flex items-center">
      <Tag class="size-4 mr-3" />
      <Input
          class="w-full pl-4"
          v-model="taskDescription"
          placeholder="任务名称"
          @keyup.enter="$event.target.blur()"
          @focus="editTemp = taskDescription"
          @blur="editGate(taskDescription, () => {
          emits('update', taskIndex, { description: taskDescription });
        })"
      />
    </div>
    <div class="flex items-center">
      <CalendarDays class="size-4 mr-3" />
      <Popover v-model:open="showDueDatePopover">
        <PopoverTrigger as-child>
          <Button :class="cn('grow justify-start', !taskDueDate && 'text-muted-foreground')" variant="outline">
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
          <Calendar class="-mt-2" v-model="calendarDate" @update:modelValue="saveDueDate(calendarDate)" />
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
        <Select
            v-model="taskList"
            @update:modelValue="updateTaskList"
        >
          <SelectTrigger>
            <SelectValue class="ml-1" placeholder="选择列表" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="list in lists" :value="list.id+''">{{ list.name }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    <Textarea
        class="min-h-24"
        v-model="taskNote"
        placeholder="添加备注"
        @focus="editTemp = taskNote"
        @blur="editGate(taskNote, () => {
        emits('update', taskIndex, { note: taskNote });
      })"
    />
    <div class="text-xs text-gray-500 italic">
      <div>
        <span v-if="!taskUpdateTime">创建于 {{ taskCreateTime }}</span>
        <TooltipProvider v-else>
          <Tooltip>
            <TooltipTrigger as-child>
              <span>最后更新于 {{ taskUpdateTime }}</span>
            </TooltipTrigger>
            <TooltipContent side="top">
              创建于 {{ taskCreateTime }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div class="mt-2 flex items-center" v-if="taskFinishTime">
        <Check class="size-4 text-green-500 mr-2" />
        完成于 {{ taskFinishTime }}
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
