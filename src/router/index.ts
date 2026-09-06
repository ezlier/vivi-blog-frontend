import { createRouter, createWebHistory } from "vue-router";
import routes from "./routes";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

// 全局前置守卫：后台路由鉴权
router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return {
      name: "Login",
      query: { redirect: to.fullPath },
    };
  }

  if (to.name === "Login" && auth.isLoggedIn) {
    return { name: "AdminDashboard" };
  }

  return true;
});

const originTitle = document.title;
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    document.title = "在暗处，有双眼睛盯着你";
  } else {
    document.title = originTitle;
  }
});

export default router;
