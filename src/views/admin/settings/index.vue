<template>
  <div class="page admin-settings">
    <header class="settings-header">
      <div>
        <p class="settings-kicker">SITE SETTINGS</p>
      </div>
      <el-button type="primary" :loading="saving" @click="handleSave">
        保存设置
      </el-button>
    </header>

    <el-form v-loading="loading" :model="form" label-position="top" class="settings-form" @submit.prevent>
      <div class="settings-layout">
        <section class="settings-panel settings-panel--profile">
          <div class="panel-heading">
            <div>
              <p class="panel-kicker">PROFILE</p>
              <h2>站点信息</h2>
            </div>
            <span class="panel-index">01</span>
          </div>

          <div class="profile-fields">
            <el-form-item label="站点名称">
              <el-input v-model="form.web_name" placeholder="请输入站点名称" />
            </el-form-item>
            <el-form-item label="站长名称">
              <el-input v-model="form.name" placeholder="请输入站长名称" />
            </el-form-item>
          </div>

          <el-form-item label="头像">
            <div class="avatar-editor">
              <div class="avatar-frame">
                <img v-if="form.name_avatar_url" :src="form.name_avatar_url" class="avatar-preview" alt="站长头像" />
                <span v-else class="avatar-placeholder">
                  {{ (form.name || "V").slice(0, 1) }}
                </span>
              </div>
              <div class="avatar-actions">
                <el-upload :auto-upload="false" :limit="1" :show-file-list="false" :on-change="onAvatarChange"
                  :file-list="avatarFileList" accept="image/jpeg,image/png">
                  <el-button plain>更换头像</el-button>
                </el-upload>
                <p>支持 JPG、PNG，建议使用正方形图片。</p>
              </div>
            </div>
          </el-form-item>

          <div class="footer-fields">
            <el-form-item label="页脚文字1">
              <el-input v-model="form.footer_text1" type="textarea" :rows="3" maxlength="160" show-word-limit
                placeholder="请输入页脚第一行文字" />
            </el-form-item>

            <el-form-item label="页脚文字2">
              <el-input v-model="form.footer_text2" type="textarea" :rows="3" maxlength="160" show-word-limit
                placeholder="请输入页脚第二行文字" />
            </el-form-item>
          </div>
        </section>

        <section class="settings-panel settings-panel--editor">
          <div class="panel-heading">
            <div>
              <p class="panel-kicker">ABOUT PAGE</p>
              <h2>关于页内容</h2>
            </div>
            <span class="editor-badge">MARKDOWN</span>
          </div>

          <div class="editor-shell">
            <MdEditor v-model="form.about_md" style="height: 100%" />
          </div>
        </section>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import {
  getWebSetting as getAdminWebSetting,
  updateWebSetting,
} from "@/api/setting";
import { ElMessage } from "element-plus";
import MdEditor from "@/components/MdEditor.vue";
import type { UploadFile } from "element-plus";

const loading = ref(false);
const saving = ref(false);
const avatarObjectUrl = ref<string | null>(null);

const form = ref({
  web_name: "",
  name: "",
  name_avatar: null as File | null,
  name_avatar_url: "",
  footer_text1: "",
  footer_text2: "",
  about_md: "",
});

const avatarFileList = ref<UploadFile[]>([]);

function revokeAvatarObjectUrl() {
  if (!avatarObjectUrl.value) return;

  URL.revokeObjectURL(avatarObjectUrl.value);
  avatarObjectUrl.value = null;
}

function onAvatarChange(uploadFile: UploadFile) {
  form.value.name_avatar = uploadFile.raw || null;
  revokeAvatarObjectUrl();

  if (uploadFile.raw) {
    avatarObjectUrl.value = URL.createObjectURL(uploadFile.raw);
    form.value.name_avatar_url = avatarObjectUrl.value;
  }

  avatarFileList.value = [uploadFile];
}

async function fetchSettings() {
  loading.value = true;
  try {
    const res = await getAdminWebSetting();
    const data = res.data.data || res.data;
    revokeAvatarObjectUrl();
    form.value.web_name = data.web_name || "";
    form.value.name = data.name || "";
    form.value.name_avatar_url = data.name_avatar || "";
    form.value.footer_text1 = data.footer_text1 || "";
    form.value.footer_text2 = data.footer_text2 || "";
    form.value.about_md = data.about_md || "";
  } catch {
    ElMessage.error("获取网站设置失败");
  } finally {
    loading.value = false;
  }
}

