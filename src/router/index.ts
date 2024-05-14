import { createRouter, createWebHistory, Router, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/dashboard',
    component: () => import('@/layouts/AppLayout.vue'),
    children: [
        {
            path: 'dashboard',
            name: 'Dashboard',
            component: () => import('@/views/Dashboard.vue'),
        },
        {
            path: 'today',
            name: 'Today',
            component: () => import('@/views/Today.vue'),
        },
        {
            path: 'todo',
            name: 'todo',
            component: () => import('@/views/Todo.vue'),
        },
        {
            path: 'pomo',
            name: 'Pomodoro',
            component: () => import('@/views/Pomodoro.vue'),
        }
    ],
  },
];

// TODO: hash?
const router: Router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
