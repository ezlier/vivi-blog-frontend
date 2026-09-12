<template>
  <aside
    class="admin-rail"
    :class="{
      'is-collapsed': collapsed,
      'is-mobile-open': mobileOpen,
    }"
    aria-label="后台导航"
  >
    <div class="admin-rail__head">
      <RouterLink
        to="/admin/dashboard"
        class="admin-rail__brand"
        aria-label="返回后台总览"
        @click="closeMobileNavigation"
      >
        <span class="admin-rail__brand-mark" aria-hidden="true">V</span>
        <span class="admin-rail__brand-copy">
          <strong>VIVI</strong>
          <small>CONTROL ROOM</small>
        </span>
      </RouterLink>
    </div>

    <nav class="admin-rail__navigation">
      <div
        v-for="(entry, index) in adminNavigation"
        :key="entry.to"
        class="admin-rail__group"
      >
        <RouterLink
          :to="entry.to"
          class="admin-rail__entry"
          :class="{ 'is-current': isEntryActive(entry) }"
          :aria-current="isEntryActive(entry) ? 'page' : undefined"
          :title="collapsed ? entry.label : undefined"
          @click="closeMobileNavigation"
        >
          <span class="admin-rail__index" aria-hidden="true">
            {{ formatIndex(index + 1) }}
          </span>
          <el-icon class="admin-rail__icon" aria-hidden="true">
            <component :is="entry.icon" />
          </el-icon>
          <span class="admin-rail__entry-copy">
            <strong>{{ entry.label }}</strong>
            <small>{{ entry.code }}</small>
          </span>
        </RouterLink>

        <div
          v-if="entry.children?.length && !collapsed"
          class="admin-rail__children"
        >
          <RouterLink
            v-for="child in entry.children"
            :key="child.to"
            :to="child.to"
            class="admin-rail__child"
            active-class="is-current"
            @click="closeMobileNavigation"
          >
            <el-icon aria-hidden="true"><component :is="child.icon" /></el-icon>
            <span>{{ child.label }}</span>
          </RouterLink>
        </div>
      </div>
    </nav>

    <div class="admin-rail__account">
      <RouterLink
        to="/admin/users"
        class="admin-rail__identity"
        :title="collapsed ? '账户设置' : undefined"
        @click="closeMobileNavigation"
      >
        <span class="admin-rail__avatar" aria-hidden="true">
          {{ accountInitial }}
        </span>
        <span class="admin-rail__identity-copy">
          <strong>{{ auth.username || "管理员" }}</strong>
          <small>ACCOUNT</small>
        </span>
      </RouterLink>

      <div class="admin-rail__account-actions">
        <button
          class="admin-rail__account-action"
          title="账户设置"
          aria-label="账户设置"
          type="button"
          @click="openAccountDialog"
        >
          <el-icon aria-hidden="true"><EditPen /></el-icon>
          <span>设置</span>
        </button>
        <button
          class="admin-rail__account-action admin-rail__account-action--logout"
          type="button"
          title="退出登录"
          aria-label="退出登录"
          @click="handleLogout"
        >
          <el-icon aria-hidden="true"><SwitchButton /></el-icon>
          <span>退出</span>
        </button>
      </div>
    </div>
  </aside>

  <AdminAccountDialog v-model="accountDialogOpen" />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { EditPen, SwitchButton } from "@element-plus/icons-vue";
import { useAuthStore } from "@/stores/auth";
import AdminAccountDialog from "./AdminAccountDialog.vue";
import { adminNavigation, type AdminNavigationItem } from "../admin-navigation";

const props = defineProps<{
  collapsed: boolean;
  mobileOpen: boolean;
}>();

const emit = defineEmits<{
  closeMobile: [];
}>();

const auth = useAuthStore();
const route = useRoute();
const accountDialogOpen = ref(false);

const accountInitial = computed(
  () => (auth.username || "A").trim().slice(0, 1).toUpperCase() || "A",
);

function formatIndex(index: number) {
  return String(index).padStart(2, "0");
}

