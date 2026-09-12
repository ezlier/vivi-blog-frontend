<template>
  <form class="console-login-form" @submit.prevent="emit('submit')">
    <div class="console-login-form__field">
      <label for="console-login-username">用户名</label>
      <div class="console-login-form__control">
        <el-icon aria-hidden="true"><User /></el-icon>
        <input
          id="console-login-username"
          v-model="username"
          type="text"
          autocomplete="username"
          placeholder="输入管理员用户名"
          required
        />
      </div>
    </div>

    <div class="console-login-form__field">
      <label for="console-login-password">密码</label>
      <div class="console-login-form__control">
        <el-icon aria-hidden="true"><Lock /></el-icon>
        <input
          id="console-login-password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          placeholder="输入账户密码"
          required
        />
      </div>
    </div>

    <p v-if="error" class="console-login-form__error" role="alert">
      {{ error }}
    </p>

    <button
      class="console-login-form__submit"
      type="submit"
      :disabled="submitting"
    >
      <span>{{ submitting ? "验证中…" : "进入管理台" }}</span>
      <el-icon aria-hidden="true"><Right /></el-icon>
    </button>
  </form>
</template>

<script setup lang="ts">
import { Lock, Right, User } from "@element-plus/icons-vue";

defineProps<{
  error: string;
  submitting: boolean;
}>();

const username = defineModel<string>("username", { required: true });
const password = defineModel<string>("password", { required: true });

const emit = defineEmits<{
  submit: [];
}>();
</script>
