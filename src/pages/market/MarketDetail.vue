<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  NCarousel,
  NTabs,
  NTabPane,
  NSkeleton,
  NButton,
  NAvatar,
  NIcon,
  NRate,
  useMessage,
} from 'naive-ui'
import {
  MessageCircle,
  Heart,
  ShoppingCart,
  Eye,
  CheckCircle2,
  Home,
  ChevronRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { getProduct, favoriteProduct, createProduct } from '@/api/product'
import { createOrder } from '@/api/order'
import type { Product, ProductCategory, ProductCondition } from '../../../shared/types'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

const loading = ref(true)
const product = ref<Product | null>(null)
const favorited = ref(false)
const favoriteLoading = ref(false)
const descExpanded = ref(false)
const buyingLoading = ref(false)
const currentTab = ref('detail')

const categoryEmojiMap: Record<ProductCategory | string, { emoji: string; gradient: string }> = {
  baby_clothes: { emoji: '👕', gradient: 'from-pink-200 to-rose-300' },
  baby_food: { emoji: '🍼', gradient: 'from-amber-200 to-orange-300' },
  baby_toys: { emoji: '🧸', gradient: 'from-purple-200 to-violet-300' },
  baby_gear: { emoji: '🚼', gradient: 'from-blue-200 to-cyan-300' },
  maternity: { emoji: '🤱', gradient: 'from-fuchsia-200 to-pink-300' },
  diapers: { emoji: '👶', gradient: 'from-green-200 to-emerald-300' },
  other: { emoji: '🎁', gradient: 'from-slate-200 to-gray-300' },
  carseat: { emoji: '💺', gradient: 'from-indigo-200 to-blue-300' },
  crib: { emoji: '🛏️', gradient: 'from-teal-200 to-cyan-300' },
  books: { emoji: '📚', gradient: 'from-yellow-200 to-amber-300' },
}

const conditionClassMap: Record<ProductCondition, string> = {
  new: 'condition-new',
  like_new: 'condition-like-new',
  good: 'condition-light',
  fair: 'condition-heavy',
}

const conditionTextMap: Record<ProductCondition, string> = {
  new: '全新',
  like_new: '99新',
  good: '轻微使用',
  fair: '明显使用',
}

const conditionDetailMap: Record<ProductCondition, { emoji: string; title: string; desc: string }> = {
  new: { emoji: '✨', title: '全新未拆封', desc: '未开箱 / 未使用 / 配件齐全 / 包装完好' },
  like_new: { emoji: '💎', title: '几乎全新', desc: '仅试用过 / 无任何磨损 / 包装完整 / 配件齐全' },
  good: { emoji: '🌿', title: '轻微使用痕迹', desc: '功能完好无损 / 外观有不明显微瑕 / 不影响使用' },
  fair: { emoji: '🍂', title: '明显使用痕迹', desc: '正常使用中 / 外观有明显磨损 / 功能完全正常' },
}

const categoryDisplay = computed(() => {
  if (!product.value) return categoryEmojiMap['other']
  const cat = product.value.category as string
  return categoryEmojiMap[cat] || categoryEmojiMap['other']
})

const discount = computed(() => {
  if (!product.value || !product.value.originalPrice) return null
  const rate = (product.value.price / product.value.originalPrice) * 10
  return rate.toFixed(1) + '折'
})

const savedAmount = computed(() => {
  if (!product.value) return 0
  return product.value.originalPrice - product.value.price
})

const creditLevel = computed(() => {
  const score = product.value?.seller?.creditScore ?? 0
  return Math.min(Math.floor(score / 20) + 1, 5)
})

const reviewCount = computed(() => {
  return product.value?.seller?.creditScore ? Math.floor(product.value.seller.creditScore / 10) : 12
})

const positiveRate = computed(() => {
  const score = product.value?.seller?.creditScore ?? 80
  return Math.min(99, 70 + score / 5)
})

async function fetchProduct() {
  loading.value = true
  try {
    const id = Number(route.params.id)
    product.value = await getProduct(id)
    favorited.value = product.value.isFavorited ?? false
  } catch (e: any) {
    message.error(e?.message || '加载商品失败')
  } finally {
    loading.value = false
  }
}

async function handleFavorite() {
  if (!product.value || favoriteLoading.value) return
  favoriteLoading.value = true
  try {
    await favoriteProduct(product.value.id)
    favorited.value = !favorited.value
    message.success(favorited.value ? '已加入收藏' : '已取消收藏')
  } finally {
    favoriteLoading.value = false
  }
}

async function handleBuyNow() {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  if (!product.value) return
  buyingLoading.value = true
  try {
    const order = await createOrder({
      productId: product.value.id,
      address: '测试地址',
      phone: '13800138000',
      receiverName: userStore.userInfo?.nickname || '买家',
    })
    message.success('下单成功，正在跳转...')
    setTimeout(() => router.push(`/orders/${order.id}`), 1500)
  } catch (e: any) {
    message.error(e?.message || '下单失败')
  } finally {
    buyingLoading.value = false
  }
}

function handleWant() {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  handleFavorite()
  message.info('已关注，卖家可能会联系你哦～')
}

onMounted(fetchProduct)
</script>

<template>
  <div class="min-h-screen bg-cream-50 py-6 px-4 md:px-6 lg:px-8">
    <div class="max-w-[1200px] mx-auto">
      <nav class="flex items-center gap-2 text-caption text-ink-500 mb-6">
        <NIcon><Home /></NIcon>
        <span class="cursor-pointer hover:text-primary-500" @click="router.push('/')">首页</span>
        <NIcon :size="14"><ChevronRight /></NIcon>
        <span class="cursor-pointer hover:text-primary-500" @click="router.push('/market')">闲置市场</span>
        <NIcon :size="14"><ChevronRight /></NIcon>
        <span class="text-ink-900 font-medium truncate max-w-[200px]">{{ product?.title || '商品详情' }}</span>
      </nav>

      <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        <div class="space-y-6">
          <NSkeleton animated height="480px" class="!rounded-2xl" />
          <NSkeleton animated text round :repeat="6" />
        </div>
        <div class="space-y-4">
          <NSkeleton animated height="200px" class="!rounded-2xl" />
          <NSkeleton animated height="280px" class="!rounded-2xl" />
        </div>
      </div>

      <template v-else-if="product">
        <div class="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
          <div class="space-y-6">
            <div class="card overflow-hidden">
              <NCarousel
                :show-dots="true"
                dot-type="line"
                :autoplay="false"
                height="480px"
                effect="fade"
              >
                <div
                  v-for="(img, idx) in (product.images.length ? product.images : [null])"
                  :key="idx"
                  class="w-full h-full flex items-center justify-center bg-ink-50"
                >
                  <img
                    v-if="img"
                    :src="img"
                    class="w-full h-full object-contain"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center bg-gradient-to-br"
                    :class="categoryDisplay.gradient"
                  >
                    <span class="text-9xl">{{ categoryDisplay.emoji }}</span>
                  </div>
                </div>
              </NCarousel>
              <div v-if="product.images.length > 1" class="p-4 border-t border-ink-50 flex gap-2 overflow-x-auto">
                <div
                  v-for="(img, idx) in product.images"
                  :key="idx"
                  class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary-300 cursor-pointer"
                >
                  <img :src="img" class="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <div class="card p-6 space-y-5">
              <div class="flex items-start gap-4">
                <div
                  class="p-3 rounded-xl shrink-0"
                  :class="[
                    product.condition === 'new' ? 'bg-mint-100' :
                    product.condition === 'like_new' ? 'bg-blue-50' :
                    product.condition === 'good' ? 'bg-orange-50' : 'bg-ink-100'
                  ]"
                >
                  <span class="text-3xl">{{ conditionDetailMap[product.condition].emoji }}</span>
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-1">
                    <span :class="conditionClassMap[product.condition]" class="!text-body !px-3 !py-1">
                      {{ conditionTextMap[product.condition] }}
                    </span>
                    <span class="text-heading-3 text-ink-900">{{ conditionDetailMap[product.condition].title }}</span>
                  </div>
                  <p class="text-body text-ink-500">{{ conditionDetailMap[product.condition].desc }}</p>
                </div>
              </div>

              <h1 class="text-heading-2 text-ink-900 leading-tight">{{ product.title }}</h1>

              <div class="relative">
                <div
                  class="text-body text-ink-700 leading-relaxed whitespace-pre-wrap transition-all"
                  :class="descExpanded ? '' : 'line-clamp-3'"
                >
                  {{ product.description }}
                </div>
                <button
                  v-if="product.description.length > 60"
                  class="mt-2 flex items-center gap-1 text-primary-500 text-body font-medium hover:text-primary-600"
                  @click="descExpanded = !descExpanded"
                >
                  <span>{{ descExpanded ? '收起详情' : '展开详情' }}</span>
                  <NIcon size="14">
                    <ChevronUp v-if="descExpanded" />
                    <ChevronDown v-else />
                  </NIcon>
                </button>
              </div>
            </div>

            <div v-if="product.images.length > 1" class="card p-6">
              <h3 class="text-heading-4 text-ink-900 mb-4">📷 商品图片</h3>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div
                  v-for="(img, idx) in product.images"
                  :key="idx"
                  class="aspect-square rounded-xl overflow-hidden border border-ink-100"
                >
                  <img :src="img" class="w-full h-full object-cover hover:scale-105 transition-transform" />
                </div>
              </div>
            </div>

            <div class="card overflow-hidden">
              <NTabs v-model:value="currentTab" size="large">
                <NTabPane name="detail" tab="商品详情">
                  <div class="p-6 space-y-4">
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div class="p-4 rounded-xl bg-ink-50">
                        <div class="text-caption text-ink-400 mb-1">浏览量</div>
                        <div class="text-heading-3 text-ink-900 flex items-center gap-1">
                          <NIcon :size="18" class="text-primary-500"><Eye /></NIcon>
                          {{ product.viewCount }}
                        </div>
                      </div>
                      <div class="p-4 rounded-xl bg-ink-50">
                        <div class="text-caption text-ink-400 mb-1">收藏数</div>
                        <div class="text-heading-3 text-ink-900 flex items-center gap-1">
                          <NIcon :size="18" class="text-primary-500"><Heart /></NIcon>
                          {{ product.favoriteCount }}
                        </div>
                      </div>
                      <div class="p-4 rounded-xl bg-ink-50">
                        <div class="text-caption text-ink-400 mb-1">发布时间</div>
                        <div class="text-heading-3 text-ink-900 text-base">
                          {{ new Date(product.createdAt).toLocaleDateString() }}
                        </div>
                      </div>
                    </div>
                    <div v-if="product.location" class="p-4 rounded-xl bg-mint-50 flex items-center gap-3">
                      <span class="text-2xl">📍</span>
                      <div>
                        <div class="text-body font-medium text-ink-900">{{ product.location }}</div>
                        <div class="text-caption text-ink-500">支持同城面交，当面验货更放心</div>
                      </div>
                    </div>
                  </div>
                </NTabPane>
                <NTabPane name="reviews" tab="卖家评价">
                  <div class="p-6 space-y-4">
                    <div class="flex items-center gap-6 p-4 rounded-xl bg-ink-50">
                      <div class="text-center">
                        <div class="text-3xl font-bold text-primary-500">{{ positiveRate.toFixed(1) }}%</div>
                        <div class="text-caption text-ink-500 mt-1">好评率</div>
                      </div>
                      <div class="flex-1 space-y-1">
                        <div class="flex items-center gap-2">
                          <NRate :value="5" readonly size="small" />
                          <div class="flex-1 h-2 bg-ink-200 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-primary rounded-full" style="width: 85%"></div>
                          </div>
                          <span class="text-caption text-ink-500 w-8">85%</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <NRate :value="4" readonly size="small" />
                          <div class="flex-1 h-2 bg-ink-200 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-primary rounded-full" style="width: 12%"></div>
                          </div>
                          <span class="text-caption text-ink-500 w-8">12%</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <NRate :value="3" readonly size="small" />
                          <div class="flex-1 h-2 bg-ink-200 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-primary rounded-full" style="width: 3%"></div>
                          </div>
                          <span class="text-caption text-ink-500 w-8">3%</span>
                        </div>
                      </div>
                    </div>

                    <div class="space-y-4">
                      <div v-for="i in 3" :key="i" class="p-4 rounded-xl border border-ink-100">
                        <div class="flex items-center gap-3 mb-3">
                          <NAvatar round :size="36">{{ '宝妈' + i }}</NAvatar>
                          <div class="flex-1">
                            <div class="flex items-center gap-2">
                              <span class="text-body font-medium text-ink-900">快乐宝妈{{ i }}号</span>
                              <span v-if="i === 1" class="trusted-badge">诚信</span>
                            </div>
                            <div class="text-caption text-ink-400">2025-0{{ i }}-{{ 10 + i * 2 }}</div>
                          </div>
                          <NRate :value="5" readonly size="small" />
                        </div>
                        <p class="text-body text-ink-700 leading-relaxed">
                          {{ ['商品很新，包装完整，卖家很耐心解答问题，同城面交很顺利，下次还来！',
                              '快递很快，东西和描述一致，孩子很喜欢，价格也实惠，好评！',
                              '成色确实不错，几乎看不出使用痕迹，性价比很高，推荐给大家！'][i - 1] }}
                        </p>
                      </div>
                    </div>
                  </div>
                </NTabPane>
              </NTabs>
            </div>
          </div>

          <div class="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <div class="card p-6">
              <div class="flex items-end gap-3 mb-2">
                <span class="price-tag text-4xl">¥{{ product.price }}</span>
                <span class="price-origin mb-2 text-base">¥{{ product.originalPrice }}</span>
                <span
                  v-if="discount"
                  class="mb-2 inline-flex items-center px-2 py-1 rounded-lg text-caption font-bold bg-primary-50 text-primary-600"
                >
                  {{ discount }}
                </span>
              </div>
              <div class="flex items-center gap-2 mb-1">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-mint-100 text-mint-700 text-caption font-bold">
                  <CheckCircle2 class="w-3.5 h-3.5" />
                  已省 ¥{{ savedAmount }}
                </span>
              </div>
              <div class="h-px bg-ink-50 my-4" />
              <div class="flex flex-wrap gap-2">
                <span v-if="product.location" class="chip-mint">📍 {{ product.location }}</span>
                <span class="chip-lavender">📦 快递可寄</span>
                <span class="chip-gray">
                  <NIcon :size="14"><Eye /></NIcon>
                  {{ product.viewCount }} 次浏览
                </span>
              </div>
            </div>

            <div class="card p-6">
              <div class="flex items-center gap-4 mb-5">
                <NAvatar round :size="60" :src="product.seller?.avatar">
                  {{ product.seller?.nickname?.charAt(0) || product.seller?.username?.charAt(0) || '用' }}
                </NAvatar>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-heading-4 text-ink-900 truncate">
                      {{ product.seller?.nickname || product.seller?.username }}
                    </span>
                    <span v-if="product.seller?.isTrusted" class="trusted-badge shrink-0">诚信宝妈</span>
                  </div>
                  <div class="flex items-center gap-2 text-caption text-ink-500">
                    <span class="text-amber-500 font-bold">⭐️Lv{{ creditLevel }}</span>
                    <span>·</span>
                    <span>好评率 {{ positiveRate.toFixed(0) }}%</span>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-2 mb-5">
                <div class="text-center p-3 rounded-xl bg-primary-50">
                  <div class="text-heading-3 text-primary-600">{{ reviewCount }}</div>
                  <div class="text-caption text-ink-500 mt-0.5">好评</div>
                </div>
                <div class="text-center p-3 rounded-xl bg-mint-50">
                  <div class="text-heading-3 text-mint-700">28</div>
                  <div class="text-caption text-ink-500 mt-0.5">在售</div>
                </div>
                <div class="text-center p-3 rounded-xl bg-lavender-50">
                  <div class="text-heading-3 text-lavender-700">156</div>
                  <div class="text-caption text-ink-500 mt-0.5">成交</div>
                </div>
              </div>

              <div class="flex items-center gap-3 p-3 rounded-xl bg-ink-50">
                <div class="relative w-12 h-12 flex-shrink-0">
                  <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#DFE6E9" stroke-width="3" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none" stroke="#FF6B8A" stroke-width="3"
                      :stroke-dasharray="`${positiveRate}, 100`"
                      stroke-linecap="round"
                    />
                  </svg>
                  <div class="absolute inset-0 flex items-center justify-center text-caption font-bold text-primary-600">
                    {{ positiveRate.toFixed(0) }}%
                  </div>
                </div>
                <div class="flex-1">
                  <div class="text-body font-medium text-ink-900">卖家信誉良好</div>
                  <div class="text-caption text-ink-500">近30天成交 {{ reviewCount }} 单，无差评</div>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex gap-3">
                <NButton size="large" secondary class="flex-1 !h-12" @click="handleWant">
                  <NIcon :size="18" :class="favorited ? 'text-primary-500' : ''">
                    <Heart :fill="favorited ? 'currentColor' : 'none'" />
                  </NIcon>
                  我想要
                </NButton>
                <NButton size="large" secondary class="flex-1 !h-12" @click="message.info('聊天功能开发中')">
                  <NIcon :size="18"><MessageCircle /></NIcon>
                  聊一聊
                </NButton>
              </div>
              <NButton type="primary" size="large" class="w-full !h-14 text-lg" :loading="buyingLoading" @click="handleBuyNow">
                <NIcon :size="20"><ShoppingCart /></NIcon>
                立即购买 · ¥{{ product.price }}
              </NButton>
            </div>

            <div class="card p-4 bg-gradient-to-br from-primary-50 to-mint-50 border border-primary-100">
              <div class="flex items-start gap-3">
                <NIcon :size="20" class="text-primary-500 mt-0.5"><ShieldCheck /></NIcon>
                <div>
                  <div class="text-body font-medium text-ink-900 mb-1">平台担保交易 🔒</div>
                  <div class="text-caption text-ink-500 leading-relaxed">
                    付款先到平台托管，确认收货后才打款给卖家。遇到问题可申请平台介入，保障您的权益。
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
