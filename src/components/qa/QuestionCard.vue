<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, MessageCircle, Star, ThumbsUp } from 'lucide-vue-next'
import type { Question } from '@shared/types'

const props = defineProps<{
  question: Question
  isExpert?: boolean
}>()

const router = useRouter()

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  return date.toLocaleDateString()
}

const statusLabel = computed(() => props.question.isAnswered ? '已回答' : '待回答')
const statusClass = computed(() => props.question.isAnswered ? 'chip-mint' : 'chip-primary')

const goDetail = () => {
  router.push(`/qa/${props.question.id}`)
}
</script>

<template>
  <div class="card-hover p-5 cursor-pointer animate-fade-in-up" @click="goDetail">
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-2">
        <span :class="statusClass">{{ statusLabel }}</span>
        <span class="chip-gray">{{ question.category }}</span>
      </div>
      <div v-if="!question.isAnswered" class="text-primary-500 font-bold">
        悬赏 ¥39
      </div>
    </div>

    <h3 class="text-heading-4 text-ink-900 mb-2 line-clamp-2">
      {{ question.title }}
    </h3>
    <p class="text-body text-ink-500 mb-4 line-clamp-2">
      {{ question.content }}
    </p>

    <div class="flex items-center gap-2 mb-4">
      <n-avatar round size="small" :src="question.author?.avatar">
        {{ question.author?.nickname?.charAt(0) || 'U' }}
      </n-avatar>
      <span class="text-body text-ink-700 font-medium">
        {{ question.author?.nickname || '匿名用户' }}
      </span>
      <span class="text-caption text-ink-300">·</span>
      <span class="text-caption text-ink-300">
        {{ formatTime(question.createdAt) }}
      </span>
    </div>

    <div class="border-t border-ink-50 pt-3 flex items-center justify-between">
      <div v-if="question.isAnswered && question.expert" class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <n-avatar round size="24" :src="question.expert.avatar">
            {{ question.expert.nickname?.charAt(0) || 'E' }}
          </n-avatar>
          <span class="text-caption text-lavender-700 font-medium">
            {{ question.expert.nickname }}
          </span>
        </div>
        <div class="flex items-center gap-1 text-caption text-ink-500">
          <Eye class="w-3.5 h-3.5" />
          <span>围观 {{ question.watchCount }}</span>
        </div>
        <button class="btn-lavender h-7 px-3 text-xs" @click.stop="goDetail">
          付费围观
        </button>
      </div>

      <div v-else-if="!question.isAnswered" class="flex items-center gap-4 ml-auto">
        <div class="text-primary-500 font-bold">
          悬赏 ¥39
        </div>
        <button 
          v-if="isExpert" 
          class="btn-primary h-7 px-3 text-xs" 
          @click.stop="goDetail"
        >
          我来回答
        </button>
      </div>

      <div v-if="question.isAnswered" class="flex items-center gap-3 text-caption text-ink-500">
        <div class="flex items-center gap-1">
          <Eye class="w-3.5 h-3.5" />
          <span>{{ question.viewCount }}</span>
        </div>
      </div>
      <div v-else class="flex items-center gap-3 text-caption text-ink-500">
        <div class="flex items-center gap-1">
          <Eye class="w-3.5 h-3.5" />
          <span>{{ question.viewCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
