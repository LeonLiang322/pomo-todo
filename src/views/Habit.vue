

<script setup lang="ts">
import { onMounted, ref } from 'vue';

interface Habit {
  id: number;
  name: string;
  interval: number;
  longest_streak: number;
  current_streak: number;
  status: number;
  create_time: string;
  checked_in_today: boolean;
}

const newHabitName = ref('');
const newHabitInterval = ref(1);
const habits = ref<Habit[]>([]);

// 查询所有习惯
const fetchHabits = () => {
  habits.value = (window as any).ipcRenderer.sendSync('db-operation', {
    action: 'custom',
    sql: `
      SELECT h.*,
        CASE
          WHEN (SELECT COUNT(*) FROM habit_log hl WHERE hl.habit_id = h.id AND hl.date = DATE('now') AND hl.is_skip = 0) > 0 THEN 1
          ELSE 0
        END AS checked_in_today
      FROM habit h;
    `,
    params: []
  });
};

// 创建新习惯
const createHabit = () => {
  (window as any).ipcRenderer.sendSync('db-operation', {
    action: 'custom',
    sql: 'INSERT INTO habit (name, interval) VALUES (?, ?)',
    params: [newHabitName.value, newHabitInterval.value]
  });
  fetchHabits();
};

// 打卡
const checkIn = (habitId: number) => {
  (window as any).ipcRenderer.sendSync('db-operation', {
    action: 'custom',
    sql: 'INSERT INTO habit_log (habit_id, date, is_skip) VALUES (?, DATE(\'now\'), 0)',
    params: [habitId]
  });
  fetchHabits();
};

// 跳过打卡
const skipCheckIn = (habitId: number) => {
  (window as any).ipcRenderer.sendSync('db-operation', {
    action: 'custom',
    sql: 'INSERT INTO habit_log (habit_id, date, is_skip) VALUES (?, DATE(\'now\'), 1)',
    params: [habitId]
  });
  fetchHabits();
};

onMounted(() => {
  fetchHabits();
});
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">习惯养成</h1>

    <div class="mb-4">
      <input v-model="newHabitName" placeholder="新习惯名称" class="border p-2 mr-2" />
      <input v-model="newHabitInterval" type="number" min="1" placeholder="间隔天数" class="border p-2 mr-2" />
      <button @click="createHabit" class="bg-blue-500 text-white p-2">创建习惯</button>
    </div>

    <div v-for="habit in habits" :key="habit.id" class="mb-4 p-4 border rounded">
      <h2 class="text-xl font-semibold">{{ habit.name }}</h2>
      <p>间隔天数: {{ habit.interval }}</p>
      <p>最长连续打卡记录: {{ habit.longest_streak }}</p>
      <p>当前连续打卡记录: {{ habit.current_streak }}</p>
      <p>今日是否已打卡: {{ habit.checked_in_today ? '是' : '否' }}</p>
      <p>习惯状态: {{ habit.status === -1 ? '失败' : habit.status === 0 ? '进行中' : '成功' }}</p>

      <button @click="checkIn(habit.id)" :disabled="habit.checked_in_today" class="bg-green-500 text-white p-2 mr-2">
        打卡
      </button>
      <button @click="skipCheckIn(habit.id)" class="bg-yellow-500 text-white p-2">
        跳过
      </button>
    </div>
  </div>
</template>

<style scoped>
.border {
  border: 1px solid #ccc;
}
</style>
