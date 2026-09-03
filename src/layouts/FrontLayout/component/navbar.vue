<template>
  <nav class="navbar" :class="{ 'navbar--scrolled': scrolled }">
    <div class="navbar__inner">
      <RouterLink to="/home" class="navbar__logo-section" @click="closeMenu">
        <span class="navbar__logo">
          {{ ui.webSetting?.web_name || "Blog" }}
        </span>
      </RouterLink>

      <div class="navbar__nav-section" role="navigation" aria-label="主导航">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="navbar__link"
          active-class="navbar__link--active"
          @click="closeMenu"
        >
          {{ item.label }}
        </RouterLink>
      </div>

      <button
        class="navbar__menu-button"
        type="button"
        :aria-label="isMenuOpen ? '关闭导航菜单' : '打开导航菜单'"
        :aria-expanded="isMenuOpen"
        aria-controls="mobile-navigation-drawer"
        @click="toggleMenu"
      >
        <span aria-hidden="true">≡</span>
      </button>
    </div>

    <Transition name="navbar-backdrop">
      <div
        v-if="isMenuOpen"
        class="navbar__backdrop"
        aria-hidden="true"
        @click="closeMenu"
      />
    </Transition>

    <Transition name="navbar-drawer">
      <aside
        v-if="isMenuOpen"
        id="mobile-navigation-drawer"
        class="navbar__drawer"
        aria-label="移动端导航"
      >
        <div class="navbar__drawer-header">
          <span class="navbar__drawer-title">导航</span>
          <button
            class="navbar__drawer-close"
            type="button"
            aria-label="关闭导航菜单"
            @click="closeMenu"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <nav class="navbar__drawer-links">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="navbar__drawer-link"
            active-class="navbar__drawer-link--active"
            @click="closeMenu"
          >
            <span>{{ item.label }}</span>
            <span class="navbar__drawer-arrow" aria-hidden="true">→</span>
          </RouterLink>
        </nav>
      </aside>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useUiStore } from "@/stores/ui";

const ui = useUiStore();
const route = useRoute();
const scrolled = ref(false);
const isMenuOpen = ref(false);

const navItems = [
  { to: "/", label: "首页" },
  { to: "/home", label: "文章" },
  { to: "/essay", label: "笔记" },
  { to: "/archive", label: "归档" },
  { to: "/message", label: "留言" },
  { to: "/about", label: "关于" },
];

function onScroll() {
  scrolled.value = window.scrollY > 50;
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function closeMenu() {
  isMenuOpen.value = false;
}

function onResize() {
  if (window.innerWidth > 768) {
    closeMenu();
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    closeMenu();
  }
}

watch(isMenuOpen, (open) => {
  document.body.classList.toggle("navbar-menu-open", open);
});

// 路由变化时关闭抽屉，避免切换页面后菜单仍保持打开状态。
watch(() => route.fullPath, closeMenu);

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("resize", onResize);
  onScroll();
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("keydown", onKeydown);
  window.removeEventListener("resize", onResize);
  document.body.classList.remove("navbar-menu-open");
});
</script>

<style scoped>
.navbar {
  --navbar-panel-background: var(--nav-color, rgba(255, 255, 255, 0.55));
  --navbar-panel-border: rgba(255, 255, 255, 0.46);
  --navbar-panel-shadow: 0 10px 30px rgba(73, 45, 52, 0.08);
  --navbar-drawer-background: rgba(255, 252, 253, 0.94);
  --navbar-drawer-shadow: -18px 0 50px rgba(73, 45, 52, 0.16);

  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 92px;
  padding: 18px 24px;
  pointer-events: none;
}

.navbar--scrolled {
  --navbar-panel-background: rgba(255, 255, 255, 0.78);
  --navbar-panel-border: rgba(255, 255, 255, 0.7);
  --navbar-panel-shadow: 0 10px 28px rgba(73, 45, 52, 0.12);
}

.dark .navbar {
  --navbar-panel-background: var(--nav-color, rgba(40, 30, 35, 0.55));
  --navbar-panel-border: rgba(255, 210, 220, 0.1);
  --navbar-panel-shadow: 0 10px 30px rgba(0, 0, 0, 0.14);
  --navbar-drawer-background: rgba(45, 35, 41, 0.97);
  --navbar-drawer-shadow: -18px 0 50px rgba(0, 0, 0, 0.32);
}

.dark .navbar--scrolled {
  --navbar-panel-background: rgba(40, 30, 35, 0.82);
  --navbar-panel-border: rgba(255, 210, 220, 0.16);
  --navbar-panel-shadow: 0 10px 28px rgba(0, 0, 0, 0.24);
}

.navbar__inner {
  display: flex;
  align-items: center;
  gap: clamp(24px, 9vw, 128px);
  width: 100%;
  max-width: 1280px;
  height: 100%;
  margin: 0 auto;
  pointer-events: auto;
}

