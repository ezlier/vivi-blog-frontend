<script setup lang="ts">
import ThemeButton from "@/components/ThemeButton.vue";
import HomeNavigation from "./HomeNavigation.vue";

defineProps<{
  siteName: string;
  name: string;
  avatar: string | null;
  currentTime: string;
  currentDateTime: string;
  typingText: string;
  navigationFloating: boolean;
}>();
</script>

<template>
  <section id="top" class="home-hero" aria-label="个人信息">
    <div class="hero-header">
      <span class="hero-brand">{{ siteName }}</span>
      <div class="hero-header__tools">
        <time class="hero-time" :datetime="currentDateTime">{{
          currentTime
        }}</time>
        <ThemeButton title="切换主题" />
      </div>
    </div>

    <div class="hero-content">
      <div class="avatar-frame">
        <img v-if="avatar" :src="avatar" :alt="name || 'avatar'" />
        <span v-else>{{ name.slice(0, 1) }}</span>
      </div>
      <p class="hero-greeting">
        你好，我是 <strong>{{ name }}</strong>
      </p>
    </div>

    <p class="typing-line" aria-live="polite">
      <span>{{ typingText }}</span
      ><span class="typing-cursor" aria-hidden="true" />
    </p>

    <HomeNavigation :floating="navigationFloating" />
  </section>
</template>

<style scoped>
.home-hero {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100svh;
  padding: 28px clamp(22px, 5vw, 80px) 50px;
}

.hero-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(100%, 1240px);
  margin: 0 auto;
}

.hero-brand,
.hero-time {
  color: var(--home-muted);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero-header__tools {
  display: flex;
  align-items: center;
  gap: 18px;
}

.hero-header__tools :deep(.theme-btn) {
  width: 38px;
  height: 38px;
  border: 1px solid var(--home-line);
  border-radius: 50%;
  background: transparent;
  color: var(--home-text);
}

.hero-header__tools :deep(.theme-btn:hover) {
  background: var(--home-faint);
}

.hero-header__tools :deep(.theme-btn__icon) {
  width: 17px;
  height: 17px;
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
  width: min(100%, 800px);
  margin: auto auto 0;
  text-align: center;
  transform: translateY(-3vh);
}

.avatar-frame {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: clamp(128px, 19vw, 220px);
  aspect-ratio: 1;
  overflow: hidden;
  border: 1px solid var(--home-line);
  border-radius: 50%;
  background: var(--home-bg);
  box-shadow:
    0 0 0 7px color-mix(in srgb, var(--home-bg) 72%, transparent),
    0 0 28px rgba(255, 174, 145, 0.14),
    0 0 64px rgba(255, 174, 145, 0.08);
  color: var(--home-text);
  font-size: clamp(42px, 5vw, 70px);
  transition: box-shadow 300ms ease;
}

.home-screen--dark .avatar-frame {
  box-shadow:
    0 0 0 7px rgba(28, 28, 30, 0.75),
    0 0 30px rgba(255, 169, 139, 0.2),
    0 0 74px rgba(255, 169, 139, 0.1);
}

.avatar-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-greeting {
  margin: 0;
  color: var(--home-muted);
  font-size: clamp(17px, 2vw, 24px);
  letter-spacing: 0.02em;
}

.hero-greeting strong {
  color: var(--home-text);
  font-weight: 500;
}

.typing-line {
  display: flex;
  align-items: center;
  align-self: center;
  min-height: 28px;
  margin: 0 auto 14px;
  color: var(--home-muted);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 13px;
  letter-spacing: 0.08em;
}

.typing-cursor {
  width: 1px;
  height: 17px;
  margin-left: 7px;
  background: currentColor;
  animation: cursor-blink 0.9s steps(2, start) infinite;
}

@keyframes cursor-blink {
  50% {
    opacity: 0;
  }
}

@media (max-width: 760px) {
  .home-hero {
    padding: 22px 18px 40px;
  }

  .hero-brand,
  .hero-time {
    font-size: 9px;
    letter-spacing: 0.1em;
  }

  .hero-header__tools {
    gap: 10px;
  }

  .hero-header__tools :deep(.theme-btn) {
    width: 34px;
    height: 34px;
  }

  .hero-content {
    gap: 24px;
    width: 100%;
    transform: translateY(-2vh);
  }

  .hero-greeting {
    font-size: 17px;
  }

  .typing-line {
    margin-bottom: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .typing-cursor {
    animation: none;
  }
}
</style>
