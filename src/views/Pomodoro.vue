<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Pause, Play, Square } from "lucide-vue-next";
import { secondsToMs } from "@/lib/utils";

const ipc = (window as any).ipcRenderer;

const ready = ref(false);
const isStarted = ref(false);
const isPaused = ref(false);

const remainingTime = ref(0);
const isFocusPeriod = ref(true);
const focusMinutes = ref([ipc.sendSync('config-store-get', 'focusMinutes') || 25]);
const breakMinutes = ref([ipc.sendSync('config-store-get', 'breakMinutes') || 5]);

const updateTimerStatus = (event: any, data: { isRunning: boolean, remainingTime: number, isFocusPeriod: boolean }) => {
  if (data) {
    remainingTime.value = data.remainingTime;
    isFocusPeriod.value = data.isFocusPeriod;
    isStarted.value = true;
    isPaused.value = !data.isRunning;
  }
  ready.value = true;
};

const updateTimer = (event: any, data: { remainingTime: number; isFocusPeriod: boolean }) => {
  remainingTime.value = data.remainingTime;
  isFocusPeriod.value = data.isFocusPeriod;
};

// register listeners
ipc.once('timer-status', updateTimerStatus);
ipc.on('timer-update', updateTimer);

const startTimer = () => {
  remainingTime.value = focusMinutes.value[0] * 60;
  ipc.send('timer-create-worker', { focusTime: focusMinutes.value[0] * 60, breakTime: breakMinutes.value[0] * 60 });
  ipc.send('timer-control', { command: 'start' });
  isStarted.value = true;
  isPaused.value = false;
  ipc.send('config-store-set', { 'focusMinutes': focusMinutes.value[0], 'breakMinutes': breakMinutes.value[0] });
};

const pauseTimer = () => {
  ipc.send('timer-control', { command: 'pause' });
  isPaused.value = true;
};

const resumeTimer = () => {
  ipc.send('timer-control', { command: 'resume' });
  isPaused.value = false;
};

const stopTimer = () => {
  ipc.send('timer-terminate');
  isStarted.value = false;
};

// unregister listeners when component is unmounted
onBeforeUnmount(() => {
  ipc.removeAllListeners('timer-status');
  ipc.removeAllListeners('timer-update');
});

onMounted(() => {
  ipc.send('get-timer-status');
});
</script>

<template>
  <div v-if="ready" class="p-8 text-center w-[500px]">
    <div class="text-6xl sm:text-8xl font-black tracking-widest">
      <div v-if="isStarted">
        <p class="text-3xl">{{ isFocusPeriod ? '专注中' : '休息中'}}</p>
        <p class="mt-4">{{ secondsToMs(remainingTime) }}</p>
      </div>
      <div v-else>
        <p class="text-xl sm:text-2xl mb-1">专注</p>
        <p>{{ focusMinutes[0] }}:00</p>
        <Slider
            class="w-full mx-auto my-4 px-2 h-2"
            v-if="!isStarted"
            v-model="focusMinutes"
            :max="60"
            :min="1"
            :step="1"
        />
        <p class="text-3xl sm:text-4xl my-4">+</p>
        <p class="text-xl sm:text-2xl mb-1">休息</p>
        <p>{{ breakMinutes[0] }}:00</p>
        <Slider
            class="w-full mx-auto my-4 px-2 h-2"
            v-if="!isStarted"
            v-model="breakMinutes"
            :max="15"
            :min="1"
            :step="1"
        />
      </div>
    </div>
    <div class="flex items-center justify-center mt-8">
      <Button class="w-full h-12 text-lg sm:text-xl font-medium" v-if="!isStarted" @click="startTimer">
        <Play class="w-6 h-6 mr-4" /> 开始
      </Button>
      <Button class="pomo-ctl-btn" v-if="!isPaused && isStarted" size="icon" @click="pauseTimer">
        <Pause class="w-8 h-8" />
      </Button>
      <Button class="pomo-ctl-btn" v-if="isPaused && isStarted" size="icon" @click="resumeTimer">
        <Play class="w-8 h-8" />
      </Button>
      <Button class="pomo-ctl-btn" v-if="isStarted" size="icon" @click="stopTimer">
        <Square class="w-8 h-8" />
      </Button>
    </div>
  </div>
</template>
