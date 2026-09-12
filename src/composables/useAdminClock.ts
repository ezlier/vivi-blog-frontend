import { onMounted, onUnmounted, ref } from "vue";

function formatClock(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function useAdminClock() {
  const currentTime = ref(formatClock(new Date()));
  let timer: ReturnType<typeof setInterval> | undefined;

  function updateClock() {
    currentTime.value = formatClock(new Date());
  }

  onMounted(() => {
    updateClock();
    timer = setInterval(updateClock, 1000);
  });

  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });

  return { currentTime };
}
