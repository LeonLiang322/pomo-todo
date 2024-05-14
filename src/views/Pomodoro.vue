<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue';
import { Play, Pause, Square } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import CountdownTimer from '@/lib/timer';

const { proxy } = getCurrentInstance();
const ipc = window.ipcRenderer;
dayjs.extend(duration);

const isStarted = ref(false);
const isPaused = ref(false);

const focusMinutes = ref([ipc.cStoreGet('focusMinutes') || 25]);
const breakMinutes = ref([ipc.cStoreGet('breakMinutes') || 5]);

const formattedFocusTime = ref('00:00');
const formattedBreakTime = ref('00:00');
let timer = null;
const timerStarted = ref(false);
const isFocusPeriod = ref(true);

const updateFormattedTime = (ms, isFocus) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  if (isFocus) {
    formattedFocusTime.value = formattedTime;
  } else {
    formattedBreakTime.value = formattedTime;
  }
};

const startFocus = () => {
  isFocusPeriod.value = true;
  const duration = focusMinutes.value[0] * 60 * 1000; // Convert minutes to milliseconds
  startTimer(duration, true);
  ipc.cStoreSet({'focusMinutes': focusMinutes.value[0]});
  ipc.cStoreSet({'breakMinutes': breakMinutes.value[0]});
};

const startBreak = () => {
  isFocusPeriod.value = false;
  const duration = breakMinutes.value[0] * 60 * 1000; // Convert minutes to milliseconds
  startTimer(duration, false);
};

const startTimer = (duration, isFocus) => {
  timer = new CountdownTimer(
      duration,
      (remaining) => updateFormattedTime(remaining, isFocus),
      () => {
        updateFormattedTime(0, isFocus);
        if (isFocus) startBreak();
        else startFocus();
      }
  );
  timer.start();
  timerStarted.value = true;
  isStarted.value = true;
  isPaused.value = false;
  const endTime = dayjs().add(timer.getRemainingTime(), 'millisecond').valueOf();
  // sessionStorage.setItem('endTime', endTime);
  // sessionStorage.setItem('isFocusPeriod', isFocus);
  // sessionStorage.removeItem('timeLeft');
  ipc.sStoreSet({'endTime': endTime, 'isFocusPeriod': isFocus});
  ipc.sStoreDel(['timeLeft'])
};

const pause = () => {
  timer.pause();
  // sessionStorage.setItem('timeLeft', timer.getRemainingTime());
  // sessionStorage.removeItem('endTime');
  ipc.sStoreSet({'timeLeft': timer.getRemainingTime()});
  ipc.sStoreDel(['endTime']);
  isPaused.value = true;
};

const resume = () => {
  timer.resume();
  const endTime = dayjs().add(timer.getRemainingTime(), 'millisecond').valueOf();
  // sessionStorage.setItem('endTime', endTime);
  // sessionStorage.removeItem('timeLeft');
  ipc.sStoreSet({'endTime': endTime});
  ipc.sStoreDel(['timeLeft']);
  isPaused.value = false;
};

const stop = () => {
  timer.stop();
  updateFormattedTime(0, isFocusPeriod.value);
  timerStarted.value = false;
  isStarted.value = false;
  // sessionStorage.removeItem('timeLeft');
  // sessionStorage.removeItem('endTime');
  // sessionStorage.removeItem('isFocusPeriod');
  ipc.sStoreDel(['timeLeft', 'endTime', 'isFocusPeriod']);
};

const checkSessionStorage = () => {
  // const timeLeft = sessionStorage.getItem('timeLeft');
  // const endTime = sessionStorage.getItem('endTime');
  // const storedIsFocusPeriod = sessionStorage.getItem('isFocusPeriod');
  const timeLeft = ipc.sStoreGet('timeLeft');
  const endTime = ipc.sStoreGet('endTime');
  const storedIsFocusPeriod = ipc.sStoreGet('isFocusPeriod');

  if (timeLeft) {
    const isFocus = storedIsFocusPeriod === 'true';
    timer = new CountdownTimer(
        parseInt(timeLeft, 10),
        (remaining) => updateFormattedTime(remaining, isFocus),
        () => {
          updateFormattedTime(0, isFocus);
          if (isFocus) {
            proxy.$toast('休息一下吧~', '专注暂停');
            startBreak();
          } else {
            proxy.$toast('继续专注咯~', '专注开始');
            startFocus();
          }
        }
    );
    timer.remaining = parseInt(timeLeft, 10);
    updateFormattedTime(timer.remaining, isFocus);
    timer.paused = true;
    timerStarted.value = true;
    isFocusPeriod.value = isFocus;
    isStarted.value = true;
    isPaused.value = true;
  } else if (endTime) {
    const now = dayjs();
    const end = dayjs(parseInt(endTime, 10));
    const remaining = end.diff(now);
    const isFocus = storedIsFocusPeriod === 'true';

    if (remaining > 0) {
      timer = new CountdownTimer(
          remaining,
          (remaining) => updateFormattedTime(remaining, isFocus),
          () => {
            updateFormattedTime(0, isFocus);
            if (isFocus) {
              proxy.$toast('休息一下吧~', '专注暂停');
              startBreak();
            } else {
              proxy.$toast('继续专注咯~', '专注开始');
              startFocus();
            }
          }
      );
      timer.remaining = remaining;
      timer.startTime = now;
      timer.paused = false;
      timerStarted.value = true;
      timer.tick();
      isFocusPeriod.value = isFocus;
    } else {
      updateFormattedTime(0, isFocus);
    }
    isStarted.value = true;
  }
};

onMounted(() => {
  checkSessionStorage();
});
</script>

<template>
  <div class="text-center w-full md:w-2/3 mx-auto py-4">
    <div class="text-8xl font-black tracking-widest">
      <div class="mt-10" v-if="isStarted">
        <p class="text-3xl">{{ isFocusPeriod ? '专注中' : '休息中'}}</p>
        <p class="my-4">{{ isFocusPeriod ? formattedFocusTime : formattedBreakTime }}</p>
      </div>
      <div v-else>
        <p class="text-2xl mb-1">专注</p>
        <p>{{ focusMinutes[0] }}:00</p>
        <Slider
            class="w-full mx-auto my-4 px-2 h-2"
            v-if="!isStarted"
            v-model="focusMinutes"
            :max="60"
            :min="1"
            :step="1"
        />
        <p class="text-4xl my-4">+</p>
        <p class="text-2xl mb-1">休息</p>
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
      <Button class="w-full h-12 text-xl font-medium" v-if="!isStarted" @click="startFocus">
        <Play class="w-6 h-6 mr-4" /> 开始
      </Button>
      <Button class="pomo-ctl-btn" v-if="!isPaused && isStarted" size="icon" @click="pause">
        <Pause class="w-8 h-8" />
      </Button>
      <Button class="pomo-ctl-btn" v-if="isPaused && isStarted" size="icon" @click="resume">
        <Play class="w-8 h-8" />
      </Button>
      <Button class="pomo-ctl-btn" v-if="isStarted" size="icon" @click="stop">
        <Square class="w-8 h-8" />
      </Button>
    </div>
  </div>
</template>
