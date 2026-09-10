<template>
  <div class="page admin-article-edit">
    <div class="editor-header">
      <el-input
        v-model="form.title"
        class="title-input"
        placeholder="请输入文章标题"
      />
      <input
        ref="markdownFileInput"
        class="markdown-file-input"
        type="file"
        accept=".md,.markdown,text/markdown"
        @change="handleMarkdownFileChange"
      />
      <el-button
        class="markdown-upload-button"
        :icon="Upload"
        @click="triggerMarkdownUpload"
      >
        导入 MD
      </el-button>
      <el-button class="settings-button" @click="showSettings = true"
        >设置</el-button
      >
    </div>

    <el-form v-loading="loading" class="article-form">
      <MdEditor
        previewTheme="arknights"
        v-model="form.content"
        style="height: 70dvh"
      />
    </el-form>

    <div class="form-actions">
      <el-button @click="handleSaveDraft" :loading="saving">保留草稿</el-button>
      <el-button type="success" @click="handlePublish" :loading="publishing"
        >直接发布</el-button
      >
    </div>

    <el-drawer
      v-model="showSettings"
      direction="rtl"
      size="min(90vw, 360px)"
      :with-header="false"
      :show-close="false"
      :close-on-click-modal="true"
      modal-class="article-settings-modal"
      class="article-settings-drawer"
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
          <span>文章设置</span>
        </div>

        <el-form label-position="top" class="settings-form">
          <el-form-item label="标签">
            <el-select
              v-model="form.tagNames"
              multiple
              filterable
              allow-create
              default-first-option
              :reserve-keyword="false"
              placeholder="输入或选择标签"
              style="width: 100%"
            >
              <el-option
                v-for="tag in availableTags"
                :key="tag"
                :label="tag"
                :value="tag"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="文章封面">
            <div class="cover-area">
              <div class="cover-placeholder" @click="triggerCoverUpload">
                <img
                  v-if="coverPreview"
                  :src="coverPreview"
                  class="cover-img"
                />
                <div v-else class="cover-empty">
                  <span class="cover-empty__icon">🖼</span>
                  <span class="cover-empty__text">无封面图</span>
                </div>
              </div>
              <el-upload
                ref="coverUploadRef"
                class="cover-upload-hidden"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="onCoverChange"
                accept="image/*"
              />
            </div>
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
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  createArticle,
  updateArticle,
  getArticle as getAdminArticle,
} from "@/api/article";
import { getTags } from "@/api/tag";
import { ElMessage } from "element-plus";
import { Upload } from "@element-plus/icons-vue";
import MdEditor from "@/components/MdEditor.vue";
import type { UploadFile, UploadInstance } from "element-plus";

const route = useRoute();
const router = useRouter();
const isEdit = computed(() => !!route.params.slug);

const loading = ref(false);
const saving = ref(false);
const publishing = ref(false);
const showSettings = ref(false);
const availableTags = ref<string[]>([]);
const markdownFileInput = ref<HTMLInputElement | null>(null);

const form = ref({
  title: "",
  tagNames: [] as string[],
  cover: null as File | null,
  content: "",
  created_at: "",
});

// ── 封面 ──
const coverPreview = ref("");
const coverUploadRef = ref<UploadInstance | null>(null);

function triggerCoverUpload() {
  const el = coverUploadRef.value?.$el as HTMLElement | undefined;
  const input = el?.querySelector(
    'input[type="file"]',
  ) as HTMLInputElement | null;
  input?.click();
}

function onCoverChange(uploadFile: UploadFile) {
  form.value.cover = uploadFile.raw || null;
  // 生成本地预览 URL
  if (uploadFile.raw) {
    coverPreview.value = URL.createObjectURL(uploadFile.raw);
  }
}

function triggerMarkdownUpload() {
  markdownFileInput.value?.click();
}

async function handleMarkdownFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    form.value.content = await file.text();
    ElMessage.success(`已导入 ${file.name}`);
  } catch {
    ElMessage.error("读取 Markdown 文件失败");
  } finally {
    input.value = "";
  }
}

// ── 表单提交 ──
async function buildFormData(isDraft: boolean): Promise<FormData> {
  const fd = new FormData();
  fd.append("title", form.value.title);
  fd.append("content", form.value.content);
  fd.append("is_draft", String(isDraft));

  if (isEdit.value) {
    fd.append("slug", route.params.slug as string);
  }

  if (form.value.tagNames.length) {
    form.value.tagNames.forEach((tag) => fd.append("tag_names", tag));
  } else if (isEdit.value) {
    fd.append("tag_names", "");
  }

  if (form.value.created_at) {
    fd.append("created_at", form.value.created_at);
  }

  if (form.value.cover) {
    fd.append("cover", form.value.cover);
  }

  return fd;
}

async function handleSaveDraft() {
  saving.value = true;
  try {
    const fd = await buildFormData(true);
    if (isEdit.value) {
      await updateArticle(route.params.slug as string, fd);
    } else {
      await createArticle(fd);
    }
    ElMessage.success("草稿已保存");
    router.push("/admin/articles");
  } catch {
    ElMessage.error("保存失败");
  } finally {
    saving.value = false;
  }
}

async function handlePublish() {
  publishing.value = true;
  try {
    const fd = await buildFormData(false);
    if (isEdit.value) {
      await updateArticle(route.params.slug as string, fd);
    } else {
      await createArticle(fd);
    }
    ElMessage.success(isEdit.value ? "文章已更新" : "文章已发布");
    router.push("/admin/articles");
  } catch {
    ElMessage.error(isEdit.value ? "更新失败" : "发布失败");
  } finally {
    publishing.value = false;
  }
}

onMounted(async () => {
  try {
    const tagsRes = await getTags({ page: 1, page_size: 100 });
    const tags = tagsRes.data.data?.tags;
    availableTags.value = (tags?.items || []).map(
      (tag: { name: string }) => tag.name,
    );
  } catch {
    availableTags.value = [];
  }

  if (isEdit.value) {
    loading.value = true;
    try {
      const res = await getAdminArticle(route.params.slug as string);
      const article = res.data.data || res.data;
      form.value.title = article.title || "";
      form.value.content = article.content || "";
      form.value.tagNames = Array.isArray(article.tags)
        ? article.tags.map((tag: string | { name: string }) =>
            typeof tag === "string" ? tag : tag.name,
          )
        : [];
      form.value.created_at = article.created_at
        ? article.created_at.slice(0, 19)
        : "";
      coverPreview.value = article.cover || "";
    } catch {
      ElMessage.error("获取文章详情失败");
    } finally {
      loading.value = false;
    }
  }
});
</script>

<style scoped>
.admin-article-edit {
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

.markdown-file-input {
  display: none;
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

.article-form {
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

.cover-area {
  display: flex;
  align-items: flex-start;
}

.cover-placeholder {
  width: 100%;
  aspect-ratio: 16 / 10;
  border: 2px dashed var(--color-border, #dcdfe6);
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s;
}

.cover-placeholder:hover {
  border-color: var(--color-heading, #42b883);
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-empty {
  width: 10dvw;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--color-background-mute, #fafbfc);
}

.cover-empty__icon {
  font-size: 32px;
  opacity: 0.6;
}

.cover-empty__text {
  font-size: 13px;
  color: #999;
}

.cover-upload-hidden {
  display: none;
}

:deep(.article-settings-drawer .el-drawer__body) {
  padding: 0;
}

:deep(.article-settings-modal) {
  background: rgba(0, 0, 0, 0.38);
}

@media (max-width: 640px) {
  .editor-header {
    gap: 8px;
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
}
</style>
