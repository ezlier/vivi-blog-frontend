<template>
  <section class="essay-page">
    <div
      v-if="essayStore.loading && !essayStore.essays.length"
      class="essay-page__loading"
    >
      <span class="loading-spinner" aria-label="正在加载"></span>
    </div>

    <div v-else-if="!essayStore.essays.length" class="essay-page__empty">
      {{ essayStore.error || "暂无笔记" }}
    </div>

    <div v-else class="essay-list">
      <EssayCard
        v-for="essay in essayStore.essays"
        :key="essay.id ?? essay.slug"
        :essay="essay"
      />
    </div>

    <Pagination
      v-if="essayStore.total > pageSize"
      :current="currentPage"
      :total="essayStore.total"
      :page-size="pageSize"
      @change="onPageChange"
    />

    <p
      v-if="essayStore.error && essayStore.essays.length"
      class="essay-page__error"
    >
      {{ essayStore.error }}
    </p>

    <div
      v-if="essayStore.loading && essayStore.essays.length"
      class="essay-page__loading essay-page__loading--paging"
    >
      <span class="loading-spinner" aria-label="正在加载"></span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import Pagination from "@/components/Pagination.vue";
import { useEssayStore } from "@/stores/essay";
import EssayCard from "./component/EssayCard.vue";

const essayStore = useEssayStore();
const pageSize = 10;
const currentPage = computed(() => essayStore.currentPage);

async function loadPage(page: number) {
  try {
    await essayStore.fetchPage(page, pageSize);
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch {
    // 错误信息由 store 保存并在页面中展示。
  }
}

function onPageChange(page: number) {
  void loadPage(page);
}

onMounted(() => {
  void loadPage(currentPage.value);
});
</script>

<style scoped>
.essay-page {
  width: 100%;
}

.essay-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.essay-page__loading {
  display: flex;
  justify-content: center;
  padding: 64px 0;
}

.essay-page__loading--paging {
  padding: 28px 0 0;
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-heading);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.essay-page__empty {
  padding: 64px 0;
  color: var(--color-text-mute);
  text-align: center;
}

.essay-page__error {
  margin: 16px 0 0;
  color: var(--color-heading);
  font-size: 13px;
  text-align: center;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
