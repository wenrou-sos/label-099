<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, Edit3, Eye, Heart, Trash2, Plus } from 'lucide-vue-next'
import { useMessage } from 'naive-ui'
import type { Product } from '@shared/types'

const router = useRouter()
const message = useMessage()

const loading = ref(true)
const activeTab = ref('available')
const products = ref<Product[]>([])

const tabs = [
  { key: 'available', label: '在售中' },
  { key: 'reserved', label: '已预定' },
  { key: 'sold', label: '已售出' },
  { key: 'offline', label: '已下架' },
]

const statusMap: Record<string, { label: string; class: string }> = {
  available: { label: '在售', class: 'chip-mint' },
  reserved: { label: '已预定', class: 'chip-lavender' },
  sold: { label: '已售出', class: 'chip-gray' },
  offline: { label: '已下架', class: 'chip-gray' },
}

const mockProducts: Product[] = [
  { id: 1, title: '9成新婴儿推车 高景观可坐可躺 送雨罩', images: [], price: 399, originalPrice: 1299, status: 'available', viewCount: 234, favoriteCount: 45, condition: 'like_new', category: 'baby_gear' } as any,
  { id: 2, title: '全新宝宝围栏 16+2片 送海洋球收纳袋', images: [], price: 259, originalPrice: 599, status: 'available', viewCount: 189, favoriteCount: 32, condition: 'new', category: 'baby_gear' } as any,
  { id: 3, title: '费雪健身架 8成新 功能完好', images: [], price: 89, originalPrice: 299, status: 'reserved', viewCount: 456, favoriteCount: 78, condition: 'good', category: 'baby_toys' } as any,
  { id: 4, title: '优衣库宝宝连体衣 5件打包 66码', images: [], price: 59, originalPrice: 250, status: 'sold', viewCount: 567, favoriteCount: 23, condition: 'like_new', category: 'baby_clothes' } as any,
  { id: 5, title: 'pouch餐椅 可折叠可调节', images: [], price: 199, originalPrice: 599, status: 'sold', viewCount: 678, favoriteCount: 91, condition: 'good', category: 'baby_gear' } as any,
  { id: 6, title: '贝亲奶瓶3个打包 160ml+240ml', images: [], price: 69, originalPrice: 180, status: 'offline', viewCount: 123, favoriteCount: 12, condition: 'like_new', category: 'baby_feeding' } as any,
]

const emojiMap: Record<string, string> = {
  baby_clothes: '👕', baby_food: '🍼', baby_toys: '🧸',
  baby_gear: '🚗', maternity: '🤰', diapers: '🧷', other: '🎁',
}

const filteredProducts = computed(() =>
  products.value.filter(p => {
    const status = (p as any).status as string
    if (activeTab.value === 'available') return status === 'available'
    if (activeTab.value === 'reserved') return status === 'reserved'
    if (activeTab.value === 'sold') return status === 'sold'
    return status === 'offline'
  })
)

const fetchProducts = async () => {
  loading.value = true
  try {
    products.value = mockProducts
  } finally {
    loading.value = false
  }
}

const handleEdit = (id: number, e: Event) => {
  e.stopPropagation()
  message.info('编辑功能开发中')
}

const handleDelete = (id: number, e: Event) => {
  e.stopPropagation()
  products.value = products.value.filter(p => p.id !== id)
  message.success('已删除')
}

onMounted(fetchProducts)
</script>

<template>
  <div class="min-h-screen bg-cream-50 py-8">
    <div class="container max-w-6xl">
      <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button class="flex items-center gap-1 text-ink-500 hover:text-primary-500 transition-colors" @click="router.push('/profile')">
            <ChevronLeft class="w-5 h-5" /> 返回
          </button>
          <h1 class="text-heading-1 text-ink-900">我的商品</h1>
        </div>
        <button class="btn-primary h-11 px-5" @click="router.push('/market/publish')">
          <Plus class="w-4 h-4" /> 发布商品
        </button>
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
            ({{ products.filter(p => { const s = (p as any).status as string; return tab.key === 'available' ? s === 'available' : tab.key === 'reserved' ? s === 'reserved' : tab.key === 'sold' ? s === 'sold' : s === 'offline' }).length }})
          </span>
        </button>
      </div>

      <n-skeleton v-if="loading" :rows="6" />

      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="card-hover overflow-hidden cursor-pointer group animate-fade-in-up"
          @click="router.push(`/market/${product.id}`)"
        >
          <div class="relative">
            <div class="aspect-square bg-gradient-to-br from-cream-100 to-primary-50 flex items-center justify-center text-6xl">
              {{ emojiMap[product.category] || '🎁' }}
            </div>
            <div class="absolute top-2 left-2">
              <span :class="[statusMap[product.status].class, 'text-xs py-0 px-2']">
                {{ statusMap[product.status].label }}
              </span>
            </div>
            <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                class="w-8 h-8 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white shadow-md"
                @click="handleEdit(product.id, $event)"
              >
                <Edit3 class="w-4 h-4 text-ink-600" />
              </button>
              <button
                class="w-8 h-8 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center hover:bg-red-50 shadow-md"
                @click="handleDelete(product.id, $event)"
              >
                <Trash2 class="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
          <div class="p-4">
            <h4 class="text-sm text-ink-900 line-clamp-2 h-10 mb-3">{{ product.title }}</h4>
            <div class="flex items-end justify-between mb-2">
              <div>
                <span class="text-primary-500 font-bold text-xl">¥{{ product.price }}</span>
                <span class="text-caption text-ink-300 line-through ml-1">¥{{ product.originalPrice }}</span>
              </div>
            </div>
            <div class="flex items-center gap-3 text-caption text-ink-400">
              <span class="flex items-center gap-0.5"><Eye class="w-3 h-3" /> {{ product.viewCount }}</span>
              <span class="flex items-center gap-0.5"><Heart class="w-3 h-3" /> {{ product.favoriteCount }}</span>
            </div>
          </div>
        </div>

        <div
          v-if="filteredProducts.length === 0"
          class="col-span-full py-16"
        >
          <n-empty description="暂无商品" />
        </div>
      </div>
    </div>
  </div>
</template>
