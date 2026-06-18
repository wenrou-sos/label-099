<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, Star, ThumbsUp } from 'lucide-vue-next'
import type { Review, User } from '@shared/types'

const router = useRouter()

const loading = ref(true)
const activeTab = ref('received')
const reviews = ref<any[]>([])

const tabs = [
  { key: 'received', label: '收到的评价' },
  { key: 'given', label: '发出的评价' },
  { key: 'pending', label: '待我评价' },
]

const typeClass: Record<string, string> = {
  positive: 'chip-mint',
  neutral: 'chip-lavender',
  negative: 'chip-primary',
}
const typeLabel: Record<string, string> = {
  positive: '好评',
  neutral: '中评',
  negative: '差评',
}

const mockReviews = [
  {
    id: 1,
    type: 'positive',
    rating: 5,
    content: '卖家人特别好，沟通很耐心，商品和描述一致，包装也很仔细，下次还会来！强烈推荐给各位宝妈~',
    tags: ['描述真实', '发货迅速', '人很nice'],
    product: { id: 1, title: '9成新婴儿推车 高景观可坐可躺', price: 399, emoji: '🚗' },
    reviewer: { id: 2, nickname: '开心小宝妈', avatar: '', isTrusted: true } as User,
    reviewee: { id: 1, nickname: '幸福的小李妈妈' } as User,
    createdAt: '2024-06-14T10:00:00Z',
    helpful: 23,
  },
  {
    id: 2,
    type: 'positive',
    rating: 5,
    content: '非常满意！商品几乎全新，价格也很实惠。卖家发的顺丰，第二天就到了，太给力了！',
    tags: ['物超所值', '物流很快'],
    product: { id: 2, title: '全新宝宝围栏 16+2片 送海洋球', price: 259, emoji: '🎠' },
    reviewer: { id: 3, nickname: '汤圆麻麻', avatar: '', isTrusted: true } as User,
    reviewee: { id: 1, nickname: '幸福的小李妈妈' } as User,
    createdAt: '2024-06-10T14:30:00Z',
    helpful: 15,
  },
  {
    id: 3,
    type: 'neutral',
    rating: 3,
    content: '整体还可以，就是有一点小瑕疵，卖家也提前说明了。价格还算公道吧。',
    tags: ['瑕不掩瑜'],
    product: { id: 3, title: '费雪健身架 8成新 功能完好', price: 89, emoji: '🧸' },
    reviewer: { id: 4, nickname: '果果妈', avatar: '' } as User,
    reviewee: { id: 1, nickname: '幸福的小李妈妈' } as User,
    createdAt: '2024-06-05T09:15:00Z',
    helpful: 8,
  },
  {
    id: 4,
    type: 'positive',
    rating: 5,
    content: '买给闺蜜的宝宝的，她说非常好用！颜值也高，送人很有面子。感谢卖家的小赠品~',
    tags: ['包装精美', '适合送礼'],
    product: { id: 5, title: 'pouch餐椅 可折叠可调节', price: 199, emoji: '🪑' },
    reviewer: { id: 1, nickname: '幸福的小李妈妈', avatar: '' } as User,
    reviewee: { id: 5, nickname: '橙子妈妈' } as User,
    createdAt: '2024-05-28T16:00:00Z',
    helpful: 31,
    isGiven: true,
  },
]

const mockPending = [
  {
    id: 101,
    orderNo: 'DD20240615001',
    product: { id: 6, title: '贝亲奶瓶3个打包 160ml+240ml', price: 69, emoji: '🍼' },
    seller: { id: 6, nickname: '豆豆妈', avatar: '' },
    createdAt: '2024-06-15T12:00:00Z',
  },
  {
    id: 102,
    orderNo: 'DD20240613002',
    product: { id: 7, title: '全新宝宝满月礼盒 8件套', price: 158, emoji: '🎁' },
    seller: { id: 7, nickname: '小苹果妈妈', avatar: '' },
    createdAt: '2024-06-13T08:30:00Z',
  },
]

