<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Heart,
  Search,
  Bell,
  User,
  LogOut,
  Package,
  Home,
  Users,
  ShoppingBag,
  HelpCircle,
  Award,
  Menu,
  X,
} from 'lucide-vue-next'
import { NBadge, NAvatar, NDropdown, NButton, NInput } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()

const searchKeyword = ref('')
const showMobileMenu = ref(false)

const navItems = [
  { key: 'home', label: '首页', path: '/', icon: Home },
  { key: 'community', label: '社区', path: '/community', icon: Users },
  { key: 'market', label: '交易', path: '/market', icon: ShoppingBag },
  { key: 'qa', label: '问答', path: '/qa', icon: HelpCircle },
  { key: 'experts', label: '专家', path: '/experts', icon: Award },
]

const activeKey = computed(() => {
  const path = route.path
  if (path === '/') return 'home'
  if (path.startsWith('/community')) return 'community'
  if (path.startsWith('/market')) return 'market'
  if (path.startsWith('/qa')) return 'qa'
  if (path.startsWith('/experts')) return 'experts'
  return ''
})

const userDropdownOptions = computed(() => [
  {
    label: '个人中心',
    key: 'profile',
    icon: () => h(User, { size: 16 }),
  },
  {
    label: '我的商品',
    key: 'profile-products',
    icon: () => h(Package, { size: 16 }),
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: () => h(LogOut, { size: 16 }),
  },
])

import { h } from 'vue'

function handleNavClick(path: string) {
  showMobileMenu.value = false
  router.push(path)
}

function handleSearch() {
  const keyword = searchKeyword.value.trim()
  if (keyword) {
    router.push({
      path: '/community',
      query: { keyword },
    })
  }
}

async function handleUserSelect(key: string) {
  if (key === 'logout') {
    await userStore.logout()
    appStore.unreadCount = 0
    router.push('/login')
  } else if (key === 'profile') {
    router.push('/profile')
  } else if (key === 'profile-products') {
    router.push('/profile/products')
  }
}

function goLogin() {
  router.push('/login')
}

function goMessages() {
  router.push('/messages')
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    appStore.fetchUnreadCount()
  }
})
</script>

<template>
  <header
    class="sticky top-0 z-50 bg-white border-b border-ink-100 shadow-sm"
  >
    <div class="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
      <div
        class="flex items-center gap-2 cursor-pointer group"
        @click="handleNavClick('/')"
      >
        <div
          class="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-primary group-hover:shadow-primary-hover transition-all"
        >
          <Heart class="w-5 h-5 text-white" fill="white" />
        </div>
        <span
          class="text-heading-3 font-bold bg-gradient-to-r from-primary-500 to-lavender-500 bg-clip-text text-transparent"
        >
          宝妈圈
        </span>
      </div>

      <nav class="hidden md:flex items-center gap-1 flex-shrink-0">
        <RouterLink
          v-for="item in navItems"
          :key="item.key"
          :to="item.path"
          :class="[
            activeKey === item.key ? 'nav-link-active' : 'nav-link',
          ]"
        >
          <component :is="item.icon" class="w-4 h-4 mr-1.5" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="hidden md:block flex-1 max-w-md">
        <NInput
          v-model:value="searchKeyword"
          placeholder="搜索帖子、商品、育儿问题..."
          clearable
          size="large"
          round
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <Search class="w-4 h-4 text-ink-300" />
          </template>
        </NInput>
      </div>

      <div class="flex items-center gap-2">
        <div
          v-if="userStore.isLoggedIn"
          class="relative hidden md:block"
        >
          <button
          class="w-10 h-10 rounded-xl flex items-center justify-center text-ink-500 hover:text-primary-500 hover:bg-primary-50 transition-all"
          @click="goMessages"
        >
          <NBadge
            :value="appStore.unreadCount"
            :max="99"
            :show-zero="false"
            class="!-top-1 !-right-1"
          >
            <Bell class="w-5 h-5" />
          </NBadge>
          </button>
        </div>

        <template v-if="userStore.isLoggedIn">
          <NDropdown
            :options="userDropdownOptions"
            trigger="click"
            placement="bottom-end"
            @select="handleUserSelect"
          >
            <div
              class="flex items-center gap-2 cursor-pointer p-1.5 rounded-xl hover:bg-ink-50 transition-colors"
            >
              <NAvatar
                round
                size="small"
                :src="userStore.userInfo?.avatar"
                class="!bg-gradient-primary"
              >
                <User class="w-4 h-4 text-white" />
              </NAvatar>
              <span class="hidden md:block text-body font-medium text-ink-700 max-w-[100px] truncate">
                {{ userStore.userInfo?.nickname || userStore.userInfo?.username }}
              </span>
            </div>
          </NDropdown>
        </template>

        <template v-else>
          <NButton
            size="small"
            quaternary
            @click="goLogin"
            class="!text-ink-600"
          >
            <User class="w-4 h-4 mr-1" />
            <span class="hidden md:inline">登录</span>
          </NButton>
          <NButton
            size="small"
            type="primary"
            round
            @click="goLogin"
            class="!bg-gradient-primary !border-0"
          >
            注册
          </NButton>
        </template>

        <button
          class="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-ink-600 hover:bg-ink-50"
          @click="showMobileMenu = !showMobileMenu"
        >
          <Menu v-if="!showMobileMenu" class="w-5 h-5" />
          <X v-else class="w-5 h-5" />
        </button>
      </div>
    </div>

    <div
      v-if="showMobileMenu"
      class="md:hidden border-t border-ink-100 bg-white px-4 py-3 space-y-3"
    >
      <NInput
        v-model:value="searchKeyword"
        placeholder="搜索帖子、商品、育儿问题..."
        clearable
        round
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #prefix>
          <Search class="w-4 h-4 text-ink-300" />
        </template>
      </NInput>

      <nav class="grid grid-cols-5 gap-1">
        <button
          v-for="item in navItems"
          :key="item.key"
          :class="[
            'flex flex-col items-center justify-center gap-1 py-3 rounded-xl transition-all',
            activeKey === item.key
              ? 'bg-primary-50 text-primary-500'
              : 'text-ink-500 hover:bg-ink-50',
          ]"
          @click="handleNavClick(item.path)"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span class="text-caption font-medium">{{ item.label }}</span>
        </button>
      </nav>
    </div>
  </header>
</template>
