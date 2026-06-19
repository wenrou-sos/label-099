<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NTabs,
  NTabPane,
  NInput,
  NSelect,
  NSkeleton,
  NButton,
} from 'naive-ui'
import {
  Search,
  Plus,
  TrendingUp,
  Clock,
  Star,
} from 'lucide-vue-next'
import PostCard from '@/components/community/PostCard.vue'
import { getPostList } from '@/api/post'
import type { Post } from '../../../shared/types'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const categories = [
  { key: '', label: '全部' },
  { key: '经验分享', label: '经验分享' },
  { key: '辅食制作', label: '辅食制作' },
  { key: '睡眠训练', label: '睡眠训练' },
  { key: '产后恢复', label: '产后恢复' },
  { key: '其他', label: '其他' },
]

const activeCategory = ref<string>(route.query.category as string || '')
const keyword = ref<string>(route.query.keyword as string || '')
const sortBy = ref<'latest' | 'hot' | 'essence'>('latest')
const posts = ref<Post[]>([])
const loading = ref(true)
const page = ref(1)
const pageSize = 10
const hasMore = ref(true)
const isLoadingMore = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const fallbackPosts: Post[] = [
  {
    id: 1,
    userId: 1,
    author: { id: 1, username: '小美妈', phone: '', creditScore: 98, isExpert: false, isTrusted: true, createdAt: '', updatedAt: '', nickname: '小美妈' },
    title: '宝宝6个月辅食添加全攻略，新手妈妈必看！',
    content: '从第一口高铁米粉到手指食物，详细记录每个阶段的食材、做法和注意事项，附一周食谱安排表，宝宝吃得香，妈妈更放心。',
    images: ['', '', ''],
    category: '辅食制作',
    tags: ['辅食', '6个月'],
    viewCount: 12580,
    likeCount: 892,
    commentCount: 156,
    isEssence: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    userId: 2,
    author: { id: 2, username: '果果妈咪', phone: '', creditScore: 95, isExpert: false, isTrusted: true, createdAt: '', updatedAt: '', nickname: '果果妈咪' },
    title: '关于肠胀气的那些事，我的实战经验分享',
    content: '宝宝前三个月肠胀气闹得厉害，试了各种方法终于找到了适合的组合：排气操+拍嗝+益生菌，现在宝宝终于不哭闹了。',
    images: ['', ''],
    category: '经验分享',
    tags: ['肠胀气', '新生儿'],
    viewCount: 8920,
    likeCount: 623,
    commentCount: 98,
    createdAt: '2024-01-14T15:20:00Z',
    updatedAt: '2024-01-14T15:20:00Z',
  },
  {
    id: 3,
    userId: 3,
    author: { id: 3, username: '豆豆妈', phone: '', creditScore: 92, isExpert: false, isTrusted: false, createdAt: '', updatedAt: '', nickname: '豆豆妈' },
    title: '顺产vs剖腹产，我的经历告诉你怎么选',
    content: '两胎分别顺产和剖腹产，亲身经历分享两种分娩方式的优缺点，以及产后恢复的注意事项，帮你做好选择。',
    images: [''],
    category: '产后恢复',
    tags: ['分娩', '产后'],
    viewCount: 15600,
    likeCount: 1208,
    commentCount: 234,
    isEssence: true,
    createdAt: '2024-01-13T09:45:00Z',
    updatedAt: '2024-01-13T09:45:00Z',
  },
  {
    id: 4,
    userId: 4,
    author: { id: 4, username: '安安妈妈', phone: '', creditScore: 90, isExpert: false, isTrusted: false, createdAt: '', updatedAt: '', nickname: '安安妈妈' },
    title: '宝宝睡眠训练第7天，终于睡整觉了！',
    content: '记录从夜醒5次到一觉睡到天亮的全过程，方法+时间表分享，适合6个月以上宝宝，每个宝宝都能做到。',
    images: ['', '', '', ''],
    category: '睡眠训练',
    tags: ['睡眠', '1岁'],
    viewCount: 23450,
    likeCount: 2103,
    commentCount: 412,
    createdAt: '2024-01-12T20:10:00Z',
    updatedAt: '2024-01-12T20:10:00Z',
  },
  {
    id: 5,
    userId: 5,
    author: { id: 5, username: '小汤圆', phone: '', creditScore: 93, isExpert: false, isTrusted: true, createdAt: '', updatedAt: '', nickname: '小汤圆妈妈' },
    title: '8个月宝宝手指食物大合集，锻炼自主进食',
    content: '精选20款适合8-12个月宝宝的手指食物，做法简单营养均衡，锻炼宝宝手眼协调和自主进食能力。',
    category: '辅食制作',
    tags: ['手指食物', '8个月'],
    viewCount: 6780,
    likeCount: 456,
    commentCount: 78,
    createdAt: '2024-01-11T14:00:00Z',
    updatedAt: '2024-01-11T14:00:00Z',
  },
]

const sortTabs: { label: string; value: 'latest' | 'hot' | 'essence'; icon: any }[] = [
  { label: '最新', value: 'latest', icon: Clock },
  { label: '最热', value: 'hot', icon: TrendingUp },
  { label: '精华', value: 'essence', icon: Star },
]

