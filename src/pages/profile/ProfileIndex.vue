<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import {
  Settings, ShoppingBag, ClipboardList, Star, FileEdit,
  HelpCircle, Heart, Footprints, Wallet, MapPin,
  ChevronRight, Award, Crown, Gem, Sparkles, Eye, Package,
  Calendar as CalendarIcon, CheckCircle2
} from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import { getProfile } from '@/api/auth'
import { getPostList } from '@/api/post'
import { getProductList } from '@/api/product'
import { getSellerStats } from '@/api/user'
import type { User, Post, Product, SellerStats } from '@shared/types'

const router = useRouter()
const userStore = useUserStore()
const message = useMessage()

const loading = ref(true)
const user = ref<User | null>(null)
const recentProducts = ref<Product[]>([])
const recentOrders = ref<any[]>([])
const sellerStats = ref<SellerStats | null>(null)

const menuGroups: { icon: any; label: string; route?: string; badge?: number | string; color: string }[][] = [
  [
    { icon: ShoppingBag, label: '我的商品', route: '/profile/products', badge: 12, color: 'from-pink-400 to-rose-500' },
    { icon: ClipboardList, label: '我的订单', route: '/orders', badge: 3, color: 'from-blue-400 to-cyan-500' },
    { icon: Star, label: '我的评价', route: '/profile/reviews', badge: 5, color: 'from-amber-400 to-orange-500' },
    { icon: FileEdit, label: '我的帖子', route: '/profile/posts', badge: 23, color: 'from-purple-400 to-indigo-500' },
  ],
  [
    { icon: HelpCircle, label: '我的提问', route: '/qa', badge: 8, color: 'from-fuchsia-400 to-pink-500' },
    { icon: Sparkles, label: '我的回答', route: '/qa', badge: 0, color: 'from-teal-400 to-emerald-500' },
    { icon: Heart, label: '我的收藏', badge: 56, color: 'from-red-400 to-rose-500' },
    { icon: Footprints, label: '我的足迹', route: '/profile/footprints', badge: 128, color: 'from-indigo-400 to-purple-500' },
  ],
  [
    { icon: Wallet, label: '我的钱包', badge: '¥528', color: 'from-green-400 to-emerald-500' },
    { icon: MapPin, label: '收货地址', color: 'from-orange-400 to-amber-500' },
    { icon: Settings, label: '账号设置', route: '/profile/settings', color: 'from-slate-400 to-gray-500' },
    { icon: HelpCircle, label: '帮助中心', color: 'from-sky-400 to-blue-500' },
  ],
]

const levelInfo = computed(() => {
  const score = user.value?.creditScore || 930
  const level = Math.floor(score / 100)
  const nextLevelScore = (level + 1) * 100
  const currentLevelScore = level * 100
  const progress = ((score - currentLevelScore) / (nextLevelScore - currentLevelScore)) * 100
  const reviewsToNext = Math.ceil((nextLevelScore - score) / 5)
  return {
    level: `Lv.${level}`,
    progress,
    reviewsToNext,
    nextLevel: `Lv.${level + 1}`,
  }
})

const goodRate = computed(() => sellerStats.value?.totalReviews ? sellerStats.value.positiveRate : 0)
const ringGoodRate = computed(() => sellerStats.value?.totalReviews ? sellerStats.value.positiveRate : 93)
const totalOrders = computed(() => sellerStats.value?.completedOrders ?? 0)
const registeredText = computed(() => sellerStats.value?.registeredText ?? '1天')
const sellerIsNew = computed(() => sellerStats.value?.isNewSeller ?? false)

const segments = computed(() => {
  return Array.from({ length: 10 }, (_, i) => (i + 1) * 10 <= levelInfo.value.progress)
})

