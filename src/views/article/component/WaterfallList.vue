<template>
  <div class="waterfall waterfall--desktop">
    <div v-for="(column, columnIndex) in columns" :key="columnIndex" class="waterfall__column">
      <div v-for="item in column" :key="item.article.slug" class="waterfall__item">
        <ArticleCard
          :article="item.article"
          :style="{ animationDelay: `${item.index * 0.06}s` }"
        />
      </div>
    </div>
  </div>

  <div class="waterfall waterfall--mobile">
    <div v-for="item in indexedArticles" :key="item.article.slug" class="waterfall__item">
      <ArticleCard
        :article="item.article"
        :style="{ animationDelay: `${item.index * 0.06}s` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ArticleCard from '@/views/article/component/ArticleCard.vue'
import type { Article } from '@/stores/article'

const props = defineProps<{
  articles: Article[]
}>()

const visibleArticles = computed(() => props.articles.slice(0, 10))
const indexedArticles = computed(() =>
  visibleArticles.value.map((article, index) => ({ article, index })),
)

const columns = computed(() => {
  const items = indexedArticles.value
  const left = items.filter((_, index) => index % 2 === 0)
  const right = items.filter((_, index) => index % 2 === 1)

  return [left, right]
})
</script>

<style scoped>
.waterfall {
  width: 100%;
  display: flex;
  gap: 20px;
}

.waterfall__column {
  display: flex;
  flex: 1 1 0;
  min-width: 0;
  flex-direction: column;
  gap: 20px;
}

.waterfall__item {
  width: 100%;
}

.waterfall--mobile {
  display: none;
}

@media (max-width: 768px) {
  .waterfall--desktop {
    display: none;
  }

  .waterfall--mobile {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .waterfall--mobile .waterfall__item {
    width: 100%;
  }
}
</style>