async function fetchPosts(reset = false) {
  if (reset) {
    page.value = 1
    hasMore.value = true
    posts.value = []
  }
  if (!hasMore.value || isLoadingMore.value) return

  const wasInitialLoading = loading.value
  if (!wasInitialLoading) isLoadingMore.value = true

  try {
    const params: any = {
      page: page.value,
      pageSize,
    }
    if (activeCategory.value) params.category = activeCategory.value
    if (keyword.value) params.keyword = keyword.value
    if (sortBy.value !== 'latest') params.sort = sortBy.value

    const res = await getPostList(params)
    if (res.list && res.list.length > 0) {
      posts.value = [...posts.value, ...res.list]
      hasMore.value = res.page < res.totalPages
      page.value++
    } else {
      if (reset) {
        posts.value = fallbackPosts
      }
      hasMore.value = false
    }
  } catch {
    if (reset) {
      posts.value = fallbackPosts
    }
    hasMore.value = false
  } finally {
    loading.value = false
    isLoadingMore.value = false
  }
}

function handleCategoryChange(key: string) {
  activeCategory.value = key
  fetchPosts(true)
}

function handleSearch() {
  fetchPosts(true)
}

function goPost() {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  router.push('/community/post')
}

function handleScroll() {
  if (isLoadingMore.value || loading.value || !hasMore.value) return
  const scrollTop = window.scrollY
  const windowHeight = window.innerHeight
  const docHeight = document.documentElement.scrollHeight
  if (scrollTop + windowHeight >= docHeight - 200) {
    fetchPosts()
  }
}

watch(
  () => route.query,
  (q) => {
    if (q.category) activeCategory.value = q.category as string
    if (q.keyword) keyword.value = q.keyword as string
    fetchPosts(true)
  },
  { immediate: false }
)

onMounted(() => {
  fetchPosts(true)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="container mx-auto px-4 py-6 md:py-8">
    <!-- 分类 Tabs -->
    <div class="mb-6 stagger">
      <div class="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-1">
        <div class="flex gap-2 md:gap-3 w-max md:w-auto md:grid md:grid-cols-6">
          <button
            v-for="cat in categories"
            :key="cat.key || 'all'"
            :class="[
              'px-4 md:px-5 py-2 md:py-2.5 rounded-full text-caption md:text-body font-medium transition-all whitespace-nowrap',
              activeCategory === cat.key
                ? 'bg-gradient-primary text-white shadow-primary'
                : 'bg-white text-ink-600 hover:bg-primary-50 hover:text-primary-500 card',
            ]"
            @click="handleCategoryChange(cat.key)"
          >
            {{ cat.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 搜索 -->
    <div class="flex flex-col md:flex-row gap-3 mb-6 stagger">
      <div class="flex-1">
        <NInput
          v-model:value="keyword"
          placeholder="搜索帖子关键词..."
          clearable
          size="large"
          round
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <Search class="w-4 h-4 text-ink-300" />
          </template>
          <template #suffix>
            <button
              v-if="keyword"
              class="text-caption text-primary-500 font-medium hover:text-primary-600"
              @click="handleSearch"
            >
              搜索
            </button>
          </template>
        </NInput>
      </div>
    </div>

    <!-- 排序 Tabs -->
    <div class="flex items-center gap-2 mb-6 stagger">
      <button
        v-for="tab in sortTabs"
        :key="tab.value"
        :class="[
          'flex items-center gap-1.5 px-4 py-2 rounded-full text-caption md:text-body font-medium transition-all',
          sortBy === tab.value
            ? 'bg-gradient-primary text-white shadow-primary'
            : 'bg-white text-ink-600 hover:bg-primary-50 hover:text-primary-500 card',
        ]"
        @click="sortBy = tab.value; fetchPosts(true)"
      >
        <component :is="tab.icon" class="w-4 h-4" />
        {{ tab.label }}
      </button>
    </div>

    <!-- 帖子列表 -->
    <div class="space-y-4 md:space-y-5 stagger">
      <template v-if="loading">
        <NSkeleton
          v-for="i in 5"
          :key="i"
          text
          :repeat="5"
          round
          class="!h-[220px]"
        />
      </template>

      <template v-else-if="posts.length > 0">
        <PostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
        />

        <div v-if="isLoadingMore" class="flex justify-center py-6">
          <NSkeleton
            text
            :repeat="3"
            round
            class="!h-[180px] !max-w-2xl mx-auto"
          />
        </div>

        <div
          v-else-if="!hasMore && posts.length > 0"
          class="text-center py-6 text-caption text-ink-400"
        >
          ～ 已加载全部内容 ～
        </div>
      </template>

      <div v-else class="flex flex-col items-center justify-center py-20">
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-heading-4 text-ink-700 mb-2">暂无相关内容</h3>
        <p class="text-body text-ink-400 mb-6">换个关键词试试吧~</p>
        <NButton type="primary" round @click="handleCategoryChange('')">
          查看全部
        </NButton>
      </div>
    </div>

    <!-- 浮动发帖按钮 -->
    <button
      class="fixed right-4 md:right-8 bottom-6 md:bottom-8 z-40
             w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-primary
             shadow-primary flex items-center justify-center text-white
             transition-all duration-300 hover:scale-110 hover:shadow-primary-hover
             active:scale-95 group"
      @click="goPost"
    >
      <Plus class="w-7 h-7 md:w-8 md:h-8 transition-transform group-hover:rotate-90" />
      <span
        class="absolute right-full mr-3 whitespace-nowrap px-3 py-1.5
               rounded-lg bg-ink-900 text-white text-caption font-medium
               opacity-0 pointer-events-none group-hover:opacity-100
               transition-opacity"
      >
        发布新帖
      </span>
    </button>
  </div>
</template>
