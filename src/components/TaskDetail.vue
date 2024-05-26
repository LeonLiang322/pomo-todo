<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronRight, List, Ban, Cross, Check, X, CalendarDays, Tag, ListTodo } from 'lucide-vue-next';
import { parseDate, DateFormatter, type DateValue, getLocalTimeZone, isEqualDay, today } from '@internationalized/date';
import { cn, getCurrentTime } from '@/lib/utils';

const props = defineProps({
  task: {
    type: Object as () => Task,
    required: true,
  },
  lists: {
    type: Array as () => TaskList[],
    required: true,
  },
});

watch(() => props.task, () => {
  taskIndex.value = props.task.id;
  taskDescription.value = props.task.description;
  taskNote.value = props.task.note;
  taskBelongList.value = props.task.list_id + '';
});

watch(() => props.lists, () => {
  taskLists.value = props.lists;
  taskBelongList.value = props.task.list_id + '';
});

const emit = defineEmits(['updateTask']);

const showDueDatePopover = ref(false);
const editTemp = ref<any>();

const taskLists = ref(props.lists);
const taskIndex = ref(props.task.id);
const taskDescription = ref(props.task.description);
const taskNote = ref(props.task.note);
const taskDueDate = ref<DateValue>();
const taskBelongList = ref(props.task.list_id + '');

const df = new DateFormatter('zh-cn', { dateStyle: 'long' });

const updateDueDate = (date: DateValue | undefined) => {
  showDueDatePopover.value = false;
  if (!date) return;
  taskDueDate.value = date;
  emit('updateTask', { due_date: date.toString() });
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
  <div>
    <div class="grid gap-2 border-t-2 mt-4 py-4">
      <div class="flex items-center">
        <Tag class="size-4 mr-3" />
        <Input
            class="w-full pl-4"
            v-model="taskDescription"
            placeholder="任务名称"
            @keyup.enter="$event.target.blur()"
            @focus="editTemp = taskDescription"
            @blur="editGate(taskDescription, () => {
            emit('updateTask', taskIndex, { description: taskDescription })
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
                @click="updateDueDate(today(getLocalTimeZone()))"
            >
              <CalendarDays class="mr-2 h-4 w-4" />今天截止
            </Button>
            <Button
                v-if="!taskDueDate || !isEqualDay(taskDueDate, today(getLocalTimeZone()).add({ days: 1 }))"
                variant="outline"
                class="w-full justify-start"
                @click="updateDueDate(today(getLocalTimeZone()).add({ days: 1 }))"
            >
              <CalendarDays class="mr-2 h-4 w-4" />明天截止
            </Button>
            <Calendar class="-mt-2" v-model="taskDueDate" @update:modelValue="updateDueDate(taskDueDate)" />
          </PopoverContent>
        </Popover>
        <Button class="ml-2 text-red-500" v-if="taskDueDate" variant="outline" size="icon" @click="showDueDatePopover = false; taskDueDate = undefined;">
          <X class="size-5" />
        </Button>
      </div>
      <div class="flex items-center">
        <List class="size-4 mr-3" />
        <div class="grow">
          <Select v-model="taskBelongList" @update:modelValue="(val) => emit('updateTask', { list_id: parseInt(val) })">
            <SelectTrigger>
              <SelectValue class="ml-1" placeholder="选择列表" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="list in taskLists" :key="list.id" :value="list.id+''">
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
          @blur="editGate(taskNote, () => {
          emit('updateTask', { note: taskNote })
        })"
      />
    </div>
    <div class="text-xs text-gray-500 italic">
      <div>
        <span v-if="!props.task.update_time">创建于 {{ props.task.create_time }}</span>
        <TooltipProvider v-else>
          <Tooltip>
            <TooltipTrigger as-child>
              <span>最后更新于 {{ props.task.update_time }}</span>
            </TooltipTrigger>
            <TooltipContent side="top">
              创建于 {{ props.task.create_time }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div class="mt-2 flex items-center" v-if="props.task.finish_time">
        <Check class="size-4 text-green-500 mr-2" />
        完成于 {{ props.task.finish_time }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any required styles here */
</style>