function isEntryActive(entry: AdminNavigationItem) {
  return (
    route.path === entry.to ||
    route.path.startsWith(`${entry.to}/`) ||
    entry.children?.some(
      (child) =>
        route.path === child.to || route.path.startsWith(`${child.to}/`),
    )
  );
}

function closeMobileNavigation() {
  emit("closeMobile");
}

function openAccountDialog() {
  closeMobileNavigation();
  accountDialogOpen.value = true;
}

async function handleLogout() {
  emit("closeMobile");
  await auth.logout();
}
</script>

<style scoped>
.admin-rail {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 30;
  display: flex;
  min-width: 0;
  height: 100dvh;
  min-height: 100dvh;
  flex-direction: column;
  border-right: 1px solid var(--admin-rule);
  background: var(--admin-rail);
  color: var(--admin-ink);
  box-shadow: 8px 0 24px rgb(0 0 0 / 0.04);
  transition:
    width 260ms cubic-bezier(0.22, 0.8, 0.2, 1),
    transform 260ms cubic-bezier(0.22, 0.8, 0.2, 1);
  width: var(--admin-rail-width);
}

.admin-rail__head {
  min-height: var(--admin-topbar-height);
  padding: 0 16px;
  border-bottom: 1px solid var(--admin-rule);
}

.admin-rail__brand {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 12px;
  color: inherit;
  text-decoration: none;
}

.admin-rail__brand-mark {
  display: grid;
  flex: 0 0 34px;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid currentColor;
  color: var(--admin-signal);
  font-family: var(--admin-mono);
  font-size: 17px;
  font-weight: 800;
}

.admin-rail__brand-copy,
.admin-rail__entry-copy,
.admin-rail__identity-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.admin-rail__brand-copy strong {
  font-family: var(--admin-display);
  font-size: 17px;
  line-height: 1.1;
}

