<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Pause, Play, Square, Minus, Plus } from "lucide-vue-next";
import { secondsToMs } from "@/lib/utils";

const ipc = (window as any).ipcRenderer;

const ready = ref(false);
const isStarted = ref(false);
const isPaused = ref(false);

const remainingTime = ref(0);
const isFocusPeriod = ref(true);
const focusMinutes = ref<number[]>([ipc.sendSync('config-store-get', 'focusMinutes') || 25]);
const breakMinutes = ref<number[]>([ipc.sendSync('config-store-get', 'breakMinutes') || 5]);

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
  <div v-if="ready" class="h-full w-full flex flex-col lg:flex-row flex-grow overflow-auto">
    <div class="h-full lg:w-1/2 flex items-center justify-center">
      <div class="flex flex-col text-center lg:mb-12">
        <div class="text-2xl lg:text-4xl py-4 ylg:italic">
          专注{{ isStarted && isFocusPeriod ? '中' : '' }}
        </div>
        <div class="h-[6px] bg-black rounded-lg" />
        <div class="flex items-center mt-6 mb-7" v-if="!isStarted">
          <Button
              class="size-12 lg:size-16 rounded-xl"
              :disabled="focusMinutes[0] < 16"
              size="icon"
              @click="focusMinutes[0]--"
          >
            <Minus class="size-8 lg:size-10" />
          </Button>
          <div class="min-w-24 lg:min-w-32 text-6xl lg:text-8xl mx-8 select-none">
            {{ focusMinutes[0] }}
          </div>
          <Button
              class="size-12 lg:size-16 rounded-xl"
              :disabled="focusMinutes[0] > 59"
              size="icon"
              @click="focusMinutes[0]++">
            <Plus class="size-8 lg:size-10" />
          </Button>
        </div>
        <Slider
            v-if="!isStarted"
            v-model="focusMinutes"
            :max="60"
            :min="1"
            :step="1"
        />
        <div v-else>
          <p class="text-6xl lg:text-8xl my-4 lg:my-6 mx-10 font-black">
            {{ isFocusPeriod ? secondsToMs(remainingTime) : focusMinutes[0] + ':00' }}
          </p>
          <div class="h-[6px] bg-black rounded-lg" />
        </div>
      </div>
    </div>
    <div class="grid items-center justify-center lg:h-full py-4 px-8 border-x-2">
      <Button class="size-14 lg:size-20 text-lg lg:text-xl" size="icon" v-if="!isStarted" @click="startTimer">
        <Play class="size-8 lg:size-12" />
      </Button>
      <div v-else class="flex lg:flex-col gap-8">
        <Button class="pomo-ctl-btn" v-if="!isPaused && isStarted" size="icon" @click="pauseTimer">
          <Pause class="size-6 lg:size-8" />
        </Button>
        <Button class="pomo-ctl-btn" v-if="isPaused && isStarted" size="icon" @click="resumeTimer">
          <Play class="size-6 lg:size-8" />
        </Button>
        <Button class="pomo-ctl-btn" v-if="isStarted" size="icon" @click="stopTimer">
          <Square class="size-6 lg:size-8" />
        </Button>
      </div>
    </div>
    <div class="h-full lg:w-1/2 flex items-center justify-center">
      <div class="flex flex-col-reverse lg:flex-col text-center lg:mb-12">
        <div class="text-2xl lg:text-4xl py-4">
          休息{{ isStarted && !isFocusPeriod ? '中' : '' }}
        </div>
        <div class="h-[6px] bg-black rounded-lg" />
        <div v-if="!isStarted" class="flex items-center mt-6 mb-7">
          <Button
              class="size-12 lg:size-16 rounded-xl"
              :disabled="breakMinutes[0] < 4"
              size="icon"
              @click="breakMinutes[0]--"
          >
            <Minus class="size-8 lg:size-10" />
          </Button>
          <div class="min-w-24 lg:min-w-32 text-6xl lg:text-8xl mx-8 select-none">
            {{ breakMinutes[0] }}
          </div>
          <Button
              class="size-12 lg:size-16"
              :disabled="breakMinutes[0] > 14"
              size="icon"
              @click="breakMinutes[0]++"
          >
            <Plus class="size-8 lg:size-10" />
          </Button>
        </div>
        <Slider
            v-if="!isStarted"
            v-model="breakMinutes"
            :max="15"
            :min="1"
            :step="1"
        />
        <p v-else class="text-6xl lg:text-8xl my-4 lg:my-6 mx-10 font-black">
          {{ isFocusPeriod ? breakMinutes + ':00' : secondsToMs(remainingTime) }}
        </p>
        <div v-if="isStarted" class="h-[6px] bg-black rounded-lg" />
      </div>
    </div>
  </div>

  <!--<div class="h-full w-full flex items-center justify-center">-->
  <!--  <div v-if="ready" class="w-full max-h-full text-center p-2 lg:p-8 overflow-auto">-->
  <!--    <div class="text-6xl lg:text-8xl font-black tracking-widest">-->
  <!--      <div v-if="isStarted">-->
  <!--        <p class="text-3xl">{{ isFocusPeriod ? '专注中' : '休息中'}}</p>-->
  <!--        <p class="mt-4">{{ secondsToMs(remainingTime) }}</p>-->
  <!--      </div>-->
  <!--      <div v-else>-->
  <!--        <p class="text-xl lg:text-2xl mb-1">专注</p>-->
  <!--        <p>{{ focusMinutes[0] }}:00</p>-->
  <!--        <Slider-->
  <!--            class="w-full mx-auto my-4 px-2 h-2"-->
  <!--            v-if="!isStarted"-->
  <!--            v-model="focusMinutes"-->
  <!--            :max="60"-->
  <!--            :min="1"-->
  <!--            :step="1"-->
  <!--        />-->
  <!--        <p class="text-3xl lg:text-4xl my-4">+</p>-->
  <!--        <p class="text-xl lg:text-2xl mb-1">休息</p>-->
  <!--        <p>{{ breakMinutes[0] }}:00</p>-->
  <!--        <Slider-->
  <!--            class="w-full mx-auto my-4 px-2 h-2"-->
  <!--            v-if="!isStarted"-->
  <!--            v-model="breakMinutes"-->
  <!--            :max="15"-->
  <!--            :min="1"-->
  <!--            :step="1"-->
  <!--        />-->
  <!--      </div>-->
  <!--    </div>-->
  <!--    <div class="flex items-center justify-center mt-6">-->
  <!--      <Button class="w-full h-12 text-lg lg:text-xl font-medium" v-if="!isStarted" @click="startTimer">-->
  <!--        <Play class="w-6 h-6 mr-4" /> 开始-->
  <!--      </Button>-->
  <!--      <Button class="pomo-ctl-btn" v-if="!isPaused && isStarted" size="icon" @click="pauseTimer">-->
  <!--        <Pause class="w-8 h-8" />-->
  <!--      </Button>-->
  <!--      <Button class="pomo-ctl-btn" v-if="isPaused && isStarted" size="icon" @click="resumeTimer">-->
  <!--        <Play class="w-8 h-8" />-->
  <!--      </Button>-->
  <!--      <Button class="pomo-ctl-btn" v-if="isStarted" size="icon" @click="stopTimer">-->
  <!--        <Square class="w-8 h-8" />-->
  <!--      </Button>-->
  <!--    </div>-->
  <!--  </div>-->
  <!--</div>-->
</template>
