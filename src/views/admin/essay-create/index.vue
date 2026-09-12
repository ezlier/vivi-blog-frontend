<template>
  <div class="page admin-essay-create">
    <div class="editor-header">
      <el-input
        v-model="form.title"
        class="title-input"
        maxlength="120"
        show-word-limit
        placeholder="请输入笔记标题"
      />
      <el-button class="settings-button" @click="showSettings = true">
        设置
      </el-button>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      class="essay-form"
      v-loading="loading"
      @submit.prevent
    >
      <el-form-item prop="content">
        <MdEditor v-model="form.content" style="height: 70dvh" />
      </el-form-item>

      <div class="form-actions">
        <el-button @click="router.push('/admin/essays')">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          {{ isEdit ? "保存修改" : "发布笔记" }}
        </el-button>
      </div>
    </el-form>

    <el-drawer
      v-model="showSettings"
      direction="rtl"
      size="min(90vw, 360px)"
      :with-header="false"
      :show-close="false"
      :close-on-click-modal="true"
      modal-class="essay-settings-modal"
      class="essay-settings-drawer"
    >
      <div class="settings-panel">
        <div class="settings-header">
          <button
            type="button"
            class="settings-close"
            aria-label="关闭设置"
            @click="showSettings = false"
          >
            &times;
          </button>
          <span>笔记设置</span>
        </div>

        <el-form label-position="top" class="settings-form">
          <el-form-item label="图片">
            <el-upload
              v-model:file-list="imageFiles"
              action="#"
              :auto-upload="false"
              :limit="6"
              multiple
              accept="image/jpeg,image/png"
              list-type="picture-card"
              :on-change="onImageChange"
              :on-exceed="onImageExceed"
            >
              <span class="upload-plus">+</span>
            </el-upload>

            <div v-if="isEdit && existingImages.length" class="existing-images">
              <img
                v-for="(image, index) in existingImages"
                :key="image"
                :src="image"
                :alt="`原图片 ${index + 1}`"
                class="existing-image"
                loading="lazy"
              />
            </div>

            <p class="upload-tip">
              最多上传 6 张 JPG 或 PNG 图片，单张不超过 5MB。
              {{ isEdit ? "上传新图片会替换原图片，不上传则保留原图片。" : "" }}
            </p>
          </el-form-item>

          <el-form-item v-if="isEdit" label="创建时间">
            <el-date-picker
              v-model="form.created_at"
              type="datetime"
              value-format="YYYY-MM-DDTHH:mm:ss"
              placeholder="选择创建时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ElMessage,
  type FormInstance,
  type FormRules,
  type UploadFile,
} from "element-plus";
import MdEditor from "@/components/MdEditor.vue";
import { createEssay, getEssay, updateEssay } from "@/api/essay";
import { useEssayStore } from "@/stores/essay";

const route = useRoute();
const router = useRouter();
const essayStore = useEssayStore();
const isEdit = computed(() => typeof route.params.slug === "string");
const formRef = ref<FormInstance>();
const saving = ref(false);
const loading = ref(false);
const showSettings = ref(false);

const form = ref({
  title: "",
  content: "",
  created_at: "",
});

const rules: FormRules = {
  content: [{ required: true, message: "请输入笔记内容", trigger: "change" }],
};

const imageFiles = ref<UploadFile[]>([]);
const existingImages = ref<string[]>([]);

function onImageChange(file: UploadFile, files: UploadFile[]) {
  if (!file.raw) return;

  const acceptedTypes = ["image/jpeg", "image/png"];
  if (!acceptedTypes.includes(file.raw.type)) {
    imageFiles.value = files.filter((item) => item.uid !== file.uid);
    ElMessage.error("只支持 JPG 或 PNG 图片");
    return;
  }

  if (file.raw.size > 5 * 1024 * 1024) {
    imageFiles.value = files.filter((item) => item.uid !== file.uid);
    ElMessage.error("单张图片不能超过 5MB");
  }
}

function onImageExceed() {
  ElMessage.warning("最多上传 6 张图片");
}

async function handleSave() {
  if (!form.value.title.trim()) {
    ElMessage.warning("请输入笔记标题");
    return;
  }

  const valid = await formRef.value?.validate().catch(() => false);
  if (valid === false) return;

  const formData = new FormData();
  formData.append("title", form.value.title.trim());
  formData.append("content", form.value.content);
  formData.append("is_draft", "false");

  if (isEdit.value && form.value.created_at) {
    formData.append("created_at", form.value.created_at);
  }

  for (const file of imageFiles.value) {
    if (file.raw) {
      formData.append("imgs", file.raw);
    }
  }

  saving.value = true;
  try {
    if (isEdit.value) {
      await updateEssay(route.params.slug as string, formData);
    } else {
      await createEssay(formData);
    }
    essayStore.clearCache();
    ElMessage.success(isEdit.value ? "笔记已更新" : "笔记已发布");
    await router.push("/admin/essays");
  } catch {
    ElMessage.error(isEdit.value ? "更新笔记失败" : "保存笔记失败");
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  if (!isEdit.value) return;

  loading.value = true;
  try {
    const response = await getEssay(route.params.slug as string);
    const essay = response.data.data;
    form.value.title = essay.title || "";
    form.value.content = essay.content || "";
    form.value.created_at = essay.created_at
      ? essay.created_at.slice(0, 19)
      : "";
    existingImages.value = Array.isArray(essay.imgs) ? essay.imgs : [];
  } catch {
    ElMessage.error("获取笔记详情失败");
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.admin-essay-create {
  min-height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-input {
  flex: 1;
  min-width: 0;
}

.title-input :deep(.el-input__wrapper) {
  padding: 8px 12px;
  box-shadow: none;
  background: transparent;
}

.title-input :deep(input) {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-heading, #333);
}

.settings-button {
  flex: 0 0 auto;
}

.essay-form {
  flex: 1;
  max-width: 10000px;
  margin-top: 20px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.settings-panel {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
}

.settings-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-heading, #333);
}

.settings-close {
  width: 28px;
  height: 28px;
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--color-text, #666);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.settings-close:hover {
  color: var(--color-heading, #333);
}

.settings-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.existing-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.existing-image {
  width: 88px;
  height: 66px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  object-fit: cover;
}

.upload-plus {
  font-size: 28px;
  line-height: 1;
}

.upload-tip {
  margin: 8px 0 0;
  color: var(--color-text-mute);
  font-size: 12px;
}

:deep(.essay-settings-drawer .el-drawer__body) {
  padding: 0;
}

:deep(.essay-settings-modal) {
  background: rgba(0, 0, 0, 0.38);
}

@media (max-width: 640px) {
  .editor-header {
    gap: 10px;
    flex-wrap: wrap;
  }

  .title-input {
    flex-basis: 100%;
  }

  .title-input :deep(input) {
    font-size: 20px;
  }

  .settings-button {
    padding: 8px 12px;
  }

  .form-actions {
    justify-content: stretch;
  }

  .form-actions .el-button {
    flex: 1;
  }
}
</style>
