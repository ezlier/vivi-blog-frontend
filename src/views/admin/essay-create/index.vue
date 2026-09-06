<template>
  <div class="page admin-essay-create">
    <div class="editor-header">
      <el-button @click="router.push('/admin/essays')">返回列表</el-button>
      <h1>创建笔记</h1>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="essay-form"
      @submit.prevent
    >
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="form.title"
          maxlength="120"
          show-word-limit
          placeholder="请输入笔记标题"
        />
      </el-form-item>

      <el-form-item label="内容" prop="content">
        <MdEditor v-model="form.content" style="height: 62dvh" />
      </el-form-item>

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
        <p class="upload-tip">
          最多上传 6 张 JPG 或 PNG 图片，单张不超过 5MB。
        </p>
      </el-form-item>

      <div class="form-actions">
        <el-button @click="router.push('/admin/essays')">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          发布笔记
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  ElMessage,
  type FormInstance,
  type FormRules,
  type UploadFile,
} from "element-plus";
import MdEditor from "@/components/MdEditor.vue";
import { createEssay } from "@/api/essay";
import { useEssayStore } from "@/stores/essay";

const router = useRouter();
const essayStore = useEssayStore();
const formRef = ref<FormInstance>();
const saving = ref(false);

const form = ref({
  title: "",
  content: "",
});

const rules: FormRules = {
  title: [{ required: true, message: "请输入笔记标题", trigger: "blur" }],
  content: [{ required: true, message: "请输入笔记内容", trigger: "change" }],
};

const imageFiles = ref<UploadFile[]>([]);

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
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  const formData = new FormData();
  formData.append("title", form.value.title.trim());
  formData.append("content", form.value.content);
  formData.append("is_draft", "false");

  for (const file of imageFiles.value) {
    if (file.raw) {
      formData.append("imgs", file.raw);
    }
  }

  saving.value = true;
  try {
    await createEssay(formData);
    essayStore.clearCache();
    ElMessage.success("笔记已发布");
    await router.push("/admin/essays");
  } catch {
    ElMessage.error("保存笔记失败");
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.admin-essay-create {
  min-height: calc(100vh - 140px);
}

.editor-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.editor-header h1 {
  margin: 0;
}

.essay-form {
  max-width: 1100px;
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

.form-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}

@media (max-width: 640px) {
  .editor-header {
    gap: 10px;
  }

  .editor-header h1 {
    font-size: 22px;
  }

  .form-actions {
    justify-content: stretch;
  }

  .form-actions .el-button {
    flex: 1;
  }
}
</style>
