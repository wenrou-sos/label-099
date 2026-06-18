<script setup lang="ts">
import { ref, computed, watch, onMounted, h } from 'vue'
import {
  NSkeleton,
  NSlider,
  NSelect,
  NSwitch,
  NPagination,
  NIcon,
  NInput,
} from 'naive-ui'
import {
  Grid2x2,
  List,
  Search,
  Home,
  ChevronRight,
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import ProductCard from '@/components/product/ProductCard.vue'
import { getProductList } from '@/api/product'
import type { Product, ProductCategory, ProductCondition } from '../../../shared/types'

const router = useRouter()
const loading = ref(false)
const products = ref<Product[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const viewMode = ref<'grid' | 'list'>('grid')
const keyword = ref('')

const categories = [
  { value: '', label: '全部', emoji: '🛒' },
  { value: 'baby_gear', label: '婴儿车', emoji: '🚼' },
  { value: 'carseat', label: '安全座椅', emoji: '💺' },
  { value: 'crib', label: '婴儿床', emoji: '🛏️' },
  { value: 'baby_toys', label: '玩具', emoji: '🧸' },
  { value: 'baby_clothes', label: '童装', emoji: '👕' },
  { value: 'books', label: '绘本', emoji: '📚' },
  { value: 'other', label: '其他', emoji: '🎁' },
]

const selectedCategory = ref<ProductCategory | ''>('')

const conditionOptions: { value: ProductCondition; label: string; class: string }[] = [
  { value: 'new', label: '全新', class: 'condition-new' },
  { value: 'like_new', label: '99新', class: 'condition-like-new' },
  { value: 'good', label: '轻微使用', class: 'condition-light' },
  { value: 'fair', label: '明显使用', class: 'condition-heavy' },
]
const selectedConditions = ref<ProductCondition[]>([])

const priceRange = ref<[number, number]>([0, 5000])
const onlySameCity = ref(false)
const city = ref<string | null>(null)

const cityOptions = [
  { label: '北京', value: '北京' },
  { label: '上海', value: '上海' },
  { label: '广州', value: '广州' },
  { label: '深圳', value: '深圳' },
  { label: '杭州', value: '杭州' },
  { label: '成都', value: '成都' },
  { label: '武汉', value: '武汉' },
  { label: '南京', value: '南京' },
]

const sortOptions = [
  { label: '综合排序', value: 'default' },
  { label: '最新发布', value: 'newest' },
  { label: '价格从低到高', value: 'price_asc' },
  { label: '价格从高到低', value: 'price_desc' },
]
const sortBy = ref('default')

function toggleCondition(cond: ProductCondition) {
  const idx = selectedConditions.value.indexOf(cond)
  if (idx >= 0) {
    selectedConditions.value.splice(idx, 1)
  } else {
    selectedConditions.value.push(cond)
  }
}

async function fetchProducts() {
  loading.value = true
  try {
    const params: any = {
      page: page.value,
      pageSize: pageSize.value,
    }
    if (selectedCategory.value) params.category = selectedCategory.value
    if (keyword.value) params.keyword = keyword.value
    if (priceRange.value[0] > 0) params.minPrice = priceRange.value[0]
    if (priceRange.value[1] < 5000) params.maxPrice = priceRange.value[1]
    if (onlySameCity.value && city.value) params.location = city.value

    const res = await getProductList(params)
    products.value = res.list || []
    total.value = res.total || 0
  } catch {
    products.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

watch([page, selectedCategory, selectedConditions, priceRange, onlySameCity, city, sortBy], () => {
  page.value = 1
  fetchProducts()
}, { deep: false })

onMounted(fetchProducts)
</script>

<template>
  <div class="min-h-screen bg-cream-50 py-6 px-4 md:px-6 lg:px-8">
    <div class="max-w-[1200px] mx-auto">
      <nav class="flex items-center gap-2 text-caption text-ink-500 mb-6">
        <NIcon><Home /></NIcon>
        <span>首页</span>
        <NIcon size="14"><ChevronRight /></NIcon>
        <span class="text-ink-900 font-medium">闲置市场</span>
      </nav>

      <div class="mb-6">
        <h1 class="text-heading-1 text-ink-900 mb-2">闲置市场 🌸</h1>
        <p class="text-body text-ink-500">淘好物，省更多，宝妈之间的暖心交易</p>
      </div>

      <div class="relative mb-6">
        <NInput
          v-model:value="keyword"
          size="large"
          placeholder="搜索婴儿车、玩具、童装..."
          clearable
          @on-search="fetchProducts"
          @on-clear="fetchProducts"
        >
          <template #prefix>
            <NIcon class="text-ink-400"><Search /></NIcon>
          </template>
        </NInput>
      </div>

      <div class="card p-6 mb-6">
        <div class="mb-6">
          <div class="text-caption text-ink-500 mb-3 font-medium">品类筛选</div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="cat in categories"
              :key="cat.value"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-body font-medium transition-all"
              :class="selectedCategory === cat.value
                ? 'bg-gradient-primary text-white shadow-primary'
                : 'bg-ink-50 text-ink-700 hover:bg-primary-50 hover:text-primary-600'"
              @click="selectedCategory = cat.value as any"
            >
              <span>{{ cat.emoji }}</span>
              <span>{{ cat.label }}</span>
            </button>
          </div>
        </div>

        <div class="mb-6">
          <div class="text-caption text-ink-500 mb-3 font-medium">成色筛选（可多选）</div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="cond in conditionOptions"
              :key="cond.value"
              class="transition-all"
              :class="[
                cond.class,
                selectedConditions.includes(cond.value)
                  ? '!ring-2 ring-offset-2 ring-primary-400 scale-105'
                  : 'opacity-70 hover:opacity-100',
              ]"
              @click="toggleCondition(cond.value)"
            >
              {{ cond.label }}
            </button>
          </div>
        </div>

        <div class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <span class="text-caption text-ink-500 font-medium">价格区间</span>
            <span class="text-body text-primary-600 font-bold">
              ¥{{ priceRange[0] }} - ¥{{ priceRange[1] }}
            </span>
          </div>
          <div class="px-2">
            <NSlider v-model:value="priceRange" range :min="0" :max="5000" :step="50" />
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-6">
          <div class="flex items-center gap-3">
            <NSwitch v-model:value="onlySameCity" />
            <span class="text-body text-ink-700">🏠 仅看同城</span>
          </div>
          <div v-if="onlySameCity" class="flex items-center gap-3 flex-1 max-w-xs">
            <span class="text-caption text-ink-500">城市：</span>
            <NSelect
              v-model:value="city"
              :options="cityOptions"
              placeholder="选择城市"
              clearable
              class="flex-1"
            />
          </div>
          <div class="flex items-center gap-3 ml-auto">
            <span class="text-caption text-ink-500">排序：</span>
            <NSelect
              v-model:value="sortBy"
              :options="sortOptions"
              size="small"
              :show-arrow="false"
              style="width: 140px"
            />
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between mb-6">
        <div class="text-body text-ink-500">
          共找到 <span class="text-primary-600 font-bold">{{ total }}</span> 件商品
        </div>
        <div class="flex items-center gap-2">
          <button
            class="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            :class="viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'bg-white text-ink-400 hover:text-ink-600 border border-ink-100'"
            @click="viewMode = 'grid'"
          >
            <NIcon><Grid2x2 /></NIcon>
          </button>
          <button
            class="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            :class="viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'bg-white text-ink-400 hover:text-ink-600 border border-ink-100'"
            @click="viewMode = 'list'"
          >
            <NIcon><List /></NIcon>
          </button>
        </div>
      </div>

      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger">
        <div v-for="i in 8" :key="i" class="card overflow-hidden">
          <NSkeleton animated height="240px" class="!rounded-none" />
          <div class="p-4 space-y-3">
            <NSkeleton animated text round :repeat="2" />
            <NSkeleton animated width="60%" height="20px" round />
            <NSkeleton animated width="40%" height="16px" round />
          </div>
        </div>
      </div>

      <div v-else-if="products.length === 0" class="card py-20 text-center">
        <div class="text-6xl mb-4">🔍</div>
        <div class="text-heading-4 text-ink-700 mb-2">暂无相关商品</div>
        <div class="text-body text-ink-400">换个筛选条件试试吧～</div>
      </div>

      <div
        v-else
        class="grid gap-5 stagger"
        :class="viewMode === 'grid'
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          : 'grid-cols-1 max-w-3xl mx-auto'"
      >
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
        />
      </div>

      <div v-if="total > 0 && !loading" class="flex justify-center mt-10">
        <NPagination
          v-model:page="page"
          :page-size="pageSize"
          :item-count="total"
          size="large"
          :show-quick-jumper="true"
          :show-size-picker="true"
          :page-sizes="[12, 20, 40, 60]"
        />
      </div>
    </div>
  </div>
</template>
