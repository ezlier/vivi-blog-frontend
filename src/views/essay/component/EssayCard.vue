<template>
  <article class="essay-card" :class="{ 'essay-card--expanded': expanded }">
    <div class="essay-card__summary">
      <button v-if="firstImage" class="essay-card__cover essay-card__cover-button" type="button"
        :aria-label="`放大图片：${essay.title}`" @click="openPreview(firstImage)">
        <img :src="firstImage" :alt="essay.title" class="essay-card__cover-image" />
      </button>
      <div v-else class="essay-card__cover essay-card__cover--placeholder" aria-label="暂无图片">
        <span>暂无图片</span>
      </div>

      <div class="essay-card__summary-content">
        <h2 class="essay-card__title">{{ essay.title }}</h2>
        <p class="essay-card__excerpt">{{ excerpt || "暂无内容" }}</p>
        <time class="essay-card__date essay-card__date--summary" :datetime="essay.created_at">
          {{ formatAdminDateTime(essay.created_at) }}
        </time>
      </div>

      <button class="essay-card__toggle" type="button" :aria-expanded="expanded"
        :aria-label="expanded ? '收起笔记' : '展开笔记'" @click="toggleExpanded">
        <span aria-hidden="true">&lt;</span>
      </button>
    </div>

    <div class="essay-card__expanded-shell" :style="{ height: expanded ? `${expandedHeight}px` : '0px' }"
      :aria-hidden="!expanded">
      <div ref="expandedContent" class="essay-card__expanded-content">
        <p class="essay-card__content">{{ essay.content || "暂无内容" }}</p>

        <div v-if="essay.imgs.length" class="essay-card__images">
          <button v-for="(image, index) in essay.imgs" :key="`${image}-${index}`" class="essay-card__image-button"
            type="button" :aria-label="`放大第 ${index + 1} 张图片`" @click="openPreview(image)">
            <img :src="image" :alt="`${essay.title} 图片 ${index + 1}`" class="essay-card__image" />
          </button>
        </div>
        <div v-else class="essay-card__images-placeholder">暂无图片</div>

        <time class="essay-card__date essay-card__date--expanded" :datetime="essay.created_at">
          {{ formatAdminDateTime(essay.created_at) }}
        </time>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="essay-image-preview">
        <div v-if="previewImage" class="essay-image-preview" role="dialog" aria-modal="true" aria-label="图片预览"
          @click="closePreview">
          <img :src="previewImage" :alt="essay.title" @click="closePreview" />
        </div>
      </Transition>
    </Teleport>
  </article>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import type { Essay } from "@/types";
import { formatAdminDateTime } from "@/utils/date";

defineOptions({ name: "EssayCard" });

const props = defineProps<{
  essay: Essay;
}>();

const expanded = ref(false);
const expandedHeight = ref(0);
const expandedContent = ref<HTMLElement | null>(null);
const previewImage = ref<string | null>(null);
let resizeObserver: ResizeObserver | null = null;

const firstImage = computed(() => props.essay.imgs[0] ?? "");
const excerpt = computed(() => {
  const text = props.essay.content.trim().replace(/\s+/g, " ");
  return text.length > 90 ? `${text.slice(0, 90)}…` : text;
});

function updateExpandedHeight() {
  expandedHeight.value = expandedContent.value?.scrollHeight ?? 0;
}

async function toggleExpanded() {
  expanded.value = !expanded.value;
  await nextTick();
  updateExpandedHeight();
}

function openPreview(image: string) {
  previewImage.value = image;
}

function closePreview() {
  previewImage.value = null;
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") closePreview();
}

watch(
  () => props.essay,
  async () => {
    expanded.value = false;
    await nextTick();
    updateExpandedHeight();
  },
);

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
  resizeObserver = new ResizeObserver(updateExpandedHeight);
  if (expandedContent.value) resizeObserver.observe(expandedContent.value);
  updateExpandedHeight();
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
  resizeObserver?.disconnect();
});
</script>

<style scoped>
.essay-card {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-background);
  box-shadow: var(--box-shadow);
  transition:
    box-shadow 0.3s ease,
    border-color 0.3s ease;
}

.essay-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--box-shadow-hover);
}

.essay-card__summary {
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr) 48px;
  transition:
    grid-template-columns 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    min-height 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.essay-card__cover {
  position: relative;
  min-width: 0;
  /* min-height: 128px; */
  overflow: hidden;
  border: 0;
  border-right: 1px solid var(--color-border);
  border-radius: 14px 0 0 14px;
  background: var(--color-background-mute);
  opacity: 1;
  transition:
    min-height 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.25s ease;
}

.essay-card__cover::after {
  position: absolute;
  top: -18px;
  right: -18px;
  bottom: -18px;
  width: 38px;
  border-right: 1px solid var(--color-border-hover);
  background: var(--color-background);
  content: "";
  transform: skewX(-22deg);
  pointer-events: none;
}

