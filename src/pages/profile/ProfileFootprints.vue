<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, Trash2, Clock, Footprints, Package } from 'lucide-vue-next'
import { useMessage, useDialog } from 'naive-ui'
import { getFootprints, deleteFootprint, clearFootprints } from '@/api/footprint'
import type { Footprint, ProductCategory } from '@shared/types'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const loading = ref(true)
const footprints = ref<Footprint[]>([])

const categoryEmojiMap: Record<ProductCategory | string, string> = {
  baby_clothes: '👕', baby_food: '🍼', baby_toys: '🧸',
  baby_gear: '🚼', maternity: '🤱', diapers: '👶', other: '🎁',
  stroller: '🚗', carseat: '💺', crib: '🛏️', books: '📚',
}

const fetchFootprints = async () => {
  loading.value = true
  try {
    const res = await getFootprints({ page: 1, pageSize: 100 })
    footprints.value = res.list
  } catch (e: any) {
    footprints.value = []
  } finally {
    loading.value = false
  }
}

const formatViewedAt = (dateStr: string) => {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}天前`
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const handleDelete = (id: number, e: Event) => {
  e.stopPropagation()
  dialog.warning({
    title: '删除足迹',
    content: '确定删除这条浏览记录吗？',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteFootprint(id)
        footprints.value = footprints.value.filter(f => f.id !== id)
        message.success('已删除')
      } catch (e: any) {
        message.error(e?.message || '删除失败')
      }
    },
  })
}

const handleClear = () => {
  if (!footprints.value.length) {
    message.info('暂无浏览记录')
    return
  }
  dialog.warning({
    title: '清空足迹',
    content: `确定清空全部 ${footprints.value.length} 条浏览记录吗？此操作不可恢复。`,
    positiveText: '清空',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await clearFootprints()
        footprints.value = []
        message.success('已清空全部足迹')
      } catch (e: any) {
        message.error(e?.message || '清空失败')
      }
    },
  })
}

const goProduct = (fp: Footprint) => {
  if (fp.product) {
    router.push(`/market/${fp.productId}`)
  }
}

onMounted(fetchFootprints)
</script>

<template>
  <div class="min-h-screen bg-cream-50 py-8">
    <div class="container max-w-5xl">
      <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button class="flex items-center gap-1 text-ink-500 hover:text-primary-500 transition-colors" @click="router.push('/profile')">
            <ChevronLeft class="w-5 h-5" /> 返回
          </button>
          <div class="flex items-center gap-2">
            <Footprints class="w-7 h-7 text-indigo-500" />
            <h1 class="text-heading-1 text-ink-900">我的足迹</h1>
            <span class="text-caption text-ink-400">{{ footprints.length }}/100</span>
          </div>
        </div>
        <button
          class="h-10 px-5 rounded-xl text-body font-medium text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1.5"
          :disabled="!footprints.length"
          :class="{ 'opacity-40 cursor-not-allowed': !footprints.length }"
          @click="handleClear"
        >
          <Trash2 class="w-4 h-4" /> 清空全部
        </button>
      </div>

      <n-skeleton v-if="loading" :rows="8" />

      <div v-else-if="!footprints.length" class="card p-16 text-center">
        <div class="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
          <Footprints class="w-10 h-10 text-indigo-400" />
        </div>
        <h3 class="text-heading-3 text-ink-900 font-bold mb-2">暂无浏览记录</h3>
        <p class="text-body text-ink-500 mb-6">快去逛逛闲置市场吧，看看有什么心仪的好物~</p>
        <button class="btn-primary h-11 px-8" @click="router.push('/market')">
          <Package class="w-4 h-4 inline mr-1.5" /> 去逛逛
        </button>
      </div>

      <div v-else class="card divide-y divide-ink-100">
        <div
          v-for="fp in footprints"
          :key="fp.id"
          class="p-4 flex items-center gap-4 hover:bg-cream-50 cursor-pointer transition-colors group"
          @click="goProduct(fp)"
        >
          <div class="flex-shrink-0 w-24 h-24 rounded-xl bg-gradient-to-br from-cream-100 to-primary-50 flex items-center justify-center text-4xl overflow-hidden">
            <template v-if="fp.product?.images?.length">
              <img :src="fp.product.images[0]" class="w-full h-full object-cover" alt="" />
            </template>
            <template v-else>
              {{ categoryEmojiMap[(fp.product?.category as string) || 'other'] || '🎁' }}
            </template>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-body text-ink-900 font-medium truncate mb-2">
              {{ fp.product?.title || '商品已下架' }}
            </h4>
            <div class="flex items-center gap-4">
              <div class="flex items-baseline gap-1">
                <span class="text-caption text-ink-400">¥</span>
                <span class="text-heading-4 text-red-500 font-bold">
                  {{ (fp.product as any)?.price || fp.product?.suggestedPrice || '--' }}
                </span>
                <span v-if="fp.product?.originalPrice" class="text-caption text-ink-400 line-through ml-1">
                  ¥{{ fp.product.originalPrice }}
                </span>
              </div>
              <div class="text-caption text-ink-400 flex items-center gap-1">
                <Clock class="w-3.5 h-3.5" />
                {{ formatViewedAt(fp.viewedAt) }}
              </div>
            </div>
          </div>
          <button
            class="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-ink-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
            @click="handleDelete(fp.id, $event)"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
