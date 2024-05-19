const { parentPort, workerData } = require('worker_threads');

let countdown = workerData.focusTime || 25 * 60; // 默认25分钟转为秒
let focusTime = workerData.focusTime || 25 * 60;
let breakTime = workerData.breakTime || 5 * 60;
let isFocusPeriod = true; // 默认开始为焦点时间
let timer = null;
let isRunning = false;

const startTimer = () => {
  if (!isRunning) {
    isRunning = true;
    timer = setInterval(() => {
      countdown--;
      parentPort.postMessage({ remainingTime: countdown, isFocusPeriod });
      if (countdown <= 0) {
        clearInterval(timer);
        isRunning = false;
        togglePeriod();
      }
    }, 1000);
  }
};

const togglePeriod = () => {
  isFocusPeriod = !isFocusPeriod; // 切换周期
  countdown = isFocusPeriod ? focusTime : breakTime; // 设置为相应周期的时长
  startTimer(); // 自动开始下一个周期
};

parentPort.on('message', (message) => {
  switch (message.command) {
    case 'start':
      if (!isRunning) { // 如果计时器未运行，则开始
        startTimer();
      }
      break;
    case 'pause':
      if (timer) {
        clearInterval(timer);
        timer = null;
        isRunning = false;
      }
      break;
    case 'resume':
      startTimer();
      break;
    case 'stop':
      if (timer) {
        clearInterval(timer);
        timer = null;
        isRunning = false;
      }
      countdown = isFocusPeriod ? focusTime : breakTime; // 重置到当前周期的全时长
      break;
    case 'set-focus':
      focusTime = message.duration;
      if (isFocusPeriod) { // 如果当前是焦点时间，则更新倒计时
        countdown = focusTime;
      }
      break;
    case 'set-break':
      breakTime = message.duration;
      if (!isFocusPeriod) { // 如果当前是休息时间，则更新倒计时
        countdown = breakTime;
      }
      break;
    case 'get-status':
      parentPort.postMessage({ isRunning: isRunning, remainingTime: countdown, isFocusPeriod }); // 发送当前状态和剩余时间
      break;
  }
});