.essay-card__cover-button {
  display: block;
  width: 100%;
  padding: 0;
  cursor: zoom-in;
}

.essay-card__cover-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.essay-card__cover-button:hover .essay-card__cover-image {
  transform: scale(1.05);
}

.essay-card__cover--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-mute);
  font-size: 13px;
}

.essay-card__summary-content {
  display: flex;
  min-width: 0;
  padding: 20px 24px 16px;
  flex-direction: column;
  transition: padding 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.essay-card__title {
  margin: 0 0 8px;
  overflow: hidden;
  color: var(--color-heading);
  font-size: 18px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.essay-card__excerpt {
  display: -webkit-box;
  margin: 0;
  max-height: 3.4em;
  overflow: hidden;
  color: var(--color-text);
  font-size: 14px;
  line-height: 1.7;
  opacity: 1;
  transition:
    max-height 0.3s ease,
    margin 0.3s ease,
    opacity 0.2s ease;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.essay-card__date {
  display: block;
  color: var(--color-text-mute);
  font-size: 12px;
}

.essay-card__date--summary {
  max-height: 32px;
  margin-top: auto;
  padding-top: 8px;
  overflow: hidden;
  opacity: 1;
  transition:
    max-height 0.25s ease,
    padding 0.25s ease,
    opacity 0.2s ease;
}

.essay-card__date--expanded {
  margin-top: 14px;
  text-align: right;
}

.essay-card__toggle {
  align-self: start;
  justify-self: center;
  width: 34px;
  height: 62px;
  margin-top: 33px;
  border: 1px solid var(--color-heading);
  border-radius: 6px;
  background: transparent;
  color: var(--color-heading);
  cursor: pointer;
  font-family: inherit;
  font-size: 20px;
  line-height: 1;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    width 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    height 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    margin 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.essay-card__toggle span {
  display: block;
  transition: transform 0.3s ease;
}

.essay-card__toggle:hover {
  background: var(--color-heading);
  color: #fff;
}

.essay-card--expanded .essay-card__summary {
  grid-template-columns: 0 minmax(0, 1fr) 42px;
  min-height: 76px;
}

.essay-card--expanded .essay-card__cover {
  min-height: 0;
  opacity: 0;
  pointer-events: none;
}

.essay-card--expanded .essay-card__excerpt {
  max-height: 0;
  margin: 0;
  opacity: 0;
}

.essay-card--expanded .essay-card__date--summary {
  max-height: 0;
  padding-top: 0;
  opacity: 0;
}

.essay-card--expanded .essay-card__expanded-content {
  padding-left: 24px;
}

.essay-card--expanded .essay-card__toggle {
  width: 38px;
  height: 38px;
  margin-top: 19px;
}

.essay-card--expanded .essay-card__toggle span {
  transform: rotate(-90deg);
}

.essay-card__expanded-shell {
  overflow: hidden;
  transition: height 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.essay-card__expanded-content {
  padding: 0 24px 24px 156px;
}

.essay-card__content {
  margin: 0;
  padding: 18px 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-mute);
  color: var(--color-text);
  font-size: 15px;
  line-height: 1.9;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.essay-card__images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.essay-card__image-button {
  min-width: 0;
  height: 100px;
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-mute);
  cursor: zoom-in;
}

.essay-card__image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.essay-card__image-button:hover .essay-card__image {
  transform: scale(1.05);
}

.essay-card__images-placeholder {
  margin-top: 10px;
  padding: 24px;
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  color: var(--color-text-mute);
  text-align: center;
}

.essay-image-preview {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.72);
  cursor: zoom-out;
}

.essay-image-preview img {
  max-width: min(92vw, 1200px);
  max-height: 92vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.35);
}

.essay-image-preview-enter-active,
.essay-image-preview-leave-active {
  transition: opacity 0.25s ease;
}

.essay-image-preview-enter-from,
.essay-image-preview-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .essay-card__summary {
    grid-template-columns: 92px minmax(0, 1fr) 42px;

  }

  .essay-card__cover,
  .essay-card__cover-image {}

  .essay-card__toggle {
    margin-top: 25px;
  }

  .essay-card--expanded .essay-card__summary {
    grid-template-columns: 0 minmax(0, 1fr) 38px;
    min-height: 66px;
  }

  .essay-card--expanded .essay-card__toggle {
    width: 34px;
    height: 34px;
    margin-top: 16px;
  }

  .essay-card__summary-content {
    padding: 16px 12px;
  }

  .essay-card__title {
    font-size: 16px;
  }

  .essay-card__expanded-content,
  .essay-card--expanded .essay-card__expanded-content {
    padding: 0 16px 18px;
  }
}
</style>
