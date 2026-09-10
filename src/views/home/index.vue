<template>
  <main class="home-screen" :class="{ 'home-screen--dark': ui.isDark }">
    <HomeAtmosphere :dark="ui.isDark" />
    <HomeHero
      :site-name="ui.webSetting?.web_name || 'Vivi Blog'"
      :name="ui.webSetting?.name || 'Vivi'"
      :avatar="ui.webSetting?.name_avatar || null"
      :current-time="currentTime"
      :current-date-time="currentDateTime"
      :typing-text="typingText"
      :navigation-floating="isNavigationFloating"
    />
    <HomeContent
      :about-html="aboutHtml"
      :article="latestArticle"
      :loading="articleStore.loading"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import MarkdownIt from "markdown-it";
import { useArticleStore } from "@/stores/article";
import { useUiStore } from "@/stores/ui";
import HomeAtmosphere from "./component/HomeAtmosphere.vue";
import HomeContent from "./component/HomeContent.vue";
import HomeHero from "./component/HomeHero.vue";

const ui = useUiStore();
const articleStore = useArticleStore();
const isNavigationFloating = ref(false);
const currentTime = ref("");
const currentDateTime = ref("");
const typingText = ref("");
let clockTimer: ReturnType<typeof setInterval> | undefined;
let typingTimer: ReturnType<typeof setTimeout> | undefined;
let lastTypingIndex = -1;

const latestArticle = computed(() => articleStore.articles[0] || null);
const typingCopies = [
  "霜降天，露初寒，旧约经年终未还。",
  "暮江天，水微澜，孤帆远去几时还。",
  "深冬夜，雪微残，故人一别隔千山。",
  "立春天，风渐暖，伊人一去不复返。",
];
const markdown = new MarkdownIt({ breaks: true, linkify: true });
const aboutHtml = computed(() => {
  const about = ui.webSetting?.about_md?.trim();
  return about ? markdown.render(about) : "";
});

function updateTime() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");

  currentTime.value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  currentDateTime.value = now.toISOString();
}

function startTyping() {
  let nextIndex = Math.floor(Math.random() * typingCopies.length);
  while (typingCopies.length > 1 && nextIndex === lastTypingIndex) {
    nextIndex = Math.floor(Math.random() * typingCopies.length);
  }
  lastTypingIndex = nextIndex;

  const text = typingCopies[nextIndex]!;
  let index = 0;

  const deleteNext = () => {
    if (index > 0) {
      index -= 1;
      typingText.value = text.slice(0, index);
      typingTimer = setTimeout(deleteNext, 90);
      return;
    }

    startTyping();
  };

  const typeNext = () => {
    if (index < text.length) {
      index += 1;
      typingText.value = text.slice(0, index);
      typingTimer = setTimeout(typeNext, 140);
      return;
    }

    typingTimer = setTimeout(deleteNext, 2000);
  };

  typeNext();
}

function updateNavigationState() {
  isNavigationFloating.value = window.scrollY > window.innerHeight * 0.65;
}

onMounted(async () => {
  updateTime();
  startTyping();
  updateNavigationState();
  clockTimer = setInterval(updateTime, 1000);
  window.addEventListener("scroll", updateNavigationState, { passive: true });

  await Promise.all([
    ui.fetchWebSetting(),
    articleStore.fetchArticles(1, 1).catch(() => undefined),
  ]);
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
  if (typingTimer) clearTimeout(typingTimer);
  window.removeEventListener("scroll", updateNavigationState);
});
</script>

<style scoped>
.home-screen {
  --home-bg: #eaf3f8;
  --home-text: #263b47;
  --home-muted: #536b78;
  --home-faint: rgba(58, 85, 99, 0.12);
  --home-line: rgba(58, 85, 99, 0.2);
  --home-panel: rgba(239, 247, 250, 0.82);
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  overflow-x: clip;
  background: var(--home-bg);
  color: var(--home-text);
  transition:
    background-color 300ms ease,
    color 300ms ease;
}

.home-screen--dark {
  --home-bg: #1c1c1e;
  --home-text: #f4f2ef;
  --home-muted: rgba(244, 242, 239, 0.62);
  --home-faint: rgba(244, 242, 239, 0.12);
  --home-line: rgba(244, 242, 239, 0.22);
  --home-panel: rgba(28, 28, 30, 0.84);
}
</style>
