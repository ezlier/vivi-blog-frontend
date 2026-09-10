<template>
  <div
    class="admin-layout"
    :class="{
      'is-collapsed': ui.sidebarCollapsed,
      'is-dark': ui.isDark,
    }"
    data-ark-theme="endfield"
    data-ark-depth="moderate"
  >
    <AdminSidebar
      :collapsed="ui.sidebarCollapsed"
      :mobile-open="mobileNavigationOpen"
      @close-mobile="closeMobileNavigation"
    />

    <button
      v-if="mobileNavigationOpen"
      class="admin-mobile-scrim"
      type="button"
      aria-label="关闭导航"
      @click="closeMobileNavigation"
    />

    <div class="admin-workspace">
      <AdminTopbar
        :collapsed="ui.sidebarCollapsed"
        @toggle-collapse="ui.toggleSidebar"
        @open-mobile-navigation="openMobileNavigation"
      />

      <main id="admin-main-content" class="admin-main" tabindex="-1">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AdminSidebar from "./components/AdminSidebar.vue";
import AdminTopbar from "./components/AdminTopbar.vue";
import { useUiStore } from "@/stores/ui";
import "./admin-console.css";

const ui = useUiStore();
const mobileNavigationOpen = ref(false);

function openMobileNavigation() {
  mobileNavigationOpen.value = true;
}

function closeMobileNavigation() {
  mobileNavigationOpen.value = false;
}
</script>