async function handleSave() {
  saving.value = true;
  try {
    const fd = new FormData();
    fd.append("web_name", form.value.web_name);
    fd.append("name", form.value.name);
    fd.append("footer_text1", form.value.footer_text1);
    fd.append("footer_text2", form.value.footer_text2);
    fd.append("about_md", form.value.about_md);
    if (form.value.name_avatar) {
      fd.append("name_avatar", form.value.name_avatar);
    }
    await updateWebSetting(fd);
    ElMessage.success("设置已保存");
    await fetchSettings();
  } catch {
    ElMessage.error("保存失败");
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  fetchSettings();
});

onUnmounted(() => {
  revokeAvatarObjectUrl();
});
</script>

<style scoped>
.admin-settings {
  min-height: calc(100dvh - 104px);
}

.settings-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.settings-header h1 {
  margin: 0;
  color: var(--color-heading);
  font-size: 28px;
  line-height: 1.2;
}

.settings-kicker,
.panel-kicker {
  margin: 0 0 6px;
  color: var(--color-text-mute);
  font-size: 11px;
  font-weight: 700;
}

.settings-form {
  width: 100%;
}

.settings-layout {
  display: grid;
  grid-template-columns: minmax(280px, 0.78fr) minmax(0, 1.8fr);
  align-items: stretch;
  gap: 24px;
}

.settings-panel {
  min-width: 0;
  padding: 24px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-xs);
  background: var(--color-background);
  box-shadow: var(--box-shadow);
}

.settings-panel--profile {
  display: flex;
  flex-direction: column;
}

.settings-panel--editor {
  display: flex;
  min-height: 680px;
  flex-direction: column;
}

.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.panel-heading h2 {
  margin: 0;
  color: var(--color-heading);
  font-size: 19px;
  line-height: 1.3;
}

.panel-index {
  color: var(--color-text-mute);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.profile-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.settings-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.settings-form :deep(.el-form-item__label) {
  padding-bottom: 7px;
  color: var(--color-text);
  font-size: 13px;
  font-weight: 600;
}

.settings-form :deep(.el-input__wrapper),
.settings-form :deep(.el-textarea__inner) {
  box-shadow: 0 0 0 1px var(--color-border) inset;
}

.settings-form :deep(.el-input__wrapper:hover),
.settings-form :deep(.el-input__wrapper.is-focus),
.settings-form :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px var(--color-heading) inset;
}

.avatar-editor {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 4px;
}

.avatar-frame {
  display: grid;
  flex: 0 0 104px;
  place-items: center;
  width: 104px;
  height: 104px;
  overflow: hidden;
  border: 1px solid var(--color-heading);
  border-radius: 50%;
  background: var(--color-background-mute);
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: var(--color-heading);
  font-size: 32px;
  font-weight: 700;
}

.avatar-actions {
  min-width: 0;
}

.avatar-actions p {
  max-width: 180px;
  margin: 8px 0 0;
  color: var(--color-text-mute);
  font-size: 12px;
  line-height: 1.6;
}

.footer-fields {
  margin-top: auto;
  padding-top: 8px;
}

.editor-badge {
  flex: 0 0 auto;
  padding: 5px 8px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text-mute);
  font-size: 10px;
  font-weight: 700;
}

.editor-shell {
  min-height: 0;
  flex: 1;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-xs);
  background: var(--color-background-mute);
}

.editor-shell :deep(.md-editor) {
  height: 100%;
  min-height: 600px;
}

@media (max-width: 960px) {
  .settings-layout {
    grid-template-columns: minmax(240px, 0.9fr) minmax(0, 1.35fr);
    gap: 16px;
  }

  .settings-panel {
    padding: 20px;
  }
}

@media (max-width: 760px) {
  .settings-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .settings-header .el-button {
    width: 100%;
  }

  .settings-layout {
    grid-template-columns: 1fr;
  }

  .settings-panel--editor {
    min-height: 560px;
  }

  .editor-shell :deep(.md-editor) {
    min-height: 480px;
  }
}

@media (max-width: 480px) {
  .settings-panel {
    padding: 16px;
  }

  .profile-fields {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .avatar-editor {
    align-items: flex-start;
  }

  .avatar-frame {
    flex-basis: 88px;
    width: 88px;
    height: 88px;
  }
}
</style>