const fetchData = async () => {
  loading.value = true
  try {
    const [u, p] = await Promise.all([
      getProfile(),
      getProductList({ page: 1, pageSize: 20 }),
    ])
    user.value = u
    recentProducts.value = (p as any)?.list?.slice(0, 3) || []

    try {
      sellerStats.value = await getSellerStats(u.id)
    } catch (_e) {
      sellerStats.value = null
    }
  } catch (err: any) {
    if (err?.response?.status === 401 || err?.message?.includes('登录')) {
      userStore.clearAuth()
      router.push('/login')
    } else {
      user.value = userStore.userInfo
      recentProducts.value = []
      message.error(err?.message || '加载失败')
    }
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="min-h-screen bg-cream-50 py-8">
    <div class="container max-w-6xl">
      <n-skeleton v-if="loading" :rows="12" />

      <div v-else class="space-y-6">
        <div class="relative overflow-hidden rounded-3xl p-8 bg-gradient-primary text-white animate-fade-in-up">
          <div class="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10" />
          <div class="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-white/5" />
          <div class="absolute top-8 right-1/3 w-20 h-20 rounded-full bg-white/10 animate-float" />

          <div class="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div class="relative flex-shrink-0">
              <div class="w-[100px] h-[100px] rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-4xl font-bold border-4 border-white/30">
                {{ user?.nickname?.charAt(0) || 'L' }}
              </div>
              <div v-if="user?.isTrusted" class="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-bold shadow-lg border-2 border-white flex items-center gap-0.5">
                <Crown class="w-3 h-3" /> 诚信宝妈
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-3 mb-2">
                <h1 class="text-heading-2 font-bold">{{ user?.nickname }}</h1>
                <span v-if="user?.isExpert" class="px-3 py-0.5 rounded-full bg-white/20 text-sm font-medium">
                  <Award class="w-3.5 h-3.5 inline mr-1" /> 认证专家
                </span>
                <span class="px-3 py-0.5 rounded-full bg-white/15 text-sm font-medium">
                  {{ levelInfo.level }}
                </span>
              </div>
              <div class="flex flex-wrap items-center gap-3 text-white/90 text-sm mb-3">
                <span>📍 北京</span>
                <span>·</span>
                <span>👶 宝宝 3岁2个月</span>
                <span>·</span>
                <span>
                  <CalendarIcon class="w-3.5 h-3.5 inline mr-0.5 -mt-0.5" />
                  加入 {{ registeredText }}
                </span>
                <span v-if="sellerIsNew" class="px-2 py-0.5 rounded-full bg-amber-400 text-ink-900 font-bold shadow">
                  <Sparkles class="w-3.5 h-3.5 inline mr-0.5 -mt-0.5" />新卖家
                </span>
              </div>
              <p class="text-white/80 text-sm">{{ user?.bio }}</p>
            </div>

            <button
              class="flex-shrink-0 w-11 h-11 rounded-xl bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center"
              @click="router.push('/profile/settings')"
            >
              <Settings class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="card p-6 animate-fade-in-up">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-heading-4 text-ink-900 font-bold flex items-center gap-2">
                    <Gem class="w-5 h-5 text-lavender-500" /> 信用等级
                  </h3>
                  <p class="text-caption text-ink-500 mt-0.5">
                    距离 <span class="text-primary-500 font-bold">{{ levelInfo.nextLevel }}</span> 还差 <span class="text-primary-500 font-bold">{{ levelInfo.reviewsToNext }}</span> 个好评
                  </p>
                </div>
                <span class="text-2xl font-bold bg-gradient-lavender bg-clip-text text-transparent">
                  {{ levelInfo.level }}
                </span>
              </div>
              <div class="flex gap-1.5 mb-2">
                <div
                  v-for="(filled, idx) in segments"
                  :key="idx"
                  :class="[
                    'h-3 flex-1 rounded-full transition-all duration-500',
                    filled ? 'bg-gradient-primary' : 'bg-ink-100'
                  ]"
                  :style="{ transitionDelay: `${idx * 50}ms` }"
                />
              </div>
              <div class="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-ink-50">
                <div class="text-center">
                  <div class="text-2xl font-bold text-ink-900">{{ totalOrders }}</div>
                  <div class="text-caption text-ink-500 mt-0.5">{{ sellerIsNew ? '暂无交易' : '成交笔数' }}</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-ink-900">{{ sellerStats?.totalReviews ?? 0 }}</div>
                  <div class="text-caption text-ink-500 mt-0.5">累计评价</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-ink-900">
                    {{ sellerStats?.totalReviews ? `${goodRate}%` : '—' }}
                  </div>
                  <div class="text-caption text-ink-500 mt-0.5">好评率</div>
                </div>
              </div>
            </div>

            <div class="border-t lg:border-t-0 lg:border-l border-ink-100 pt-5 lg:pt-0 lg:pl-6 flex flex-col items-center justify-center">
              <div class="relative w-36 h-36 mb-3">
                <svg class="w-full h-full -rotate-90">
                  <circle cx="72" cy="72" r="60" fill="none" stroke="#DFE6E9" stroke-width="12" />
                  <circle
                    cx="72" cy="72" r="60" fill="none"
                    stroke="url(#ringGradient)" stroke-width="12"
                    stroke-linecap="round"
                    :stroke-dasharray="`${ringGoodRate * 3.77} 377`"
                    class="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#FF8BA7" />
                      <stop offset="100%" stop-color="#FF6B8A" />
                    </linearGradient>
                  </defs>
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-3xl font-bold text-primary-500">
                    {{ sellerStats?.totalReviews ? `${goodRate}%` : '—' }}
                  </span>
                  <span class="text-caption text-ink-500">好评率</span>
                </div>
              </div>
              <div class="w-full space-y-1.5 mb-2">
                <div v-if="!sellerIsNew" class="text-caption text-ink-600 flex justify-between">
                  <span>累计成交</span>
                  <span class="font-semibold text-primary-500 flex items-center gap-1">
                    <CheckCircle2 class="w-3.5 h-3.5" />
                    {{ totalOrders }} 单
                  </span>
                </div>
                <div v-if="sellerStats && sellerStats.totalReviews" class="text-caption text-ink-600 flex justify-between">
                  <span>好评 / 总评价</span>
                  <span class="font-semibold text-primary-500">
                    {{ sellerStats.goodReviews }} / {{ sellerStats.totalReviews }}
                  </span>
                </div>
                <div class="text-caption text-ink-600 flex justify-between">
                  <span>注册时长</span>
                  <span class="font-semibold text-primary-500">{{ registeredText }}</span>
                </div>
              </div>
              <div class="w-full">
                <div class="text-caption text-ink-700 font-medium mb-2">{{ levelInfo.level }} 特权：</div>
                <div class="space-y-1.5">
                  <div class="flex items-center gap-2 text-caption text-ink-600">
                    <Star class="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    商品优先推荐
                  </div>
                  <div class="flex items-center gap-2 text-caption text-ink-600">
                    <Star class="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    搜索排名靠前
                  </div>
                  <div class="flex items-center gap-2 text-caption text-ink-600">
                    <Star class="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    交易免佣金
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-for="(group, gIdx) in menuGroups" :key="gIdx" class="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
          <div
            v-for="menu in group"
            :key="menu.label"
            class="card-hover p-5 cursor-pointer group"
            @click="menu.route && router.push(menu.route)"
          >
            <div class="flex items-start justify-between mb-4">
              <div
                :class="[
                  'w-11 h-11 rounded-xl flex items-center justify-center text-white bg-gradient-to-br shadow-md group-hover:scale-110 transition-transform duration-200',
                  menu.color
                ]"
              >
                <component :is="menu.icon" class="w-5 h-5" />
              </div>
              <span
                v-if="menu.badge"
                :class="[
                  'h-6 px-2 rounded-full text-xs font-bold flex items-center',
                  typeof menu.badge === 'number' ? 'bg-primary-50 text-primary-500' : 'bg-mint-100 text-mint-700'
                ]"
              >
                {{ menu.badge }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-medium text-ink-900">{{ menu.label }}</span>
              <ChevronRight class="w-4 h-4 text-ink-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 card p-6 animate-fade-in-up">
            <div class="flex items-center justify-between mb-5">
              <h3 class="text-heading-4 text-ink-900 font-bold flex items-center gap-2">
                <Eye class="w-5 h-5 text-primary-500" /> 最近浏览商品
              </h3>
              <button class="text-caption text-primary-500 hover:text-primary-600 flex items-center gap-0.5" @click="router.push('/market')">
                去市场 <ChevronRight class="w-3 h-3" />
              </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                v-for="product in recentProducts"
                :key="product.id"
                class="rounded-xl border-2 border-ink-100 overflow-hidden cursor-pointer hover:border-primary-300 hover:shadow-md transition-all duration-200"
                @click="router.push(`/market/${product.id}`)"
              >
                <div class="aspect-square bg-gradient-to-br from-cream-100 to-primary-50 flex items-center justify-center text-5xl">
                  🧸
                </div>
                <div class="p-3">
                  <h4 class="text-sm text-ink-900 line-clamp-2 h-10 mb-2">{{ product.title }}</h4>
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="text-primary-500 font-bold">¥{{ product.price }}</span>
                      <span class="text-caption text-ink-300 line-through ml-1">¥{{ product.originalPrice }}</span>
                    </div>
                    <span
                      v-if="product.status === 'reserved'"
                      class="chip-primary text-xs py-0 px-2"
                    >已预定</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card p-6 animate-fade-in-up">
            <div class="flex items-center justify-between mb-5">
              <h3 class="text-heading-4 text-ink-900 font-bold flex items-center gap-2">
                <Package class="w-5 h-5 text-lavender-500" /> 最近订单
              </h3>
              <button class="text-caption text-primary-500 hover:text-primary-600 flex items-center gap-0.5" @click="router.push('/orders')">
                全部 <ChevronRight class="w-3 h-3" />
              </button>
            </div>
            <div class="space-y-3">
              <div
                v-for="(_, idx) in 2"
                :key="idx"
                class="p-3 rounded-xl bg-cream-50 hover:bg-primary-50/50 cursor-pointer transition-colors"
                @click="router.push('/orders')"
              >
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-lavender-300 to-primary-300 flex items-center justify-center text-2xl flex-shrink-0">
                    {{ ['🍼', '🎁'][idx] }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-ink-900 line-clamp-1">
                      {{ ['贝亲宽口径奶瓶 PPSU 240ml', '全新宝宝满月礼盒 8件套'][idx] }}
                    </h4>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span class="text-caption text-ink-500">订单号: {{ ['DD20240615', 'DD20240614'][idx] }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-primary-500 font-bold">¥{{ [89, 158][idx] }}</span>
                  <span :class="['chip text-xs py-0', idx === 0 ? 'chip-mint' : 'chip-lavender']">
                    {{ ['已完成', '待发货'][idx] }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
