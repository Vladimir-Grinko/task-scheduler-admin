import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/schedule",
  },
  {
    path: "/schedule",
    name: "Schedule",
    component: () => import("@/components/tabs/ScheduleTab.vue"),
  },
  {
    path: "/manual",
    name: "Manual",
    component: () => import("@/components/tabs/ManualUploadTab.vue"),
  },
  {
    path: "/notifications",
    name: "Notifications",
    component: () => import("@/components/tabs/NotificationsTab.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/schedule",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    console.log(to, from);
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

export default router;
