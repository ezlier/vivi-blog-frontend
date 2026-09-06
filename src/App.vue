<script setup lang="ts">
import { onMounted } from "vue";
import { RouterView } from "vue-router";
import { trackVisitor } from "@/api/visitor";

function getDeviceType() {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/ipad|tablet/.test(userAgent)) return "tablet";
  if (/mobile|android|iphone|ipod/.test(userAgent)) return "mobile";
  return "desktop";
}

onMounted(() => {
  void trackVisitor({ device_type: getDeviceType() }).catch(() => {
    // 访客记录失败不影响页面访问。
  });
});
</script>

<template>
  <RouterView />
</template>
