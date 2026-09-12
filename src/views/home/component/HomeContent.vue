<script setup lang="ts">
import type { Article } from "@/stores/article";

defineProps<{
  aboutHtml: string;
  article: Article | null;
  loading: boolean;
}>();

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
</script>

<template>
  <section id="about" class="home-content" aria-label="主页内容">
    <div class="content-grid">
      <article class="about-panel">
        <div class="section-heading">
          <span class="section-heading__eyebrow">ABOUT</span>
          <h2>关于</h2>
        </div>
        <div v-if="aboutHtml" class="about-copy" v-html="aboutHtml" />
        <p v-else class="empty-copy">在这里记录一些关于我和这个小站的故事。</p>
      </article>

      <section class="latest-panel" aria-labelledby="latest-title">
        <div class="section-heading">
          <span class="section-heading__eyebrow">TEXT</span>
          <h2 id="latest-title">最新文章</h2>
        </div>

        <div v-if="loading" class="article-placeholder">
          <span class="placeholder-line placeholder-line--long" />
          <span class="placeholder-line placeholder-line--short" />
        </div>

        <RouterLink v-else-if="article" :to="`/article/${article.slug}`" class="latest-article">
          <div class="latest-article__content">
            <time :datetime="article.created_at">{{
              formatDate(article.created_time)
              }}</time>
            <h3>{{ article.title }}</h3>
            <span class="latest-article__read">阅读文章 <span aria-hidden="true">↗</span></span>
          </div>
          <div class="latest-article__cover" :class="{ 'latest-article__cover--empty': !article.cover }">
            <img v-if="article.cover" :src="article.cover" :alt="article.title" loading="lazy" />
            <span v-else aria-hidden="true">V</span>
          </div>
        </RouterLink>

        <p v-else class="empty-copy">还没有发布文章。</p>
      </section>
    </div>
  </section>
</template>

<style scoped>
.home-content {
  position: relative;
  z-index: 2;
  min-height: 70dvh;
  padding: clamp(78px, 11vw, 144px) clamp(22px, 7vw, 110px) 140px;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  width: min(100%, 1120px);
  margin: 0 auto;
}

.about-panel,
.latest-panel {
  min-width: 0;
}

.about-panel {
  padding-right: clamp(28px, 5vw, 70px);
  border-right: 1px solid var(--home-line);
}

.latest-panel {
  padding-top: 2px;
  padding-left: clamp(28px, 5vw, 70px);
}

.section-heading {
  margin-bottom: 36px;
}

.section-heading__eyebrow {
  display: block;
  margin-bottom: 5px;
  color: var(--home-muted);
  font-family: Anurati, SFMono-Regular, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
}

.section-heading h2 {
  margin: 0;
  color: var(--home-text);
  font-size: clamp(22px, 3vw, 34px);
  font-weight: 500;
  line-height: 1.2;
}

.about-copy {
  color: var(--home-muted);
  font-size: 15px;
  line-height: 2;
}

.about-copy :deep(p) {
  margin: 0 0 16px;
}

.about-copy :deep(p:last-child) {
  margin-bottom: 0;
}

.about-copy :deep(a) {
  color: var(--home-text);
  text-underline-offset: 4px;
}

.latest-article {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(130px, 34%);
  min-height: 174px;
  overflow: hidden;
  border: 1px solid var(--home-line);
  color: var(--home-text);
  text-decoration: none;
  transition:
    border-color 180ms ease,
    transform 180ms ease,
    box-shadow 180ms ease;
}

.latest-article:hover {
  border-color: var(--home-text);
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.08);
  transform: translateY(-3px);
}

.latest-article__content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  padding: 22px 24px;
}

.latest-article__content time {
  color: var(--home-muted);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
}

.latest-article h3 {
  display: -webkit-box;
  overflow: hidden;
  margin: auto 0 18px;
  font-size: clamp(18px, 2.2vw, 25px);
  font-weight: 500;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.latest-article__read {
  color: var(--home-muted);
  font-size: 12px;
}

.latest-article__read span {
  display: inline-block;
  margin-left: 5px;
  transition: transform 180ms ease;
}

.latest-article:hover .latest-article__read span {
  transform: translate(2px, -2px);
}

.latest-article__cover {
  position: relative;
  overflow: hidden;
  background: #252528;
}

.latest-article__cover::after {
  position: absolute;
  inset: 0;
  content: "";
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.12), transparent 45%);
}

.latest-article__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 400ms ease;
}

.latest-article:hover .latest-article__cover img {
  transform: scale(1.06);
}

.latest-article__cover--empty {
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 50% 42%,
      rgba(255, 183, 144, 0.8),
      transparent 18%),
    linear-gradient(135deg, #392e2d, #161619);
}

.latest-article__cover--empty span {
  color: rgba(255, 229, 215, 0.76);
  font-size: 40px;
  font-weight: 500;
}

.empty-copy {
  margin: 0;
  color: var(--home-muted);
  font-size: 14px;
}

.article-placeholder {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 26px 0;
}

.placeholder-line {
  display: block;
  height: 14px;
  background: var(--home-faint);
  animation: placeholder-pulse 1.2s ease-in-out infinite alternate;
}

.placeholder-line--long {
  width: 76%;
}

.placeholder-line--short {
  width: 44%;
}

@keyframes placeholder-pulse {
  from {
    opacity: 0.42;
  }

  to {
    opacity: 0.82;
  }
}

@media (max-width: 760px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 64px;
  }

  .about-panel {
    padding-right: 0;
    padding-bottom: 58px;
    border-right: 0;
    border-bottom: 1px solid var(--home-line);
  }

  .latest-panel {
    padding-top: 0;
    padding-left: 0;
  }

  .section-heading {
    margin-bottom: 25px;
  }

  .latest-article {
    grid-template-columns: minmax(0, 1fr) 34%;
    min-height: 148px;
  }

  .latest-article__content {
    padding: 18px 16px;
  }

  .latest-article h3 {
    margin-top: 26px;
    margin-bottom: 12px;
    font-size: 17px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .placeholder-line {
    animation: none;
  }
}
</style>