.navbar__logo-section,
.navbar__nav-section,
.navbar__menu-button {
  border: 1px solid var(--navbar-panel-border);
  background: var(--navbar-panel-background);
  box-shadow: var(--navbar-panel-shadow);
  backdrop-filter: blur(14px) saturate(145%);
  -webkit-backdrop-filter: blur(14px) saturate(145%);
  transition:
    background 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

.navbar__logo-section {
  display: inline-flex;
  align-items: center;
  min-height: 56px;
  padding: 0 26px;
  border-radius: var(--border-radius-xs);
  color: var(--color-heading);
  text-decoration: none;
  flex: 0 1 auto;
  min-width: 118px;
  max-width: min(300px, 42vw);
}

.navbar__logo {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
  transition: opacity 0.2s;
}

.navbar__logo-section:hover .navbar__logo {
  opacity: 0.7;
}

.navbar__nav-section {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding: 7px;
  border-radius: var(--border-radius-xs);
}

.navbar__link {
  padding: 7px 14px;
  border-radius: 10px;
  color: var(--color-text);
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background 0.2s,
    color 0.2s;
}

.navbar__link:hover {
  background: rgba(0, 0, 0, 0.05);
}

.dark .navbar__link:hover {
  background: rgba(255, 255, 255, 0.08);
}

.navbar__link--active {
  color: var(--color-primary);
  background: rgba(99, 102, 241, 0.08);
}

.dark .navbar__link--active {
  background: rgba(129, 140, 248, 0.12);
}

.navbar__menu-button {
  display: none;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  flex: 0 0 56px;
  padding: 0;
  border-radius: 16px;
  color: var(--color-heading);
  cursor: pointer;
  font-family: inherit;
  font-size: 22px;
  line-height: 1;
}

.navbar__menu-button:hover {
  background: color-mix(
    in srgb,
    var(--navbar-panel-background) 82%,
    var(--color-primary)
  );
}

.navbar__menu-button:active {
  transform: scale(0.94);
}

.navbar__backdrop,
.navbar__drawer {
  pointer-events: auto;
}

.navbar__backdrop {
  position: fixed;
  inset: 0;
  z-index: 1001;
  background: rgba(57, 52, 54, 0.46);
  cursor: pointer;
}

.navbar__drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1002;
  display: flex;
  flex-direction: column;
  width: min(330px, 84vw);
  padding: 24px;
  overflow-y: auto;
  background: var(--navbar-drawer-background);
  color: var(--color-text);
  box-shadow: var(--navbar-drawer-shadow);
  backdrop-filter: blur(18px) saturate(145%);
  -webkit-backdrop-filter: blur(18px) saturate(145%);
}

.navbar__drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  margin-bottom: 30px;
  color: var(--color-heading);
}

.navbar__drawer-title {
  font-size: 20px;
  font-weight: 700;
}

.navbar__drawer-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-family: inherit;
  font-size: 28px;
  line-height: 1;
  transition: background 0.2s ease;
}

.navbar__drawer-close:hover {
  background: rgba(0, 0, 0, 0.06);
}

.dark .navbar__drawer-close:hover {
  background: rgba(255, 255, 255, 0.08);
}

.navbar__drawer-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.navbar__drawer-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 8px 14px;
  border-radius: 12px;
  color: var(--color-text);
  text-decoration: none;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.navbar__drawer-link:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: translateX(-3px);
}

.dark .navbar__drawer-link:hover {
  background: rgba(255, 255, 255, 0.08);
}

.navbar__drawer-link--active {
  color: var(--color-primary);
  background: rgba(99, 102, 241, 0.08);
}

.dark .navbar__drawer-link--active {
  background: rgba(129, 140, 248, 0.12);
}

.navbar__drawer-arrow {
  color: var(--color-heading);
  opacity: 0.65;
}

:global(body.navbar-menu-open) {
  overflow: hidden;
}

.navbar-backdrop-enter-active,
.navbar-backdrop-leave-active {
  transition: opacity 0.25s ease;
}

.navbar-backdrop-enter-from,
.navbar-backdrop-leave-to {
  opacity: 0;
}

.navbar-drawer-enter-active,
.navbar-drawer-leave-active {
  transition: transform 0.3s ease;
}

.navbar-drawer-enter-from,
.navbar-drawer-leave-to {
  transform: translateX(100%);
}

@media (max-width: 768px) {
  .navbar {
    height: 92px;
    padding: 18px 16px;
  }

  .navbar__inner {
    gap: 16px;
  }

  .navbar__logo-section {
    min-height: 56px;
    max-width: calc(100vw - 88px);
  }

  .navbar__nav-section {
    display: none;
  }

  .navbar__menu-button {
    display: inline-flex;
    margin-left: auto;
  }

  .navbar__drawer {
    width: min(330px, 84vw);
    padding: 24px 20px;
  }
}

@media (min-width: 769px) {
  .navbar__drawer,
  .navbar__backdrop {
    display: none !important;
  }
}
</style>
