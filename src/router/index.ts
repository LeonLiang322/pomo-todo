import { createRouter, createWebHistory, Router, RouteRecordRaw } from 'vue-router';
import routerConfig from "@/lib/routerConfig.ts";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/pomo',
    component: () => import('@/layouts/AppLayout.vue'),
    children: [
        ...routerConfig,
    ]
  },
];

// TODO: hash?
const router: Router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
