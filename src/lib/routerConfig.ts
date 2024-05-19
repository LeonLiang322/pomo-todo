const routerConfig = [
    {
        path: 'dashboard',
        name: '数据面板',
        component: () => import('@/views/Dashboard.vue'),
    },
    {
        path: 'today',
        name: '我的一天',
        component: () => import('@/views/Today.vue'),
    },
    {
        path: 'todo',
        name: '计划任务',
        component: () => import('@/views/Todo.vue'),
    },
    {
        path: 'pomo',
        name: '专注时钟',
        component: () => import('@/views/Pomodoro.vue'),
    }
];

export default routerConfig;
