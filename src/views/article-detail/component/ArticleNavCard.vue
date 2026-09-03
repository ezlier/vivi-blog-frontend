<template>
  <nav v-if="headings.length" class="article-nav-card">
    <h3 class="article-nav-card__title">目录</h3>
    <ul class="article-nav-card__list">
      <li
        v-for="heading in headings"
        :key="heading.id"
        class="article-nav-card__item"
        :class="[
          `article-nav-card__item--${heading.level}`,
          { 'article-nav-card__item--active': activeId === heading.id },
        ]"
      >
        <a
          :href="`#${heading.id}`"
          :title="heading.text"
          @click.prevent="scrollTo(heading.id)"
        >
          {{ heading.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { extractMarkdownHeadings } from "@/utils/markdownHeadings";

const props = defineProps<{
  content: string;
}>();

const headings = computed(() => extractMarkdownHeadings(props.content));
const activeId = ref("");

function scrollTo(id: string) {
  const element = document.getElementById(id);
  if (!element) return;

  element.scrollIntoView({ behavior: "smooth", block: "start" });
  activeId.value = id;
}

function onScroll() {
  if (!headings.value.length) {
    activeId.value = "";
    return;
  }

  for (let index = headings.value.length - 1; index >= 0; index--) {
    const heading = headings.value[index];
    if (!heading) continue;

    const element = document.getElementById(heading.id);
    if (element && element.getBoundingClientRect().top <= 120) {
      activeId.value = heading.id;
      return;
    }
  }

  const firstHeading = headings.value[0];
  activeId.value = firstHeading?.id ?? "";
}

watch(
  headings,
  (nextHeadings) => {
    activeId.value = nextHeadings[0]?.id ?? "";
    onScroll();
  },
  { immediate: true },
);

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<style scoped>
.article-nav-card {
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
}

.article-nav-card__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-heading);
  margin: 0 0 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border);
}

.article-nav-card__list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 40vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.article-nav-card__list::-webkit-scrollbar {
  width: 4px;
}

.article-nav-card__list::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}

.article-nav-card__list::-webkit-scrollbar-track {
  background: transparent;
}

.article-nav-card__item {
  border-left: 2px solid transparent;
  transition: border-color 0.2s;
  color: var(--color-text);
}

.article-nav-card__item--active {
  border-left-color: var(--color-heading);
}

.article-nav-card__item a {
  display: block;
  padding: 6px 12px;
  font-size: 13px;
  color: var(--color-text-mute);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s;
}

.article-nav-card__item--active a {
  color: var(--color-heading);
  font-weight: 600;
}

.article-nav-card__item a:hover {
  color: var(--color-heading);
}

.article-nav-card__item--2 a {
  padding-left: 24px;
}

.article-nav-card__item--3 a {
  padding-left: 36px;
}
</style>
