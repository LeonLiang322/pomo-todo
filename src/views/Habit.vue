<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
          WHEN (SELECT COUNT(*) FROM habit_log hl WHERE hl.habit_id = h.id AND hl.date = DATE('now')) > 0 THEN 1
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
    sql: 'INSERT INTO habit_log (habit_id) VALUES (?)',
    params: [habitId]
  });
  fetchHabits();
};

onMounted(() => {
  fetchHabits();
});
</script>

<template>
  <div class="border-2 flex justify-center flex-wrap gap-4 p-4 h-full overflow-y-auto">

    <Card class="h-72" v-for="habit in habits" :key="habit.id">
      <CardHeader>
        <CardTitle>{{ habit.name }}</CardTitle>
        <CardDescription />
      </CardHeader>
      <CardContent>
        <p>间隔天数: {{ habit.interval }}</p>
        <p>最长连续打卡记录: {{ habit.longest_streak }}</p>
        <p>当前连续打卡记录: {{ habit.current_streak }}</p>
        <p>今日是否已打卡: {{ habit.checked_in_today ? '是' : '否' }}</p>
        <p>习惯状态: {{ habit.status === -1 ? '失败' : habit.status === 0 ? '进行中' : '成功' }}</p>
      </CardContent>
      <CardFooter>
        <button @click="checkIn(habit.id)" :disabled="habit.checked_in_today" class="bg-green-500 text-white p-2 mr-2">
          打卡
        </button>
      </CardFooter>
    </Card>



  </div>
</template>

<style scoped>

</style>
