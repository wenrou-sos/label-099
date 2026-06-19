<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NAvatar, NSkeleton, NButton, NIcon, useMessage, NPagination, NEmpty, NTabs, NTabPane
} from 'naive-ui'
import {
  Home, ChevronRight, Crown, Award, Calendar, Handshake,
  CheckCircle2, Sparkles, FileEdit, Star
} from 'lucide-vue-next'
import { getUser, getUserProducts, getUserPosts, getSellerStats } from '@/api/user'
import type { User, Product, Post, SellerStats } from '@shared/types'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

const loading = ref(true)
const user = ref<(User & { postCount: number; productCount: number; buyerOrderCount: number }) | null>(null)
const sellerStats = ref<SellerStats | null>(null)
const products = ref<Product[]>([])
const posts = ref<Post[]>([])
const activeTab = ref<'products' | 'posts'>('products')
const productPage = ref(1)
const productTotal = ref(0)
const productPageSize = 12
const postPage = ref(1)
const postTotal = ref(0)
const postPageSize = 10

const userId = computed(() => Number(route.params.id))
const isSelf = computed(() => userStore.isLoggedIn && userStore.userInfo?.id === userId.value)
const creditLevel = computed(() => {
  const score = user.value?.creditScore ?? 0
  return Math.min(Math.floor(score / 20) + 1, 5)
})
const realPositiveRate = computed(() => {
  if (!sellerStats.value) return 0
  if (sellerStats.value.totalReviews === 0) return 0
  return sellerStats.value.positiveRate
})
const sellerCompletedOrders = computed(() => sellerStats.value?.completedOrders ?? 0)
const sellerRegisteredText = computed(() => sellerStats.value?.registeredText ?? '1天')
const sellerIsNew = computed(() => sellerStats.value?.isNewSeller ?? true)
const ringProgress = computed(() => sellerIsNew.value ? 0 : realPositiveRate.value)
const ringLabel = computed(() => sellerIsNew.value ? '—' : `${realPositiveRate.value.toFixed(0)}%`)

