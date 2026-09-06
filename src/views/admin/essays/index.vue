<template>
  <div class="page admin-essay-list">
    <div class="page-header">
      <h1>笔记管理</h1>
      <div class="page-header__actions">
        <RouterLink to="/admin/essay/create" class="create-link">
          <el-button type="primary">创建笔记</el-button>
        </RouterLink>
        <el-button
          type="danger"
          :disabled="selectedSlugs.length === 0"
          @click="handleBatchDelete"
        >
          批量删除 ({{ selectedSlugs.length }})
        </el-button>
      </div>
    </div>

    <el-table
      :data="essayStore.essays"
      stripe
      v-loading="essayStore.loading"
      empty-text="暂无笔记"
      @selection-change="onSelectionChange"
    >
      <el-table-column type="selection" width="44" />
      <el-table-column
        prop="title"
        label="标题"
        min-width="180"
        show-overflow-tooltip
      />
      <el-table-column label="内容摘要" min-width="280" show-overflow-tooltip>
        <template #default="{ row }">
          {{ previewContent(row.content) }}
        </template>
      </el-table-column>
      <el-table-column label="图片" width="80" align="center">
        <template #default="{ row }"> {{ row.imgs.length }} 张 </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="danger" @click="handleDelete(row.slug)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <Pagination
      v-if="essayStore.total > pageSize"
      :current="page"
      :total="essayStore.total"
      :page-size="pageSize"
      @change="onPageChange"
    />

    <p v-if="essayStore.error" class="request-error">{{ essayStore.error }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Pagination from "@/components/Pagination.vue";
import { batchDeleteEssays } from "@/api/essay";
import { useEssayStore } from "@/stores/essay";
import type { Essay } from "@/types";

const essayStore = useEssayStore();
const page = ref(essayStore.currentPage);
const pageSize = 10;
const selectedSlugs = ref<string[]>([]);

function onSelectionChange(rows: Essay[]) {
  selectedSlugs.value = rows.map((row) => row.slug);
}

function previewContent(content: string) {
  const text = content.replace(/\s+/g, " ").trim();
  return text.length > 100 ? `${text.slice(0, 100)}…` : text || "暂无内容";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

async function loadPage(targetPage: number) {
  try {
    await essayStore.fetchPage(targetPage, pageSize);
    page.value = essayStore.currentPage;
    selectedSlugs.value = [];
  } catch {
    // 错误信息由 store 保存并展示在表格下方。
  }
}

async function deleteSelected(slugs: string[]) {
  await batchDeleteEssays(slugs);
  essayStore.clearCache();

  const remainingTotal = Math.max(0, essayStore.total - slugs.length);
  const lastPage = Math.max(1, Math.ceil(remainingTotal / pageSize));
  await loadPage(Math.min(page.value, lastPage));
}

async function handleDelete(slug: string) {
  try {
    await ElMessageBox.confirm("确定删除该笔记？", "提示", { type: "warning" });
    await deleteSelected([slug]);
    ElMessage.success("删除成功");
  } catch (error) {
    if (error === "cancel" || error === "close") return;
    if (error instanceof Error) {
      ElMessage.error("删除失败");
    }
  }
}

async function handleBatchDelete() {
  const slugs = [...selectedSlugs.value];
  if (!slugs.length) return;

  try {
    await ElMessageBox.confirm(
      `确定删除选中的 ${slugs.length} 篇笔记？`,
      "批量删除",
      { type: "warning" },
    );
    await deleteSelected(slugs);
    ElMessage.success("批量删除成功");
  } catch (error) {
    if (error === "cancel" || error === "close") return;
    if (error instanceof Error) {
      ElMessage.error("批量删除失败");
    }
  }
}

function onPageChange(targetPage: number) {
  void loadPage(targetPage);
}

onMounted(() => {
  void loadPage(page.value);
});
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.page-header h1 {
  margin: 0;
}

.page-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.create-link {
  text-decoration: none;
}

.request-error {
  margin: 16px 0 0;
  color: var(--color-heading);
  font-size: 13px;
  text-align: center;
}

@media (max-width: 640px) {
  .page-header__actions {
    width: 100%;
  }

  .page-header__actions .el-button,
  .create-link {
    flex: 1;
  }

  .create-link .el-button {
    width: 100%;
  }
}
</style>
