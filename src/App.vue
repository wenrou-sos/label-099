<script setup lang="ts">
import { computed, defineComponent, h, onMounted } from 'vue'
import { NConfigProvider, NMessageProvider, NDialogProvider, NNotificationProvider, NLoadingBarProvider, useMessage } from 'naive-ui'
import { RouterView, useRoute } from 'vue-router'
import { useAppStore, themeOverrides } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { setMessageApi } from '@/api/http'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

const MessageInit = defineComponent({
  setup() {
    const msg = useMessage()
    setMessageApi(msg)
    return () => h('div', { style: 'display: none' })
  },
})

const appStore = useAppStore()
const userStore = useUserStore()
const route = useRoute()

const theme = computed(() => appStore.theme)
const themeOverridesValue = computed(() => themeOverrides)

const showLayout = computed(() => !['login'].includes(route.name as string))

onMounted(() => {
  userStore.initFromStorage()
  if (userStore.isLoggedIn) {
    appStore.fetchUnreadCount()
  }
})
</script>

<template>
  <NConfigProvider :theme="theme" :theme-overrides="themeOverridesValue">
    <NMessageProvider>
      <MessageInit />
      <NDialogProvider>
        <NNotificationProvider>
          <NLoadingBarProvider>
            <div v-if="showLayout" class="min-h-screen flex flex-col bg-cream-50">
              <AppHeader />
              <main class="flex-1">
                <RouterView v-slot="{ Component, route: currentRoute }">
                  <transition name="fade" mode="out-in">
                    <component :is="Component" :key="currentRoute.fullPath" />
                  </transition>
                </RouterView>
              </main>
              <AppFooter />
            </div>
            <div v-else>
              <RouterView v-slot="{ Component, route: currentRoute }">
                <transition name="fade" mode="out-in">
                  <component :is="Component" :key="currentRoute.fullPath" />
                </transition>
              </RouterView>
            </div>
          </NLoadingBarProvider>
        </NNotificationProvider>
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
