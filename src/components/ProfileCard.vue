<template>
  <div class="profile-card">
    <div class="profile-card__top">
      <div class="profile-card__identity">
        <RouterLink to="/about" class="profile-card__avatar-link">
          <img
            v-if="ui.webSetting?.name_avatar"
            :src="ui.webSetting.name_avatar"
            :alt="ui.webSetting?.name || '博主'"
            class="profile-card__avatar"
          />
          <span v-else class="profile-card__avatar-placeholder">
            {{ (ui.webSetting?.name || "B")[0] }}
          </span>
        </RouterLink>
        <RouterLink to="/about" class="profile-card__name">
          {{ ui.webSetting?.name || "博主" }}
        </RouterLink>
      </div>

      <div
        class="profile-card__image-placeholder"
        aria-label="图片占位符"
      >
        <img
            v-if="ui.webSetting?.name_avatar"
            :src="ui.webSetting.name_avatar"
            :alt="ui.webSetting?.name || '博主'"
            class="profile-card__avatar"
          />
      </div>
    </div>

    <div class="profile-card__stats" aria-label="博客统计">
      <div class="profile-card__stat">
        <span class="profile-card__stat-num">{{
          articleStore.total || articleStore.articleList.length
        }}</span>
        <span class="profile-card__stat-label">文章</span>
      </div>

      <span class="profile-card__stats-divider" aria-hidden="true"></span>

      <div class="profile-card__stat">
        <span class="profile-card__stat-num">{{
          articleStore.tags.length
        }}</span>
        <span class="profile-card__stat-label">标签</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from "@/stores/ui";
import { useArticleStore } from "@/stores/article";

const ui = useUiStore();
const articleStore = useArticleStore();
</script>

<style scoped>
.profile-card {
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-xs);
  background: var(--color-background);
  color: var(--color-text);
}

.profile-card__top {
  display: grid;
  grid-template-columns: minmax(88px, 0.8fr) minmax(120px, 1.2fr);
  align-items: center;
  gap: 18px;
  padding: 0 0 20px;
}

.profile-card__identity {
  display: flex;
  min-width: 0;
  align-items: center;
  flex-direction: column;
  gap: 8px;
}

.profile-card__avatar-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  overflow: hidden;
  border: 1px solid var(--color-heading);
  border-radius: 50%;
  background: var(--color-background-mute);
  box-shadow: 0 8px 20px rgba(215, 109, 137, 0.12);
  transition:
    transform 0.35s ease,
    box-shadow 0.35s ease;
}

.profile-card__avatar-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(215, 109, 137, 0.2);
}

.profile-card__avatar {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.profile-card__avatar-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--color-heading);
  font-size: 26px;
  font-weight: 700;
}

.profile-card__name {
  max-width: 100%;
  overflow: hidden;
  color: var(--color-heading);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

.profile-card__name:hover {
  opacity: 0.7;
}

.profile-card__image-placeholder {
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid var(--color-border);
  background: transparent;
}

.profile-card__stats {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 1px minmax(0, 1fr);
  align-items: center;
  min-height: 58px;
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
}

.profile-card__stat {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 2px;
}

.profile-card__stats-divider {
  width: 1px;
  height: 52px;
  background: var(--color-border);
}

.profile-card__stat-num {
  color: var(--color-text);
  font-size: 18px;
  line-height: 1.2;
  font-weight: 800;
}

.profile-card__stat-label {
  color: var(--color-text-mute);
  font-size: 12px;
  line-height: 1.4;
}

@media (max-width: 420px) {
  .profile-card__top {
    grid-template-columns: minmax(76px, 0.8fr) minmax(100px, 1.2fr);
    gap: 12px;
  }

  .profile-card__avatar-link {
    width: 76px;
    height: 76px;
  }
}
</style>