async function fetchAll() {
  loading.value = true
  try {
    const uid = userId.value
    const [u, s] = await Promise.all([
      getUser(uid),
      getSellerStats(uid),
    ])
    user.value = u
    sellerStats.value = s
    await Promise.all([fetchProducts(), fetchPosts()])
  } catch (e: any) {
    message.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

async function fetchProducts() {
  try {
    const res = await getUserProducts(userId.value, { page: productPage.value, pageSize: productPageSize })
    products.value = (res as any).list ?? []
    productTotal.value = (res as any).total ?? 0
  } catch {
    products.value = []
    productTotal.value = 0
  }
}

async function fetchPosts() {
  try {
    const res = await getUserPosts(userId.value, { page: postPage.value, pageSize: postPageSize })
    posts.value = (res as any).list ?? []
    postTotal.value = (res as any).total ?? 0
  } catch {
    posts.value = []
    postTotal.value = 0
  }
}

watch(productPage, fetchProducts)
watch(postPage, fetchPosts)

watch(() => route.params.id, () => {
  productPage.value = 1
  postPage.value = 1
  fetchAll()
})

onMounted(fetchAll)
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
        <span class="text-ink-900 font-medium truncate max-w-[200px]">
          {{ user ? user.nickname || user.username : '卖家主页' }}
        </span>
      </nav>

      <div v-if="loading" class="space-y-6">
        <NSkeleton animated height="200px" class="!rounded-3xl" />
        <NSkeleton animated height="500px" class="!rounded-2xl" />
      </div>

      <template v-else-if="user">
        <div class="relative overflow-hidden rounded-3xl p-8 mb-6 bg-gradient-primary text-white animate-fade-in-up">
          <div class="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10" />
          <div class="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-white/5" />

          <div class="relative flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div class="relative flex-shrink-0">
              <div class="w-[100px] h-[100px] rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-4xl font-bold border-4 border-white/30 overflow-hidden">
                <NAvatar round :size="100" :src="user.avatar">
                  {{ user.nickname?.charAt(0) || user.username?.charAt(0) || 'U' }}
                </NAvatar>
              </div>
              <div v-if="user.isTrusted" class="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-bold shadow-lg border-2 border-white flex items-center gap-0.5">
                <Crown class="w-3 h-3" /> 诚信
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-3 mb-2">
                <h1 class="text-heading-2 font-bold truncate">{{ user.nickname || user.username }}</h1>
                <span v-if="user.isExpert" class="px-3 py-0.5 rounded-full bg-white/20 text-sm font-medium">
                  <Award class="w-3.5 h-3.5 inline mr-1" /> 认证专家
                </span>
                <span v-if="sellerIsNew" class="px-3 py-0.5 rounded-full bg-amber-400 text-ink-900 text-sm font-bold shadow">
                  <Sparkles class="w-3.5 h-3.5 inline mr-1" /> 新卖家
                </span>
                <span class="px-3 py-0.5 rounded-full bg-white/15 text-sm font-medium">
                  Lv{{ creditLevel }}
                </span>
              </div>
              <div class="flex flex-wrap items-center gap-3 text-white/90 text-sm mb-3">
                <span>
                  <Calendar class="w-3.5 h-3.5 inline-block mr-0.5 -mt-0.5" />
                  加入 {{ sellerRegisteredText }}
                </span>
                <span v-if="!sellerIsNew">·</span>
                <span v-if="!sellerIsNew">
                  <CheckCircle2 class="w-3.5 h-3.5 inline-block mr-0.5 -mt-0.5" />
                  累计成交 {{ sellerCompletedOrders }} 笔
                </span>
                <span v-if="!sellerIsNew && sellerStats && sellerStats.totalReviews > 0">·</span>
                <span v-if="!sellerIsNew && sellerStats && sellerStats.totalReviews > 0">
                  <Star class="w-3.5 h-3.5 inline-block mr-0.5 -mt-0.5" />
                  好评率 {{ realPositiveRate.toFixed(1) }}%（{{ sellerStats.goodReviews }}/{{ sellerStats.totalReviews }}）
                </span>
              </div>
              <p v-if="user.bio" class="text-white/80 text-sm">{{ user.bio }}</p>
            </div>

            <div class="flex-shrink-0 flex flex-col items-center justify-center">
              <div class="relative w-28 h-28 mb-2">
                <svg class="w-full h-full -rotate-90">
                  <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="10" />
                  <circle
                    cx="56" cy="56" r="48" fill="none"
                    stroke="url(#ringGradientUser)" stroke-width="10"
                    stroke-linecap="round"
                    :stroke-dasharray="`${ringProgress * 3.01} 301`"
                    class="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="ringGradientUser" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#FFD166" />
                      <stop offset="100%" stop-color="#FF6B8A" />
                    </linearGradient>
                  </defs>
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-2xl font-bold text-white">{{ ringLabel }}</span>
                  <span class="text-[10px] text-white/80">好评率</span>
                </div>
              </div>
              <button
                v-if="!isSelf"
                class="w-full mt-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-medium transition-colors"
                @click="message.info('聊天功能开发中')"
              >
                <Handshake class="w-4 h-4 inline mr-1 -mt-0.5" />
                联系TA
              </button>
            </div>
          </div>

          <div class="relative grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
            <div class="text-center">
              <div class="text-2xl font-bold">{{ user.productCount || 0 }}</div>
              <div class="text-xs text-white/80 mt-1">在售商品</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ sellerCompletedOrders }}</div>
              <div class="text-xs text-white/80 mt-1">成交订单</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ user.postCount || 0 }}</div>
              <div class="text-xs text-white/80 mt-1">社区帖子</div>
            </div>
          </div>
        </div>

        <div class="card overflow-hidden">
          <NTabs v-model:value="activeTab" size="large" type="line">
            <NTabPane name="products" :tab="`在售商品（${productTotal}）`">
              <div class="p-6">
                <div v-if="products.length === 0" class="py-16">
                  <NEmpty description="暂无在售商品">
                    <template #icon>🛒</template>
                  </NEmpty>
                </div>

                <div v-else class="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 stagger">
                  <div
                    v-for="product in products"
                    :key="product.id"
                    class="card overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                    @click="router.push(`/market/${product.id}`)"
                  >
                    <div class="aspect-square bg-gradient-to-br from-cream-100 to-primary-50 flex items-center justify-center text-6xl relative overflow-hidden">
                      <template v-if="product.images && product.images.length > 0">
                        <img :src="product.images[0]" class="w-full h-full object-cover" />
                      </template>
                      <template v-else>
                        <span>🧸</span>
                      </template>
                      <span
                        v-if="product.status === 'reserved'"
                        class="absolute top-2 left-2 chip-primary text-xs py-0 px-2"
                      >已预定</span>
                    </div>
                    <div class="p-4">
                      <h4 class="text-sm text-ink-900 line-clamp-2 h-10 mb-2">{{ product.title }}</h4>
                      <div class="flex items-center justify-between">
                        <div>
                          <span class="price-tag text-lg">¥{{ product.price }}</span>
                          <span v-if="product.originalPrice" class="text-caption text-ink-300 line-through ml-1">
                            ¥{{ product.originalPrice }}
                          </span>
                        </div>
                      </div>
                      <div class="flex items-center gap-3 mt-2 text-caption text-ink-400">
                        <span>👁 {{ product.viewCount || 0 }}</span>
                        <span>❤ {{ product.favoriteCount || 0 }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="productTotal > 0" class="flex justify-center mt-10">
                  <NPagination
                    v-model:page="productPage"
                    :page-size="productPageSize"
                    :item-count="productTotal"
                    size="large"
                  />
                </div>
              </div>
            </NTabPane>

            <NTabPane name="posts" :tab="`社区帖子（${postTotal}）`">
              <div class="p-6">
                <div v-if="posts.length === 0" class="py-16">
                  <NEmpty description="暂无帖子">
                    <template #icon>
                      <FileEdit class="w-12 h-12 text-ink-300" />
                    </template>
                  </NEmpty>
                </div>

                <div v-else class="space-y-4">
                  <div
                    v-for="post in posts"
                    :key="post.id"
                    class="card p-5 cursor-pointer hover:shadow-md transition-all group"
                    @click="router.push(`/community/${post.id}`)"
                  >
                    <div class="flex items-start justify-between gap-4 mb-2">
                      <h3 class="text-heading-4 font-semibold text-ink-900 line-clamp-2 group-hover:text-primary-500 transition-colors flex-1">
                        {{ post.title }}
                      </h3>
                      <span class="chip-lavender text-xs py-0 px-2 flex-shrink-0">{{ post.category }}</span>
                    </div>
                    <p class="text-body text-ink-500 line-clamp-2 mb-3">{{ post.content }}</p>
                    <div class="flex items-center gap-4 text-caption text-ink-400">
                      <span>❤ {{ post.likeCount || 0 }}</span>
                      <span>💬 {{ post.commentCount || 0 }}</span>
                      <span>👁 {{ post.viewCount || 0 }}</span>
                      <span>{{ new Date(post.createdAt).toLocaleDateString() }}</span>
                    </div>
                  </div>
                </div>

                <div v-if="postTotal > 0" class="flex justify-center mt-10">
                  <NPagination
                    v-model:page="postPage"
                    :page-size="postPageSize"
                    :item-count="postTotal"
                    size="large"
                  />
                </div>
              </div>
            </NTabPane>
          </NTabs>
        </div>
      </template>
    </div>
  </div>
</template>