.admin-rail__brand-copy small,
.admin-rail__entry-copy small,
.admin-rail__identity-copy small {
  overflow: hidden;
  color: var(--admin-muted);
  font-family: var(--admin-mono);
  font-size: 10px;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-rail__navigation {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  padding: 12px 10px 24px;
  overflow-y: auto;
}

.admin-rail__group {
  position: relative;
}

.admin-rail__entry,
.admin-rail__child,
.admin-rail__account-action {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.admin-rail__entry {
  position: relative;
  display: grid;
  grid-template-columns: 23px 20px minmax(0, 1fr);
  align-items: center;
  min-height: 48px;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid transparent;
  color: var(--admin-ink);
  text-decoration: none;
  transition:
    background-color 180ms ease,
    border-color 180ms ease,
    color 180ms ease;
}

.admin-rail__entry::before {
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: -11px;
  width: 3px;
  background: var(--admin-signal);
  content: "";
  opacity: 0;
  transform: scaleY(0.4);
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.admin-rail__entry:hover {
  border-color: var(--admin-rule);
  background: var(--admin-hover);
}

.admin-rail__entry.is-current {
  border-color: var(--admin-rule-strong);
  background: var(--admin-active);
}

.admin-rail__entry.is-current::before {
  opacity: 1;
  transform: scaleY(1);
}

.admin-rail__index {
  color: var(--admin-muted);
  font-family: var(--admin-mono);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}

.admin-rail__entry.is-current .admin-rail__index {
  color: var(--admin-signal);
}

.admin-rail__icon {
  font-size: 18px;
}

.admin-rail__entry-copy strong,
.admin-rail__identity-copy strong {
  overflow: hidden;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-rail__children {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 4px 0 8px 42px;
  padding-left: 10px;
  border-left: 1px solid var(--admin-rule);
}

.admin-rail__child {
  display: flex;
  align-items: center;
  min-height: 36px;
  gap: 8px;
  color: var(--admin-muted);
  font-size: 12px;
  text-decoration: none;
  transition: color 180ms ease;
}

.admin-rail__child:hover,
.admin-rail__child.is-current {
  color: var(--admin-ink);
}

.admin-rail__child .el-icon {
  color: var(--admin-signal);
  font-size: 14px;
}

.admin-rail__account {
  margin: auto 10px 12px;
  padding-top: 12px;
  border-top: 1px solid var(--admin-rule);
}

.admin-rail__identity {
  display: flex;
  align-items: center;
  min-height: 52px;
  gap: 10px;
  padding: 6px;
  color: inherit;
  text-decoration: none;
}

.admin-rail__avatar {
  display: grid;
  flex: 0 0 34px;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--admin-rule-strong);
  background: var(--admin-surface);
  color: var(--admin-signal);
  font-family: var(--admin-mono);
  font-size: 13px;
  font-weight: 700;
}

.admin-rail__account-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}

.admin-rail__account-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  gap: 6px;
  border: 1px solid var(--admin-rule);
  background: transparent;
  color: var(--admin-muted);
  cursor: pointer;
  font: inherit;
  font-size: 11px;
  text-decoration: none;
  transition:
    background-color 180ms ease,
    border-color 180ms ease,
    color 180ms ease;
}

.admin-rail__account-action:hover {
  border-color: var(--admin-rule-strong);
  background: var(--admin-hover);
  color: var(--admin-ink);
}

.admin-rail__account-action--logout:hover {
  color: var(--admin-danger);
}

.admin-rail__entry:focus-visible,
.admin-rail__child:focus-visible,
.admin-rail__identity:focus-visible,
.admin-rail__account-action:focus-visible,
.admin-rail__brand:focus-visible {
  outline: 2px solid var(--admin-signal);
  outline-offset: 2px;
}

.admin-rail.is-collapsed {
  width: var(--admin-rail-collapsed-width);
}

.admin-rail.is-collapsed .admin-rail__head {
  padding: 0;
}

.admin-rail.is-collapsed .admin-rail__brand {
  justify-content: center;
}

.admin-rail.is-collapsed .admin-rail__brand-copy,
.admin-rail.is-collapsed .admin-rail__entry-copy,
.admin-rail.is-collapsed .admin-rail__identity-copy,
.admin-rail.is-collapsed .admin-rail__index,
.admin-rail.is-collapsed .admin-rail__account-action span {
  display: none;
}

.admin-rail.is-collapsed .admin-rail__navigation {
  padding-inline: 10px;
}

.admin-rail.is-collapsed .admin-rail__entry {
  display: flex;
  justify-content: center;
  padding-inline: 0;
}

.admin-rail.is-collapsed .admin-rail__entry::before {
  left: -11px;
}

.admin-rail.is-collapsed .admin-rail__account {
  margin-inline: 10px;
}

.admin-rail.is-collapsed .admin-rail__identity {
  justify-content: center;
}

.admin-rail.is-collapsed .admin-rail__account-actions {
  grid-template-columns: 1fr;
}

.admin-rail.is-collapsed .admin-rail__account-action {
  min-height: 34px;
}

@media (max-width: 760px) {
  .admin-rail {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    width: min(280px, 82vw);
    box-shadow: 20px 0 48px rgb(0 0 0 / 0.24);
    transform: translateX(-105%);
  }

  .admin-rail.is-mobile-open {
    transform: translateX(0);
  }

  .admin-rail.is-collapsed {
    width: min(280px, 82vw);
  }

  .admin-rail.is-collapsed .admin-rail__head {
    padding: 0 16px;
  }

  .admin-rail.is-collapsed .admin-rail__brand {
    justify-content: flex-start;
  }

  .admin-rail.is-collapsed .admin-rail__brand-copy,
  .admin-rail.is-collapsed .admin-rail__entry-copy,
  .admin-rail.is-collapsed .admin-rail__identity-copy,
  .admin-rail.is-collapsed .admin-rail__index,
  .admin-rail.is-collapsed .admin-rail__account-action span {
    display: flex;
  }

  .admin-rail.is-collapsed .admin-rail__entry {
    display: grid;
    justify-content: initial;
    padding-inline: 10px;
  }

  .admin-rail.is-collapsed .admin-rail__account-actions {
    grid-template-columns: 1fr 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .admin-rail,
  .admin-rail__entry,
  .admin-rail__entry::before,
  .admin-rail__child,
  .admin-rail__account-action {
    transition: none;
  }
}
</style>
