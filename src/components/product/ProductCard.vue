<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NTooltip, NAvatar, NIcon } from 'naive-ui'
import { Heart, MessageSquare } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import type { Product, ProductCategory, ProductCondition } from '../../../shared/types'
import { favoriteProduct } from '@/api/product'
import { ref } from 'vue'

const props = defineProps<{
  product: Product
}>()

const router = useRouter()
const favorited = ref(props.product.isFavorited ?? false)
const favoriteLoading = ref(false)

const categoryEmojiMap: Record<ProductCategory | string, { emoji: string; gradient: string }> = {
  baby_clothes: { emoji: '👕', gradient: 'from-pink-200 to-rose-300' },
  baby_food: { emoji: '🍼', gradient: 'from-amber-200 to-orange-300' },
  baby_toys: { emoji: '🧸', gradient: 'from-purple-200 to-violet-300' },
  baby_gear: { emoji: '🚼', gradient: 'from-blue-200 to-cyan-300' },
  maternity: { emoji: '🤱', gradient: 'from-fuchsia-200 to-pink-300' },
  diapers: { emoji: '👶', gradient: 'from-green-200 to-emerald-300' },
  other: { emoji: '🎁', gradient: 'from-slate-200 to-gray-300' },
  stroller: { emoji: '🚼', gradient: 'from-sky-200 to-blue-300' },
  carseat: { emoji: '💺', gradient: 'from-indigo-200 to-blue-300' },
  crib: { emoji: '🛏️', gradient: 'from-teal-200 to-cyan-300' },
  books: { emoji: '📚', gradient: 'from-yellow-200 to-amber-300' },
}

const categoryDisplay = computed(() => {
  const cat = props.product.category as string
  if (categoryEmojiMap[cat]) return categoryEmojiMap[cat]
  return categoryEmojiMap['other']
})

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

const discount = computed(() => {
  if (!props.product.originalPrice || props.product.originalPrice <= 0) return null
  const rate = (props.product.price / props.product.originalPrice) * 10
  return rate.toFixed(1) + '折'
})

const savedAmount = computed(() => {
  return props.product.originalPrice - props.product.price
})

const creditLevel = computed(() => {
  const score = props.product.seller?.creditScore ?? 0
  return Math.min(Math.floor(score / 20) + 1, 5)
})

async function handleFavorite(e: Event) {
  e.stopPropagation()
  if (favoriteLoading.value) return
  favoriteLoading.value = true
  try {
    await favoriteProduct(props.product.id)
    favorited.value = !favorited.value
  } catch {
  } finally {
    favoriteLoading.value = false
  }
}

function goDetail() {
  router.push(`/market/${props.product.id}`)
}
</script>

<template>
  <div class="card-hover cursor-pointer overflow-hidden flex flex-col" @click="goDetail">
    <div class="relative overflow-hidden rounded-t-2xl" style="width: 100%; aspect-ratio: 1;">
      <div
        v-if="product.images?.length"
        class="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
        :style="{ backgroundImage: `url(${product.images[0]})` }"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center bg-gradient-to-br transition-transform duration-300"
        :class="categoryDisplay.gradient"
      >
        <span class="text-7xl">{{ categoryDisplay.emoji }}</span>
      </div>
      <div class="absolute left-3 bottom-3 z-10">
        <span :class="conditionClassMap[product.condition]">
          {{ conditionTextMap[product.condition] }}
        </span>
      </div>
      <div class="absolute right-3 top-3 z-10">
        <button
          class="w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center transition-all hover:scale-110 shadow-sm"
          @click="handleFavorite"
        >
          <NIcon :size="18" :class="favorited ? 'text-primary-500' : 'text-ink-400'">
            <Heart :fill="favorited ? 'currentColor' : 'none'" />
          </NIcon>
        </button>
      </div>
    </div>

    <div class="flex-1 p-4 flex flex-col">
      <h3 class="text-heading-4 text-ink-900 line-clamp-2 mb-2 min-h-[54px]">
        {{ product.title }}
      </h3>
      <p class="text-body text-ink-500 line-clamp-3 mb-3 min-h-[67px]">
        {{ product.description }}
      </p>

      <div class="flex items-end gap-2 mb-4">
        <span class="price-tag text-2xl">¥{{ product.price }}</span>
        <span v-if="product.originalPrice > product.price" class="price-origin mb-1">
          ¥{{ product.originalPrice }}
        </span>
        <span
          v-if="discount"
          class="mb-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-50 text-primary-600"
        >
          {{ discount }}
        </span>
      </div>

      <div class="flex items-center gap-2 mb-4 pb-4 border-b border-ink-50">
        <NAvatar round :size="24" :src="product.seller?.avatar">
          {{ product.seller?.nickname?.charAt(0) || product.seller?.username?.charAt(0) }}
        </NAvatar>
        <span class="text-caption text-ink-700 font-medium truncate max-w-[80px]">
          {{ product.seller?.nickname || product.seller?.username }}
        </span>
        <span v-if="product.location" class="text-caption text-ink-400 truncate">
          🏷️{{ product.location }}
        </span>
        <span class="text-caption text-amber-500 font-bold ml-auto">⭐️Lv{{ creditLevel }}</span>
        <span v-if="product.seller?.isTrusted" class="trusted-badge">诚信</span>
      </div>

      <div class="flex gap-2 mt-auto">
        <NButton size="small" secondary class="flex-1 !h-9" @click.stop>
          <NIcon><Heart /></NIcon>
          我想要
        </NButton>
        <NButton size="small" type="primary" class="flex-1 !h-9" @click.stop>
          立即购买
        </NButton>
      </div>
    </div>
  </div>
</template>
