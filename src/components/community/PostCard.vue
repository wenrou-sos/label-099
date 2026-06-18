<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NAvatar, NImage } from 'naive-ui'
import {
  Heart,
  MessageCircle,
  Bookmark,
  User,
  ShieldCheck,
} from 'lucide-vue-next'
import type { Post } from '../../../shared/types'
import { likePost, favoritePost } from '@/api/post'
import { useUserStore } from '@/stores/user'
import { useMessage } from 'naive-ui'

const props = defineProps<{
  post: Post
}>()

const emit = defineEmits<{
  (e: 'update'): void
}>()

const router = useRouter()
const userStore = useUserStore()
const message = useMessage()

const likeAnimating = ref(false)
const favAnimating = ref(false)
const isLiked = ref(props.post.isLiked || false)
const isFavorited = ref(props.post.isFavorited || false)
const likeCount = ref(props.post.likeCount)
const favCount = ref(0)

const imageCount = computed(() => props.post.images?.length || 0)

const imageGridClass = computed(() => {
  const count = imageCount.value
  if (count === 1) return 'grid-cols-1'
  if (count === 2) return 'grid-cols-2'
  if (count === 4) return 'grid-cols-2'
  return 'grid-cols-3'
})

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}天前`
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function goDetail() {
  router.push(`/community/${props.post.id}`)
}

async function handleLike(e: Event) {
  e.stopPropagation()
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  likeAnimating.value = true
  setTimeout(() => {
    likeAnimating.value = false
  }, 400)

  try {
    await likePost(props.post.id)
    isLiked.value = !isLiked.value
    likeCount.value += isLiked.value ? 1 : -1
    message.success(isLiked.value ? '已点赞' : '已取消点赞')
    emit('update')
  } catch {
  }
}

async function handleFavorite(e: Event) {
  e.stopPropagation()
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  favAnimating.value = true
  setTimeout(() => {
    favAnimating.value = false
  }, 400)

  try {
    await favoritePost(props.post.id)
    isFavorited.value = !isFavorited.value
    message.success(isFavorited.value ? '已收藏' : '已取消收藏')
    emit('update')
  } catch {
  }
}

function handleComment(e: Event) {
  e.stopPropagation()
  router.push(`/community/${props.post.id}#comments`)
}

function getCategoryGradient(category: string) {
  const map: Record<string, string> = {
    '经验分享': 'from-primary-400 to-primary-500',
    '辅食制作': 'from-mint-400 to-mint-500',
    '睡眠训练': 'from-blue-400 to-indigo-500',
    '产后恢复': 'from-orange-400 to-pink-500',
    '其他': 'from-lavender-400 to-lavender-500',
  }
  return map[category] || map['其他']
}
</script>

<template>
  <div
    class="card-hover p-5 md:p-6 cursor-pointer group"
    @click="goDetail"
  >
    <div class="flex items-start gap-3 mb-4">
      <NAvatar
        round
        size="medium"
        :src="post.author?.avatar"
        class="!bg-gradient-primary !w-11 !h-11 flex-shrink-0"
      >
        <User class="w-5 h-5 text-white" />
      </NAvatar>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-body font-semibold text-ink-900 truncate">
            {{ post.author?.nickname || post.author?.username || '匿名用户' }}
          </span>
          <span
            v-if="post.author?.isTrusted"
            class="trusted-badge"
          >
            <ShieldCheck class="w-3 h-3" />
            可信
          </span>
          <span
            v-if="post.author?.isExpert"
            class="chip-mint !py-0.5 !px-2"
          >
            专家
          </span>
        </div>

        <div class="flex items-center gap-2 mt-0.5">
          <span class="text-caption text-ink-400">
            {{ formatDate(post.createdAt) }}
          </span>
          <span class="text-caption text-ink-200">·</span>
          <span class="text-caption text-ink-400">
            信用 {{ post.author?.creditScore || 0 }}
          </span>
        </div>
      </div>

      <span
        class="chip text-white !py-1 flex-shrink-0 bg-gradient-to-br"
        :class="getCategoryGradient(post.category)"
      >
        {{ post.category }}
      </span>
    </div>

    <h3
      class="text-heading-4 font-semibold text-ink-900 mb-2 line-clamp-2
             group-hover:text-primary-500 transition-colors"
    >
      {{ post.title }}
    </h3>

    <p
      class="text-body text-ink-500 line-clamp-2 mb-4"
    >
      {{ post.content }}
    </p>

    <div
      v-if="imageCount > 0"
      class="grid gap-2 mb-4 rounded-xl overflow-hidden"
      :class="imageGridClass"
    >
      <div
        v-for="(_, idx) in Math.min(imageCount, 9)"
        :key="idx"
        class="relative aspect-square bg-gradient-to-br from-ink-50 to-ink-100
               rounded-lg overflow-hidden"
      >
        <NImage
          v-if="post.images?.[idx]"
          :src="post.images[idx]"
          object-fit="cover"
          class="!w-full !h-full"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center text-4xl
                 bg-gradient-to-br from-primary-100 to-lavender-100"
        >
          {{ ['📷', '🌸', '🎀', '💖', '🎈', '🌷', '🦄', '🌈', '🍭'][idx] }}
        </div>
        <div
          v-if="idx === 8 && imageCount > 9"
          class="absolute inset-0 bg-black/40 flex items-center justify-center
                 text-white text-heading-3 font-semibold backdrop-blur-sm"
        >
          +{{ imageCount - 9 }}
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2 pt-3 border-t border-ink-50">
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all
               hover:bg-primary-50 group/btn"
        :class="{
          'text-primary-500': isLiked,
          'text-ink-500 group-hover/btn:text-primary-500': !isLiked,
        }"
        @click="handleLike"
      >
        <Heart
          class="w-4 h-4 transition-transform"
          :class="[
            isLiked ? 'fill-primary-500' : '',
            likeAnimating ? 'animate-scale-pulse' : '',
          ]"
        />
        <span class="text-caption font-medium">{{ likeCount }}</span>
      </button>

      <button
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all
               hover:bg-lavender-50 text-ink-500 group-hover:text-lavender-600"
        @click="handleComment"
      >
        <MessageCircle class="w-4 h-4" />
        <span class="text-caption font-medium">{{ post.commentCount }}</span>
      </button>

      <button
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all
               hover:bg-mint-50 group/fav"
        :class="{
          'text-mint-700': isFavorited,
          'text-ink-500 group-hover/fav:text-mint-700': !isFavorited,
        }"
        @click="handleFavorite"
      >
        <Bookmark
          class="w-4 h-4 transition-transform"
          :class="[
            isFavorited ? 'fill-mint-500' : '',
            favAnimating ? 'animate-scale-pulse' : '',
          ]"
        />
        <span class="text-caption font-medium">收藏</span>
      </button>

      <div class="flex-1" />

      <span class="text-caption text-ink-400 flex items-center gap-1">
        👁️ {{ post.viewCount }}
      </span>
    </div>
  </div>
</template>
