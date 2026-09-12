<template>
  <header class="admin-topbar">
    <div class="admin-topbar__leading">
      <button
        class="admin-topbar__icon-button admin-topbar__mobile-menu"
        type="button"
        aria-label="打开导航"
        title="打开导航"
        @click="emit('openMobileNavigation')"
      >
        <el-icon aria-hidden="true"><Menu /></el-icon>
      </button>

      <button
        class="admin-topbar__icon-button admin-topbar__collapse"
        type="button"
        :aria-label="collapsed ? '展开侧边导航' : '折叠侧边导航'"
        :aria-pressed="collapsed"
        :title="collapsed ? '展开侧边导航' : '折叠侧边导航'"
        @click="emit('toggleCollapse')"
      >
        <el-icon aria-hidden="true">
          <Expand v-if="collapsed" />
          <Fold v-else />
        </el-icon>
      </button>

      <div class="admin-topbar__location">
        <span>ADMIN / {{ currentSection }}</span>
        <strong>{{ pageLabel }}</strong>
      </div>
    </div>

    <div class="admin-topbar__utilities">
      <span class="admin-topbar__session">
        <span class="admin-topbar__session-dot" aria-hidden="true"></span>
        <span>SESSION ACTIVE</span>
      </span>
      <time class="admin-topbar__clock" :datetime="currentTime">
        {{ currentTime }}
      </time>
      <RouterLink
        to="/"
        class="admin-topbar__home"
        title="返回首页"
        aria-label="返回首页"
      >
        <el-icon aria-hidden="true"><ArrowLeft /></el-icon>
      </RouterLink>
      <button
        class="admin-topbar__icon-button"
        type="button"
        :aria-label="ui.isDark ? '切换亮色主题' : '切换深色主题'"
        :aria-pressed="ui.isDark"
        :title="ui.isDark ? '切换亮色主题' : '切换深色主题'"
        @click="ui.toggleTheme"
      >
        <el-icon aria-hidden="true">
          <Sunny v-if="ui.isDark" />
          <Moon v-else />
        </el-icon>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import {
  ArrowLeft,
  Expand,
  Fold,
  Menu,
  Moon,
  Sunny,
} from "@element-plus/icons-vue";
import { useAdminClock } from "@/composables/useAdminClock";
import { useUiStore } from "@/stores/ui";
import { getAdminPageLabel } from "../admin-navigation";

defineProps<{
  collapsed: boolean;
}>();

const emit = defineEmits<{
  toggleCollapse: [];
  openMobileNavigation: [];
}>();

const route = useRoute();
const ui = useUiStore();
const { currentTime } = useAdminClock();

const pageLabel = computed(() => getAdminPageLabel(route.name));
const currentSection = computed(() => {
  const label = pageLabel.value;
  return label === "管理控制台" ? "CONSOLE" : label.toUpperCase();
});
</script>

<style scoped>
.admin-topbar {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: var(--admin-topbar-height);
  gap: 16px;
  padding: 0 24px;
  border-bottom: 1px solid var(--admin-rule);
  background: var(--admin-topbar);
  color: var(--admin-ink);
}

.admin-topbar::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--admin-signal) 28%,
    transparent 55%
  );
  content: "";
  opacity: 0.65;
}

.admin-topbar__leading,
.admin-topbar__utilities {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 10px;
}

.admin-topbar__icon-button,
.admin-topbar__home {
  display: inline-grid;
  flex: 0 0 40px;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--admin-rule);
  background: transparent;
  color: var(--admin-ink);
  cursor: pointer;
  text-decoration: none;
  transition:
    background-color 180ms ease,
    border-color 180ms ease,
    color 180ms ease;
}

.admin-topbar__icon-button:hover,
.admin-topbar__home:hover {
  border-color: var(--admin-rule-strong);
  background: var(--admin-hover);
  color: var(--admin-signal-ink);
}

.admin-topbar__icon-button:focus-visible,
.admin-topbar__home:focus-visible {
  outline: 2px solid var(--admin-signal);
  outline-offset: 2px;
}

.admin-topbar__icon-button .el-icon,
.admin-topbar__home .el-icon {
  font-size: 19px;
}

.admin-topbar__mobile-menu {
  display: none;
}

.admin-topbar__location {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.admin-topbar__location span,
.admin-topbar__session {
  color: var(--admin-muted);
  font-family: var(--admin-mono);
  font-size: 11px;
  line-height: 1.3;
}

.admin-topbar__location strong {
  overflow: hidden;
  font-size: 14px;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-topbar__session {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
}

.admin-topbar__session-dot {
  width: 8px;
  height: 8px;
  background: var(--admin-state);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--admin-state), transparent 78%);
}

.admin-topbar__clock {
  color: var(--admin-ink);
  font-family: var(--admin-mono);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

@media (max-width: 760px) {
  .admin-topbar {
    min-height: 60px;
    padding: 0 14px;
  }

  .admin-topbar__mobile-menu {
    display: inline-grid;
  }

  .admin-topbar__collapse,
  .admin-topbar__session {
    display: none;
  }

  .admin-topbar__utilities {
    gap: 6px;
  }

  .admin-topbar__clock {
    font-size: 11px;
  }
}

@media (max-width: 420px) {
  .admin-topbar__clock {
    display: none;
  }

  .admin-topbar__location span {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .admin-topbar__icon-button,
  .admin-topbar__home {
    transition: none;
  }
}
</style>
