import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { login as loginApi, logout as logoutApi } from "@/api/auth";
import { updateUser as updateUserApi } from "@/api/user";
import { ElMessage } from "element-plus";
import router from "@/router";
import {
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  saveAuthTokens,
} from "@/utils/authStorage";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(getAccessToken());
  const refreshToken = ref(getRefreshToken());
  const username = ref(localStorage.getItem("username") || "");
  const isLoggedIn = computed(() => !!token.value);

  async function login(usernameVal: string, password: string) {
    const res = await loginApi(usernameVal, password);
    const data = res.data.data;

    if (!data?.access_token || !data?.refresh_token) {
      throw new Error("登录响应缺少 token");
    }

    token.value = data.access_token;
    refreshToken.value = data.refresh_token;
    username.value = data.user || usernameVal;
    saveAuthTokens({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    });
    localStorage.setItem("username", username.value);
    ElMessage.success("登录成功");
    await router.push("/admin/dashboard");
  }

  async function updateUser(data: {
    username?: string;
    old_password?: string;
    new_password?: string;
  }) {
    await updateUserApi(data);
    if (data.username) {
      username.value = data.username;
      localStorage.setItem("username", data.username);
    }
  }

  function clearSession() {
    token.value = "";
    refreshToken.value = "";
    username.value = "";
    clearAuthStorage();
  }

  async function logout() {
    try {
      await logoutApi();
    } finally {
      clearSession();
      await router.push("/login");
    }
  }

  return {
    token,
    refreshToken,
    username,
    isLoggedIn,
    login,
    updateUser,
    clearSession,
    logout,
  };
});
