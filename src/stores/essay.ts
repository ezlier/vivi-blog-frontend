import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { getEssays } from "@/api/essay";
import type { Essay } from "@/types";

interface EssayPagePayload {
  items?: unknown;
  total?: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
}

interface CachedEssayPage {
  items: Essay[];
  total: number;
}

function normalizeEssay(value: unknown, index: number): Essay {
  const item = (value ?? {}) as Record<string, unknown>;
  const imgs = Array.isArray(item.imgs)
    ? item.imgs.filter(
        (img): img is string => typeof img === "string" && img.length > 0,
      )
    : [];

  return {
    id: typeof item.id === "number" ? item.id : undefined,
    title: typeof item.title === "string" ? item.title : `笔记 ${index + 1}`,
    slug: typeof item.slug === "string" ? item.slug : `essay-${index + 1}`,
    content: typeof item.content === "string" ? item.content : "",
    imgs,
    created_at:
      typeof item.created_at === "string"
        ? item.created_at
        : new Date().toISOString(),
    updated_at:
      typeof item.updated_at === "string" ? item.updated_at : undefined,
  };
}

export const useEssayStore = defineStore("essay", () => {
  const essays = ref<Essay[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const error = ref("");
  const currentPage = ref(1);
  const pageSize = ref(10);

  const pageCache = new Map<string, CachedEssayPage>();
  const pendingRequests = new Map<string, Promise<void>>();

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(total.value / pageSize.value)),
  );

  function getCacheKey(page: number, size: number) {
    return `${page}:${size}`;
  }

  function applyPage(page: number, size: number, cached: CachedEssayPage) {
    essays.value = cached.items;
    total.value = cached.total;
    currentPage.value = page;
    pageSize.value = size;
  }

  async function fetchPage(
    page = 1,
    size = 10,
    options: { force?: boolean } = {},
  ) {
    const cacheKey = getCacheKey(page, size);
    const cached = pageCache.get(cacheKey);

    if (cached && !options.force) {
      applyPage(page, size, cached);
      return;
    }

    const pending = pendingRequests.get(cacheKey);
    if (pending) {
      await pending;
      const refreshed = pageCache.get(cacheKey);
      if (refreshed) applyPage(page, size, refreshed);
      return;
    }

    const request = (async () => {
      loading.value = true;
      error.value = "";

      try {
        const response = await getEssays({ page, page_size: size });
        const payload = (response.data?.data?.essayList ??
          {}) as EssayPagePayload;
        const rawItems = Array.isArray(payload.items) ? payload.items : [];
        const cachedPage: CachedEssayPage = {
          items: rawItems.map((item, index) => normalizeEssay(item, index)),
          total:
            typeof payload.total === "number" ? payload.total : rawItems.length,
        };

        pageCache.set(cacheKey, cachedPage);
        applyPage(page, size, cachedPage);
      } catch (requestError) {
        error.value =
          requestError instanceof Error ? requestError.message : "获取笔记失败";
        throw requestError;
      } finally {
        loading.value = false;
      }
    })();

    pendingRequests.set(cacheKey, request);

    try {
      await request;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  }

  function clearCache() {
    pageCache.clear();
  }

  return {
    essays,
    total,
    loading,
    error,
    currentPage,
    pageSize,
    totalPages,
    fetchPage,
    clearCache,
  };
});
