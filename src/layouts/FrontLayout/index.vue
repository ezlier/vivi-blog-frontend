<template>
  <div class="front-layout">
    <SplashScreen ref="splashRef" />
    <PageTransition />
    <HomeAtmosphere :dark="ui.isDark" />
    <Dock />

    <Navbar />

    <div class="head">
      <h1 style="color: var(--color-text);">{{ route.name }}</h1>
    </div>

    <main class="front-main">
      <div class="leftcolumn">
        <RouterView name="sidebar" />
      </div>

      <div class="rightcolumn">
        <RouterView v-slot="{ Component }">
          <template v-if="Component">
            <KeepAlive :exclude="['ArticleDetail']">
              <component :is="Component" />
            </KeepAlive>
          </template>
        </RouterView>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useRoute } from 'vue-router'
import Navbar from './component/navbar.vue'
import Footer from './component/footer.vue'
import Dock from './component/dock.vue'
import SplashScreen from '@/components/SplashScreen.vue'
import PageTransition from '@/components/PageTransition.vue'
import HomeAtmosphere from '@/views/home/component/HomeAtmosphere.vue'

const ui = useUiStore()

const route = useRoute();

const splashRef = ref<InstanceType<typeof SplashScreen>>()

onMounted(async () => {
  await ui.fetchWebSetting()
  splashRef.value?.close()
})
</script>

<style scoped>
.front-layout {
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  background-color: #1c1c1e;
}

.head,
.front-main,
.footer {
  position: relative;
  z-index: 1;
}

.head {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Anurati;
}

.front-main {
  display: flex;
  gap: 24px;
  max-width: 1280px;
  padding: 24px;
  justify-content: center;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.leftcolumn {
  flex: 1;
}

.rightcolumn {
  flex: 0 0 77%;
  min-width: 0;
  border-radius: var(--border-radius-xs);
  box-shadow: var(--box-shadow);
  border-color: var(--color-border);
  padding: 1.125rem;
}

@media (max-width: 768px) {
  .front-main {
    flex-direction: column;
    padding: 16px;
  }

  .leftcolumn {
    display: none;
    width: 100%;
  }
}
</style>
