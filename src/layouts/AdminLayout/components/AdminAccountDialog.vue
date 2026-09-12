<template>
  <el-dialog
    v-model="visible"
    title="账户设置"
    width="min(92vw, 480px)"
    destroy-on-close
  >
    <el-radio-group v-model="mode" class="account-dialog__mode">
      <el-radio-button label="username">修改用户名</el-radio-button>
      <el-radio-button label="password">修改密码</el-radio-button>
    </el-radio-group>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="account-dialog__form"
    >
      <el-form-item v-if="mode === 'username'" label="新用户名" prop="username">
        <el-input
          v-model="form.username"
          autocomplete="username"
          maxlength="64"
          placeholder="请输入新的用户名"
        />
      </el-form-item>

      <template v-else>
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input
            v-model="form.oldPassword"
            type="password"
            autocomplete="current-password"
            show-password
            placeholder="请输入当前密码"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="form.newPassword"
            type="password"
            autocomplete="new-password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            autocomplete="new-password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
        <p class="account-dialog__hint">
          修改密码后当前会话会失效，需要重新登录。
        </p>
      </template>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSubmit">
        保存
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const visible = defineModel<boolean>({ default: false });
const mode = ref<"username" | "password">("username");
const saving = ref(false);
const formRef = ref<FormInstance>();
const auth = useAuthStore();
const router = useRouter();

const form = reactive({
  username: "",
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const validateConfirmPassword = (
  _rule: unknown,
  value: string,
  callback: (error?: Error) => void,
) => {
  if (!value) {
    callback(new Error("请确认新密码"));
  } else if (value !== form.newPassword) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const rules: FormRules = {
  username: [{ required: true, message: "请输入新用户名", trigger: "blur" }],
  oldPassword: [{ required: true, message: "请输入当前密码", trigger: "blur" }],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 8, message: "新密码至少需要 8 个字符", trigger: "blur" },
  ],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: "blur" }],
};

function resetForm() {
  mode.value = "username";
  form.username = "";
  form.oldPassword = "";
  form.newPassword = "";
  form.confirmPassword = "";
  formRef.value?.clearValidate();
}

watch(visible, (isOpen) => {
  if (isOpen) resetForm();
});

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  saving.value = true;
  try {
    if (mode.value === "username") {
      await auth.updateUser({ username: form.username.trim() });
      ElMessage.success("用户名已更新");
      visible.value = false;
      return;
    }

    await auth.updateUser({
      old_password: form.oldPassword,
      new_password: form.newPassword,
    });
    ElMessage.success("密码已更新，请重新登录");
    visible.value = false;
    auth.clearSession();
    await router.push("/login");
  } catch {
    ElMessage.error(
      mode.value === "username" ? "用户名更新失败" : "密码更新失败",
    );
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.account-dialog__mode {
  display: flex;
  width: 100%;
  margin-bottom: 24px;
}

.account-dialog__mode :deep(.el-radio-button) {
  flex: 1;
}

.account-dialog__mode :deep(.el-radio-button__inner) {
  width: 100%;
  border-radius: 0;
}

.account-dialog__form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.account-dialog__hint {
  margin: -4px 0 0;
  color: var(--admin-muted);
  font-size: 12px;
  line-height: 1.6;
}
</style>
