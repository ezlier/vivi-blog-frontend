<script setup lang="ts">
type NavigationIcon = "home" | "article" | "archive" | "essay" | "message";

interface NavigationItem {
  label: string;
  icon: NavigationIcon;
  path?: string;
  anchor?: string;
}

defineProps<{
  floating: boolean;
}>();

const navigationItems: NavigationItem[] = [
  { label: "首页", icon: "home", anchor: "#top" },
  { label: "文章", icon: "article", path: "/home" },
  { label: "笔记", icon: "essay", path: "/essay" },
  { label: "归档", icon: "archive", path: "/archive" },
  { label: "留言", icon: "message", path: "/message" },
];

function handleAnchorClick(event: MouseEvent) {
  const anchor = (event.currentTarget as HTMLAnchorElement).getAttribute(
    "href",
  );
  if (!anchor) return;

  const target = document.querySelector(anchor);
  if (target) {
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
</script>

<template>
  <nav class="home-navigation" :class="{ 'home-navigation--floating': floating }" aria-label="主页导航">
    <template v-for="item in navigationItems" :key="item.label">
      <a v-if="item.anchor" class="home-navigation__item" :href="item.anchor" :aria-label="item.label"
        @click="handleAnchorClick">
        <span class="home-navigation__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path v-if="item.icon === 'home'" d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
            <path v-else-if="item.icon === 'article'" d="M6 4h12v16H6zM9 8h6M9 12h6M9 16h4" />
            <path v-else-if="item.icon === 'archive'" d="M4 6h16v4H4zM6 10v9h12v-9M9 14h6" />
            <path v-else-if="item.icon === 'essay'"
              d="M6 4h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm11 0v14H7V5h10zm-2 2H9v2h6V6zm0 4H9v2h6v-2zm0 4H9v2h4v-2z" />
            <path v-else d="M5 5h14v14H5zM8 9h8M8 13h5" />
          </svg>
        </span>
        <span class="home-navigation__label">{{ item.label }}</span>
      </a>
      <RouterLink v-else class="home-navigation__item" :to="item.path!" :aria-label="item.label">
        <span class="home-navigation__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path v-if="item.icon === 'home'" d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
            <path v-else-if="item.icon === 'article'" d="M6 4h12v16H6zM9 8h6M9 12h6M9 16h4" />
            <path v-else-if="item.icon === 'archive'" d="M4 6h16v4H4zM6 10v9h12v-9M9 14h6" />
            <path v-else-if="item.icon === 'essay'"
              d="M6 4h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm11 0v14H7V5h10zm-2 2H9v2h6V6zm0 4H9v2h6v-2zm0 4H9v2h4v-2z" />
            <path v-else d="M5 5h14v14H5zM8 9h8M8 13h5" />
          </svg>
        </span>
        <span class="home-navigation__label">{{ item.label }}</span>
      </RouterLink>
    </template>
  </nav>
</template>

<style scoped>
.home-navigation {
  position: absolute;
  bottom: 32px;
  left: 50%;
  display: flex;
  align-items: center;
  gap: clamp(20px, 5vw, 68px);
  width: max-content;
  max-width: calc(100% - 32px);
  transform: translateX(-50%);
  transition:
    top 280ms ease,
    bottom 280ms ease,
    gap 280ms ease,
    padding 280ms ease,
    background-color 280ms ease,
    border-color 280ms ease,
    box-shadow 280ms ease;
}

.home-navigation--floating {
  position: fixed;
  top: 16px;
  bottom: auto;
  z-index: 20;
  gap: 5px;
  padding: 5px;
  border: 1px solid var(--home-line);
  border-radius: 999px;
  background: var(--home-panel);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(16px) saturate(130%);
  -webkit-backdrop-filter: blur(16px) saturate(130%);
}

.home-navigation__item {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-height: 38px;
  padding: 6px 8px;
  border-radius: 999px;
  color: var(--home-muted);
  text-decoration: none;
  transition:
    color 180ms ease,
    background-color 180ms ease,
    transform 180ms ease;
}

.home-navigation:not(.home-navigation--floating) .home-navigation__item {
  flex-direction: column;
  gap: 7px;
  min-width: 70px;
  padding: 4px 10px;
}

.home-navigation__item:hover,
.home-navigation__item:focus-visible {
  color: var(--home-text);
  outline: none;
  transform: translateY(-2px);
}

.home-navigation--floating .home-navigation__item:hover,
.home-navigation--floating .home-navigation__item:focus-visible {
  background: var(--home-faint);
  transform: none;
}

.home-navigation__icon {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--home-line);
  border-radius: 50%;
}

.home-navigation__icon svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.35;
}

.home-navigation__label {
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
}

@media (max-width: 760px) {
  .home-navigation {
    bottom: 26px;
    gap: 8px;
    max-width: calc(100% - 14px);
  }

  .home-navigation:not(.home-navigation--floating) .home-navigation__item {
    min-width: 62px;
    padding: 4px 6px;
  }

  .home-navigation__icon {
    width: 32px;
    height: 32px;
  }

  .home-navigation__label {
    font-size: 11px;
  }

  .home-navigation--floating {
    top: 10px;
    gap: 1px;
    max-height: 40px;
  }

  .home-navigation--floating .home-navigation__item {
    min-height: 34px;
    padding: 4px 5px;
  }

  .home-navigation--floating .home-navigation__icon {
    width: 28px;
    height: 28px;
  }

  .home-navigation--floating .home-navigation__label {
    display: none;
  }
}
</style>