const filteredReviews = computed(() => {
  if (activeTab.value === 'pending') return []
  return reviews.value.filter(r =>
    activeTab.value === 'received' ? !r.isGiven : r.isGiven
  )
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

const avatarColors = [
  'from-pink-400 to-rose-500', 'from-purple-400 to-indigo-500',
  'from-blue-400 to-cyan-500', 'from-green-400 to-emerald-500',
]

const fetchReviews = async () => {
  loading.value = true
  try {
    reviews.value = mockReviews
  } finally {
    loading.value = false
  }
}

onMounted(fetchReviews)
</script>

<template>
  <div class="min-h-screen bg-cream-50 py-8">
    <div class="container max-w-4xl">
      <div class="mb-6 flex items-center gap-4">
        <button class="flex items-center gap-1 text-ink-500 hover:text-primary-500 transition-colors" @click="router.push('/profile')">
          <ChevronLeft class="w-5 h-5" /> 返回
        </button>
        <h1 class="text-heading-1 text-ink-900">我的评价</h1>
      </div>

      <div class="card p-2 mb-6 inline-flex w-full overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'h-10 px-6 rounded-xl font-medium transition-all whitespace-nowrap',
            activeTab === tab.key ? 'bg-gradient-primary text-white shadow-sm' : 'text-ink-600 hover:bg-ink-50'
          ]"
        >
          {{ tab.label }}
          <span class="ml-1.5 text-xs opacity-75">
            ({{ tab.key === 'pending' ? mockPending.length : (tab.key === 'received' ? reviews.filter(r => !r.isGiven).length : reviews.filter(r => r.isGiven).length) }})
          </span>
        </button>
      </div>

      <n-skeleton v-if="loading" :rows="6" />

      <div v-else-if="activeTab === 'pending'" class="space-y-4 stagger">
        <div
          v-for="item in mockPending"
          :key="item.id"
          class="card p-5 animate-fade-in-up"
        >
          <div class="flex items-start gap-4 mb-4">
            <div class="w-20 h-20 rounded-xl bg-gradient-to-br from-cream-100 to-primary-50 flex items-center justify-center text-4xl flex-shrink-0">
              {{ item.product.emoji }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-caption text-ink-400 mb-1">订单号: {{ item.orderNo }}</div>
              <h4 class="text-ink-900 font-medium line-clamp-2 mb-1">{{ item.product.title }}</h4>
              <div class="text-primary-500 font-bold">¥{{ item.product.price }}</div>
            </div>
          </div>
          <div class="border-t border-ink-50 pt-4">
            <div class="text-body text-ink-700 mb-3 flex items-center gap-2">
              <Star class="w-4 h-4 text-amber-400" />
              请对本次交易进行评价
            </div>
            <div class="flex gap-2 mb-4">
              <n-rate v-model:value="(item as any).rating" size="large" />
            </div>
            <textarea
              :placeholder="`分享您对「${item.seller.nickname}」的交易感受...`"
              rows="3"
              class="textarea-base mb-3"
            />
            <div class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="tag in ['描述真实', '发货迅速', '人很nice', '物超所值', '包装完好']"
                :key="tag"
                class="chip-gray cursor-pointer hover:bg-primary-50 hover:text-primary-500 transition-colors"
                @click="($event.target as HTMLElement).classList.toggle('!bg-primary-50')"
              >+ {{ tag }}</span>
            </div>
            <div class="flex justify-end">
              <button class="btn-primary h-10 px-6">提交评价</button>
            </div>
          </div>
        </div>

        <n-empty v-if="!mockPending.length" description="暂无待评价订单" />
      </div>

      <div v-else class="space-y-4 stagger">
        <div
          v-for="(review, idx) in filteredReviews"
          :key="review.id"
          class="card p-6 animate-fade-in-up"
        >
          <div class="flex items-start gap-4 mb-4">
            <div
              :class="[
                'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 bg-gradient-to-br',
                avatarColors[idx % avatarColors.length]
              ]"
            >
              {{ (activeTab === 'received' ? review.reviewer : review.reviewee)?.nickname?.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <span class="font-bold text-ink-900">
                  {{ (activeTab === 'received' ? review.reviewer : review.reviewee)?.nickname }}
                </span>
                <span v-if="(activeTab === 'received' ? review.reviewer : review.reviewee)?.isTrusted" class="trusted-badge">诚信宝妈</span>
                <span :class="[typeClass[review.type], 'ml-auto']">{{ typeLabel[review.type] }}</span>
              </div>
              <div class="flex items-center gap-2 text-caption text-ink-400">
                <n-rate :value="review.rating" readonly size="small" />
                <span>·</span>
                <span>{{ formatDate(review.createdAt) }}</span>
              </div>
            </div>
          </div>

          <div class="rounded-xl bg-cream-50 p-4 mb-4">
            <div class="flex items-start gap-3">
              <div class="w-14 h-14 rounded-lg bg-gradient-to-br from-cream-100 to-primary-50 flex items-center justify-center text-3xl flex-shrink-0">
                {{ review.product.emoji }}
              </div>
              <div class="flex-1 min-w-0 pt-0.5">
                <div class="text-caption text-ink-400 mb-0.5">
                  {{ activeTab === 'received' ? '售出商品' : '购买商品' }}
                </div>
                <h5 class="text-sm text-ink-900 line-clamp-1">{{ review.product.title }}</h5>
                <div class="text-primary-500 font-bold text-sm mt-0.5">¥{{ review.product.price }}</div>
              </div>
            </div>
          </div>

          <p class="text-body text-ink-700 leading-6 mb-4">{{ review.content }}</p>

          <div v-if="review.tags?.length" class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="tag in review.tags"
              :key="tag"
              class="chip-lavender"
            >{{ tag }}</span>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-ink-50">
            <div class="flex items-center gap-4 text-caption text-ink-400">
              <button
                class="flex items-center gap-1 hover:text-primary-500 transition-colors"
                @click="(review as any).helpful++"
              >
                <ThumbsUp class="w-4 h-4" />
                <span>有用 ({{ review.helpful }})</span>
              </button>
            </div>
            <button
              class="text-caption text-primary-500 hover:text-primary-600 font-medium"
              @click="router.push(`/market/${review.product.id}`)"
            >查看商品</button>
          </div>
        </div>

        <n-empty v-if="!loading && filteredReviews.length === 0" description="暂无评价" />
      </div>
    </div>
  </div>
</template>
