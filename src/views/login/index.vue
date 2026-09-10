<template>
  <main
    class="login-console"
    :class="{ 'is-dark': ui.isDark }"
    data-ark-theme="endfield"
    data-ark-depth="moderate"
  >
    <header class="login-console__topbar">
      <div class="login-console__brand" aria-label="Vivi 后台控制台">
        <span class="login-console__mark" aria-hidden="true">V</span>
        <span class="login-console__brand-copy">
          <strong>VIVI CONSOLE</strong>
          <small>CONTENT OPERATIONS</small>
        </span>
      </div>

      <div class="login-console__utilities">
        <span class="login-console__utility">
          <span class="login-console__state-dot" aria-hidden="true"></span>
          <span>AUTH GATE ONLINE</span>
        </span>
        <button
          class="login-console__theme"
          type="button"
          :aria-label="ui.isDark ? '切换亮色主题' : '切换深色主题'"
          :aria-pressed="ui.isDark"
          :title="ui.isDark ? '切换亮色主题' : '切换深色主题'"
          @click="ui.toggleTheme"
        >
          <el-icon aria-hidden="true">
            <Sunny v-if="ui.isDark" />
            <Moon v-else />
          </el-icon>
        </button>
      </div>
    </header>

    <section class="login-console__stage" aria-labelledby="login-title">
      <div class="login-console__intro">
        <p class="login-console__kicker">ADMINISTRATION / ACCESS CONTROL</p>
        <h1 id="login-title">进入内容管理台</h1>
        <p>
          管理文章、笔记、互动内容与站点设置。请使用已授权的管理员账户继续。
        </p>
        <div class="login-console__meta" aria-label="系统说明">
          <span>VIVI / CMS</span>
          <span>SECURE SESSION</span>
        </div>
      </div>

      <section class="login-console__panel" aria-labelledby="login-form-title">
        <header class="login-console__panel-head">
          <div>
            <p class="login-console__kicker">IDENTITY VERIFICATION</p>
            <h2 id="login-form-title">管理员登录</h2>
          </div>
          <span class="login-console__panel-code">01 / 01</span>
        </header>

        <LoginForm
          v-model:username="username"
          v-model:password="password"
          :error="error"
          :submitting="submitting"
          @submit="handleLogin"
        />
      </section>
    </section>

    <footer class="login-console__footer">
      <span>VIVI BLOG / ADMIN PORTAL</span>
      <span>ACCESS BY AUTHORIZED ACCOUNT</span>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Moon, Sunny } from "@element-plus/icons-vue";
import LoginForm from "./component/LoginForm.vue";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";
import "./login.css";

const auth = useAuthStore();
const ui = useUiStore();
const username = ref("");
const password = ref("");
const error = ref("");
const submitting = ref(false);

function getLoginError(errorValue: unknown) {
  if (
    typeof errorValue === "object" &&
    errorValue !== null &&
    "response" in errorValue
  ) {
    const response = errorValue.response as {
      data?: { message?: string; msg?: string };
    };
    return (
      response.data?.message || response.data?.msg || "登录失败，请检查账户信息"
    );
  }

  return errorValue instanceof Error
    ? errorValue.message
    : "登录失败，请检查账户信息";
}

async function handleLogin() {
  error.value = "";
  submitting.value = true;

  try {
    await auth.login(username.value.trim(), password.value);
  } catch (errorValue) {
    error.value = getLoginError(errorValue);
  } finally {
    submitting.value = false;
  }
}
</script>
