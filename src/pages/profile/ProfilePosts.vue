<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Heart, MessageCircle, Eye, ChevronLeft, Image } from 'lucide-vue-next'
import { getPostList } from '@/api/post'
import type { Post } from '@shared/types'

const router = useRouter()

const loading = ref(true)
const activeTab = ref('published')
const posts = ref<Post[]>([])

const tabs = [
  { key: 'published', label: '发布的' },
  { key: 'favorited', label: '收藏的' },
  { key: 'liked', label: '点赞的' },
  { key: 'commented', label: '评论的' },
]

const mockPosts: Post[] = [
  {
    id: 1, title: '分享我的顺产日记——从宫缩到分娩的12小时全记录',
    content: '一直想写写我的顺产经历，终于腾出时间了。我是预产期当天发动的，凌晨3点开始规律宫缩...',
    images: ['', '', ''], tags: ['顺产日记', '分娩经验', '新手妈妈'],
    category: '孕期分享', viewCount: 8934, likeCount: 567, commentCount: 89,
    createdAt: '2024-06-10T10:00:00Z',
  } as any,
  {
    id: 2, title: '6个月宝宝辅食添加攻略，详细食谱每周更新！',
    content: '宝宝马上6个月了，做了很久的功课终于开始加辅食了。第一口必须是高铁米粉这个大家都知道吧...',
    images: ['', ''], tags: ['辅食添加', '6个月', '育儿经验'],
    category: '喂养日记', viewCount: 15672, likeCount: 1023, commentCount: 256,
    createdAt: '2024-06-05T14:30:00Z',
  } as any,
  {
    id: 3, title: '产后修复别乱花钱！这5个动作在家就能做',
    content: '生完宝宝肚子还是像5个月？别慌！分享我亲测有效的产后修复动作，坚持2个月真的有变化...',
    images: [], tags: ['产后修复', '运动健身', '宝妈瘦身'],
    category: '产后恢复', viewCount: 23456, likeCount: 2341, commentCount: 432,
    createdAt: '2024-05-28T09:15:00Z',
  } as any,
  {
    id: 4, title: '宝宝睡整觉的秘诀分享！我们从夜醒5次到一觉到天亮',
    content: '终于可以来还愿了！之前宝宝一晚上醒5-6次，我简直要崩溃。试了N种方法终于让宝宝睡整觉了...',
    images: [''], tags: ['睡眠训练', '夜醒', '作息规律'],
    category: '睡眠问题', viewCount: 18934, likeCount: 1567, commentCount: 378,
    createdAt: '2024-05-20T20:00:00Z',
  } as any,
]

const emojiMap: Record<string, string> = {
  '孕期分享': '🤰', '喂养日记': '🍼', '产后恢复': '💪',
  '睡眠问题': '😴', '日常分享': '📷', '好物推荐': '🎁',
}

const fetchPosts = async () => {
  loading.value = true
  try {
    const res = await getPostList({ page: 1, pageSize: 20 })
    posts.value = (res as any)?.list?.length ? (res as any).list : mockPosts
  } catch {
    posts.value = mockPosts
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

onMounted(fetchPosts)
</script>

<template>
  <div class="min-h-screen bg-cream-50 py-8">
    <div class="container max-w-4xl">
      <div class="mb-6 flex items-center gap-4">
        <button class="flex items-center gap-1 text-ink-500 hover:text-primary-500 transition-colors" @click="router.push('/profile')">
          <ChevronLeft class="w-5 h-5" /> 返回
        </button>
        <h1 class="text-heading-1 text-ink-900">我的帖子</h1>
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
        </button>
      </div>

      <n-skeleton v-if="loading" :rows="6" />

      <div v-else class="space-y-4 stagger">
        <div
          v-for="post in posts"
          :key="post.id"
          class="card-hover p-6 cursor-pointer animate-fade-in-up"
          @click="router.push(`/community/${post.id}`)"
        >
          <div class="flex items-center gap-2 mb-3">
            <span class="chip-primary">{{ post.category }}</span>
            <span class="text-caption text-ink-400">{{ formatDate(post.createdAt) }}</span>
            <span
              v-for="tag in (post.tags || []).slice(0, 2)"
              :key="tag"
              class="chip-gray"
            >#{{ tag }}</span>
          </div>

          <div class="flex gap-5">
            <div class="flex-1 min-w-0">
              <h3 class="text-heading-4 text-ink-900 mb-2 line-clamp-2 hover:text-primary-500 transition-colors">
                {{ post.title }}
              </h3>
              <p class="text-body text-ink-500 line-clamp-2 mb-4">
                {{ post.content }}
              </p>
              <div class="flex items-center gap-5 text-caption text-ink-400">
                <span class="flex items-center gap-1">
                  <Eye class="w-4 h-4" /> {{ post.viewCount }}
                </span>
                <span class="flex items-center gap-1">
                  <Heart class="w-4 h-4" /> {{ post.likeCount }}
                </span>
                <span class="flex items-center gap-1">
                  <MessageCircle class="w-4 h-4" /> {{ post.commentCount }}
                </span>
              </div>
            </div>
            <div
              v-if="post.images?.length"
              class="w-28 h-28 rounded-xl bg-gradient-to-br from-cream-100 to-primary-50 flex items-center justify-center text-4xl flex-shrink-0 overflow-hidden"
            >
              <div class="grid grid-cols-2 gap-0.5 p-1 w-full h-full">
                <div
                  v-for="(_, idx) in Math.min(post.images.length, 4)"
                  :key="idx"
                  class="rounded-md bg-gradient-to-br from-primary-200 to-lavender-200 flex items-center justify-center"
                >
                  <Image class="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            <div
              v-else
              class="w-28 h-28 rounded-xl bg-gradient-to-br from-cream-100 to-primary-50 flex items-center justify-center text-4xl flex-shrink-0"
            >
              {{ emojiMap[post.category] || '📝' }}
            </div>
          </div>
        </div>

        <n-empty v-if="!loading && posts.length === 0" description="还没有帖子，快去发布第一条吧~" />
      </div>
    </div>
  </div>
</template>
