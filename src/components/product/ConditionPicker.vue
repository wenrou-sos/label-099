<script setup lang="ts">
import { computed } from 'vue'
import { NCard } from 'naive-ui'
import type { ProductCondition } from '../../../shared/types'

const props = defineProps<{
  modelValue: ProductCondition | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ProductCondition): void
  (e: 'change', value: ProductCondition): void
}>()

interface ConditionOption {
  value: ProductCondition
  emoji: string
  title: string
  desc: string
  tip: string
  colorClass: string
}

const options: ConditionOption[] = [
  {
    value: 'new',
    emoji: '✨',
    title: '全新未拆封',
    desc: '未开箱 / 未使用 / 配件齐全',
    tip: '建议定价 原价的70%左右',
    colorClass: 'border-mint-300 bg-mint-50',
  },
  {
    value: 'like_new',
    emoji: '💎',
    title: '几乎全新',
    desc: '仅试用 / 无磨损 / 包装完整',
    tip: '建议定价 原价的60%左右',
    colorClass: 'border-blue-300 bg-blue-50',
  },
  {
    value: 'good',
    emoji: '🌿',
    title: '轻微使用痕迹',
    desc: '功能完好 / 外观微瑕',
    tip: '建议定价 原价的45%左右',
    colorClass: 'border-orange-300 bg-orange-50',
  },
  {
    value: 'fair',
    emoji: '🍂',
    title: '明显使用痕迹',
    desc: '正常使用 / 明显磨损',
    tip: '建议定价 原价的30%左右',
    colorClass: 'border-ink-300 bg-ink-50',
  },
]

function selectOption(value: ProductCondition) {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div
      v-for="opt in options"
      :key="opt.value"
      class="relative cursor-pointer transition-all duration-200"
      :class="[
        modelValue === opt.value
          ? 'rounded-2xl border-2 bg-primary-50 border-primary-400 shadow-primary/20 shadow-md'
          : 'rounded-2xl border-2 border-transparent hover:border-primary-200 hover:bg-primary-50/50',
      ]"
      @click="selectOption(opt.value)"
    >
      <NCard bordered :embedded="true" class="!bg-transparent !shadow-none !rounded-2xl !p-5">
        <div class="flex items-start gap-4">
          <div class="text-4xl flex-shrink-0">{{ opt.emoji }}</div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <h4 class="text-heading-4 text-ink-900">{{ opt.title }}</h4>
              <div
                v-if="modelValue === opt.value"
                class="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center"
              >
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p class="text-body text-ink-500 mb-2">{{ opt.desc }}</p>
            <p class="text-caption text-primary-600 font-medium">💰 {{ opt.tip }}</p>
          </div>
        </div>
      </NCard>
    </div>
  </div>
</template>
