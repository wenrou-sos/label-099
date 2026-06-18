<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NAvatar,
  NImage,
  NSkeleton,
  NButton,
  useMessage,
  NEmpty,
} from 'naive-ui'
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Flag,
  ChevronRight,
  Home,
  User,
  ShieldCheck,
  Send,
  Reply,
  ThumbsUp,
} from 'lucide-vue-next'
import {
  getPost,
  getPostComments,
  createComment,
  likePost,
  favoritePost,
} from '@/api/post'
import type { Post, Comment } from '../../../shared/types'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const userStore = useUserStore()

const postId = computed(() => Number(route.params.id))
const loading = ref(true)
const post = ref<Post | null>(null)
const comments = ref<Comment[]>([])
const commentContent = ref('')
const submitting = ref(false)
const replyTo = ref<{ commentId: number; username: string } | null>(null)
const likeAnimating = ref(false)
const favAnimating = ref(false)

const fallbackPost: Post = {
  id: 1,
  userId: 1,
  author: { id: 1, username: '小美妈', phone: '', creditScore: 98, isExpert: false, isTrusted: true, createdAt: '', updatedAt: '', nickname: '小美妈', bio: '家有6月龄萌宝，专注科学育儿', avatar: '' },
  title: '宝宝6个月辅食添加全攻略，新手妈妈必看！',
  content: `亲爱的宝妈们好呀！👋

终于来写这篇辅食添加的全攻略了，宝宝现在已经顺利吃了一个月的辅食，从一开始的茫然到现在的得心应手，想把我的经验都分享给大家。

## 一、准备工作

在宝宝满6个月之前，我做了很多功课，也准备了不少工具：

- 高铁米粉（选的是强化铁的婴儿米粉）
- 辅食机（打泥用，后面可以做颗粒）
- 硅胶勺子（软头的不伤害牙龈）
- 围兜（建议买全包的，不然...你懂的）

## 二、第一阶段（6月龄）

### 第一周：纯高铁米粉
- 第一天：1勺米粉+5勺水，调得稀一点
- 第三天：逐渐增加浓度
- 第七天：可以吃小半碗了

### 第二周：添加根茎类蔬菜
我按顺序添加了：
1. 🥔 土豆泥（最不容易过敏）
2. 🥕 胡萝卜泥（记得蒸熟打细）
3. 🎃 南瓜泥（宝宝最爱！甜甜的）

每种新食物观察3天，没有过敏反应再加下一种。

## 三、第二阶段（7月龄）

开始添加叶菜类和水果：
- 菠菜泥（记得焯水去草酸）
- 西兰花泥
- 苹果泥（蒸一下更温和）
- 香蕉泥（直接压成泥就行）

## 四、常见问题

❓ 宝宝不吃怎么办？
→ 别强迫，换个时间再试，或者稍微调整口味。我家宝宝第一次吃米粉吐出来，但第三天就接受了。

❓ 什么时候加蛋黄？
→ 建议7-8个月再尝试，从1/8个开始，观察是否过敏。

❓ 一顿吃多少？
→ 每个宝宝饭量不同，原则是"不强迫，不追喂"，吃饱了宝宝会自己转头的。

好啦，今天就分享到这里！下一篇打算写写8个月手指食物的做法，大家记得关注我哦~ 有问题评论区见！💖`,
  images: ['', '', '', '', ''],
  category: '辅食制作',
  tags: ['辅食', '6个月', '新手妈妈'],
  viewCount: 12580,
  likeCount: 892,
  commentCount: 156,
  isLiked: false,
  isFavorited: false,
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
}

const fallbackComments: (Comment & { replies?: Comment[] })[] = [
  {
    id: 1,
    postId: 1,
    userId: 10,
    author: { id: 10, username: '果果妈咪', phone: '', creditScore: 95, isExpert: false, isTrusted: true, createdAt: '', updatedAt: '', nickname: '果果妈咪' },
    content: '太及时了！我家宝宝刚好满6个月，明天就开始加辅食，跟着宝妈的攻略来！👍',
    likeCount: 28,
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    replies: [
      {
        id: 11,
        postId: 1,
        userId: 1,
        parentId: 1,
        replyTo: 10,
        author: { id: 1, username: '小美妈', phone: '', creditScore: 98, isExpert: false, isTrusted: true, createdAt: '', updatedAt: '', nickname: '小美妈' },
        content: '加油！有问题随时问我~',
        likeCount: 5,
        createdAt: '2024-01-15T12:30:00Z',
        updatedAt: '2024-01-15T12:30:00Z',
      },
    ],
  },
  {
    id: 2,
    postId: 1,
    userId: 20,
    author: { id: 20, username: '豆豆妈', phone: '', creditScore: 92, isExpert: false, isTrusted: false, createdAt: '', updatedAt: '', nickname: '豆豆妈' },
    content: '请问宝妈，米粉是用温水冲还是配方奶冲比较好？我看说法都不一样...',
    likeCount: 15,
    createdAt: '2024-01-15T13:15:00Z',
    updatedAt: '2024-01-15T13:15:00Z',
  },
  {
    id: 3,
    postId: 1,
    userId: 30,
    author: { id: 30, username: '安安妈妈', phone: '', creditScore: 90, isExpert: false, isTrusted: false, createdAt: '', updatedAt: '', nickname: '安安妈妈' },
    content: '我家宝宝吃胡萝卜泥有点拉肚子，是不是不适合？需要停吗？',
    likeCount: 12,
    createdAt: '2024-01-15T14:20:00Z',
    updatedAt: '2024-01-15T14:20:00Z',
  },
]

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
  if (days < 30) return `${days}天前`
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

const imageGridClass = computed(() => {
  const count = post.value?.images?.length || 0
  if (count <= 1) return 'grid-cols-1'
  if (count <= 4) return 'grid-cols-2'
  return 'grid-cols-3'
})

async function fetchData() {
  loading.value = true
  try {
    const [postRes, commentsRes] = await Promise.allSettled([
      getPost(postId.value),
      getPostComments(postId.value, { page: 1, pageSize: 50 }),
    ])

    if (postRes.status === 'fulfilled' && postRes.value) {
      post.value = postRes.value
    } else {
      post.value = fallbackPost
    }

    if (commentsRes.status === 'fulfilled' && commentsRes.value.list.length > 0) {
      comments.value = buildCommentTree(commentsRes.value.list)
    } else {
      comments.value = fallbackComments as any
    }
  } catch {
    post.value = fallbackPost
    comments.value = fallbackComments as any
  } finally {
    loading.value = false
  }
}

function buildCommentTree(list: Comment[]): Comment[] {
  const map: Record<number, Comment & { replies?: Comment[] }> = {}
  const roots: (Comment & { replies?: Comment[] })[] = []

  list.forEach((c) => {
    map[c.id] = { ...c, replies: [] }
  })

  list.forEach((c) => {
    if (c.parentId && map[c.parentId]) {
      map[c.parentId].replies!.push(map[c.id])
    } else {
      roots.push(map[c.id])
    }
  })

  return roots
}

async function handleLike() {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  if (!post.value) return
  likeAnimating.value = true
  setTimeout(() => (likeAnimating.value = false), 400)
  try {
    await likePost(post.value.id)
    post.value.isLiked = !post.value.isLiked
    post.value.likeCount += post.value.isLiked ? 1 : -1
    message.success(post.value.isLiked ? '已点赞' : '已取消点赞')
  } catch {
  }
}

async function handleFavorite() {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  if (!post.value) return
  favAnimating.value = true
  setTimeout(() => (favAnimating.value = false), 400)
  try {
    await favoritePost(post.value.id)
    post.value.isFavorited = !post.value.isFavorited
    message.success(post.value.isFavorited ? '已收藏' : '已取消收藏')
  } catch {
  }
}

function handleShare() {
  if (navigator.share) {
    navigator.share({
      title: post.value?.title,
      url: window.location.href,
    })
  } else {
    navigator.clipboard.writeText(window.location.href)
    message.success('链接已复制到剪贴板')
  }
}

function handleReport() {
  message.info('举报功能开发中...')
}

function startReply(comment: Comment) {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  replyTo.value = {
    commentId: comment.id,
    username: comment.author?.nickname || comment.author?.username || '',
  }
  setTimeout(() => {
    document.getElementById('comment-input')?.focus()
  }, 100)
}

function cancelReply() {
  replyTo.value = null
  commentContent.value = ''
}

async function submitComment() {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  const content = commentContent.value.trim()
  if (!content) {
    message.warning('请输入评论内容')
    return
  }
  submitting.value = true
  try {
    const data: any = { content }
    if (replyTo.value) {
      data.parentId = replyTo.value.commentId
    }
    await createComment(postId.value, data)
    message.success('评论成功')
    commentContent.value = ''
    replyTo.value = null
    fetchData()
  } catch {
  } finally {
    submitting.value = false
  }
}

function getCategoryGradient(category: string) {
  const map: Record<string, string> = {
    '经验分享': 'from-primary-400 to-primary-500',
    '辅食制作': 'from-mint-400 to-mint-500',
    '睡眠训练': 'from-blue-400 to-indigo-500',
    '产后恢复': 'from-orange-400 to-pink-500',
  }
  return map[category] || 'from-lavender-400 to-lavender-500'
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
    <!-- 面包屑 -->
    <div class="flex items-center gap-2 text-caption md:text-body text-ink-500 mb-6 stagger">
      <button
        class="flex items-center gap-1 hover:text-primary-500 transition-colors"
        @click="router.push('/')"
      >
        <Home class="w-3.5 h-3.5" />
        首页
      </button>
      <ChevronRight class="w-3 h-3" />
      <button
        class="hover:text-primary-500 transition-colors"
        @click="router.push('/community')"
      >
        社区
      </button>
      <ChevronRight class="w-3 h-3" />
      <span class="text-ink-700 truncate max-w-[200px]">
        {{ post?.title || '帖子详情' }}
      </span>
    </div>

    <template v-if="loading">
      <NSkeleton
        text
        :repeat="10"
        round
        class="!h-[600px]"
      />
    </template>

    <template v-else-if="post">
      <article class="stagger">
        <!-- 帖子内容卡片 -->
        <div class="card p-5 md:p-8 mb-6">
          <div class="mb-4">
            <span
              class="chip text-white !py-1.5 bg-gradient-to-br"
              :class="getCategoryGradient(post.category)"
            >
              {{ post.category }}
            </span>
            <div class="flex flex-wrap gap-1.5 mt-3">
              <span
                v-for="tag in post.tags"
                :key="tag"
                class="chip-gray"
              >
                #{{ tag }}
              </span>
            </div>
          </div>

          <h1 class="text-heading-2 md:text-heading-1 font-bold text-ink-900 mb-6 leading-tight">
            {{ post.title }}
          </h1>

          <!-- 作者信息 -->
          <div class="flex items-center gap-3 pb-5 border-b border-ink-50 mb-6">
            <NAvatar
              round
              :src="post.author?.avatar"
              class="!bg-gradient-primary !w-12 !h-12"
            >
              <User class="w-6 h-6 text-white" />
            </NAvatar>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-heading-4 font-semibold text-ink-900">
                  {{ post.author?.nickname || post.author?.username }}
                </span>
                <span
                  v-if="post.author?.isTrusted"
                  class="trusted-badge"
                >
                  <ShieldCheck class="w-3 h-3" />
                  可信
                </span>
              </div>
              <div class="flex items-center gap-2 mt-0.5 text-caption text-ink-400">
                <span>{{ formatDate(post.createdAt) }}</span>
                <span>·</span>
                <span>信用分 {{ post.author?.creditScore || 0 }}</span>
                <span v-if="post.author?.bio" class="hidden md:inline">
                  · {{ post.author.bio }}
                </span>
              </div>
            </div>
          </div>

          <!-- 正文内容 -->
          <div class="prose prose-sm md:prose-base max-w-none">
            <div
              class="text-body md:text-[15px] text-ink-700 leading-relaxed whitespace-pre-wrap"
              style="line-height: 1.9"
            >
              {{ post.content }}
            </div>
          </div>

          <!-- 图片网格 -->
          <div
            v-if="post.images && post.images.length > 0"
            class="grid gap-3 mt-6"
            :class="imageGridClass"
          >
            <div
              v-for="(_, idx) in post.images"
              :key="idx"
              class="relative aspect-square rounded-2xl overflow-hidden bg-ink-50 group"
            >
              <NImage
                v-if="post.images?.[idx]"
                :src="post.images[idx]"
                object-fit="cover"
                class="!w-full !h-full transition-transform duration-300 group-hover:scale-105"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-5xl md:text-6xl
                       bg-gradient-to-br"
                :class="[
                  idx % 5 === 0 ? 'from-primary-100 to-primary-200' :
                  idx % 5 === 1 ? 'from-mint-100 to-mint-200' :
                  idx % 5 === 2 ? 'from-lavender-100 to-lavender-200' :
                  idx % 5 === 3 ? 'from-blue-50 to-blue-100' :
                  'from-orange-50 to-orange-100'
                ]"
              >
                {{ ['🍼', '🥣', '👶', '🧸', '🌷', '🎀', '💝', '🌸', '🦄'][idx % 9] }}
              </div>
            </div>
          </div>

          <!-- 互动按钮 -->
          <div class="flex items-center justify-between gap-2 mt-8 pt-5 border-t border-ink-50">
            <div class="flex items-center gap-2 md:gap-3">
              <button
                class="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl transition-all"
                :class="post.isLiked
                  ? 'bg-primary-50 text-primary-500'
                  : 'bg-ink-50 text-ink-600 hover:bg-primary-50 hover:text-primary-500'"
                @click="handleLike"
              >
                <Heart
                  class="w-4 h-4 md:w-5 md:h-5"
                  :class="[
                    post.isLiked ? 'fill-primary-500' : '',
                    likeAnimating ? 'animate-scale-pulse' : '',
                  ]"
                />
                <span class="text-caption md:text-body font-semibold">{{ post.likeCount }}</span>
              </button>

              <a
                href="#comments"
                class="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl
                       bg-ink-50 text-ink-600 hover:bg-lavender-50 hover:text-lavender-600 transition-all"
              >
                <MessageCircle class="w-4 h-4 md:w-5 md:h-5" />
                <span class="text-caption md:text-body font-semibold">{{ post.commentCount }}</span>
              </a>

              <button
                class="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl transition-all"
                :class="post.isFavorited
                  ? 'bg-mint-50 text-mint-700'
                  : 'bg-ink-50 text-ink-600 hover:bg-mint-50 hover:text-mint-700'"
                @click="handleFavorite"
              >
                <Bookmark
                  class="w-4 h-4 md:w-5 md:h-5"
                  :class="[
                    post.isFavorited ? 'fill-mint-500' : '',
                    favAnimating ? 'animate-scale-pulse' : '',
                  ]"
                />
                <span class="text-caption md:text-body font-semibold">收藏</span>
              </button>
            </div>

            <div class="flex items-center gap-2">
              <button
                class="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-ink-50 text-ink-500
                       hover:bg-ink-100 hover:text-ink-700 flex items-center justify-center transition-all"
                @click="handleShare"
              >
                <Share2 class="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                class="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-ink-50 text-ink-500
                       hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all"
                @click="handleReport"
              >
                <Flag class="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- 评论区 -->
        <div id="comments" class="card p-5 md:p-8">
          <h2 class="text-heading-4 font-semibold text-ink-900 mb-6 flex items-center gap-2">
            <MessageCircle class="w-5 h-5 text-primary-500" />
            全部评论
            <span class="text-caption text-ink-400 font-normal">
              ({{ comments.length }})
            </span>
          </h2>

          <!-- 评论输入框 -->
          <div class="mb-8">
            <div
              v-if="replyTo"
              class="flex items-center gap-2 mb-3 px-4 py-2 rounded-xl bg-primary-50 text-caption"
            >
              <Reply class="w-3.5 h-3.5 text-primary-500" />
              <span class="text-ink-600">
                回复 <span class="text-primary-600 font-medium">@{{ replyTo.username }}</span>
              </span>
              <button
                class="ml-auto text-ink-400 hover:text-ink-600"
                @click="cancelReply"
              >
                取消
              </button>
            </div>

            <div class="flex gap-3">
              <NAvatar
                round
                size="medium"
                :src="userStore.userInfo?.avatar"
                class="!bg-gradient-primary !w-10 !h-10 flex-shrink-0"
              >
                <User class="w-5 h-5 text-white" />
              </NAvatar>
              <div class="flex-1 flex flex-col gap-2">
                <textarea
                  id="comment-input"
                  v-model="commentContent"
                  class="textarea-base min-h-[90px]"
                  :placeholder="replyTo ? `回复 @${replyTo.username}...` : '说点什么吧，友善评论~'"
                  maxlength="500"
                />
                <div class="flex items-center justify-between">
                  <span class="text-caption text-ink-300">
                    {{ commentContent.length }}/500
                  </span>
                  <NButton
                    type="primary"
                    round
                    size="large"
                    :loading="submitting"
                    :disabled="!commentContent.trim()"
                    class="!bg-gradient-primary !border-0 !px-6"
                    @click="submitComment"
                  >
                    <Send class="w-4 h-4 mr-1" />
                    发表评论
                  </NButton>
                </div>
              </div>
            </div>
          </div>

          <!-- 评论列表 -->
          <div v-if="comments.length > 0" class="space-y-6">
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="pb-6 border-b border-ink-50 last:border-0 last:pb-0"
            >
              <div class="flex gap-3">
                <NAvatar
                  round
                  size="small"
                  :src="comment.author?.avatar"
                  class="!bg-lavender-200 !w-9 !h-9 flex-shrink-0"
                >
                  <User class="w-4 h-4 text-lavender-600" />
                </NAvatar>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-body font-semibold text-ink-900">
                      {{ comment.author?.nickname || comment.author?.username }}
                    </span>
                    <span
                      v-if="comment.author?.isTrusted"
                      class="trusted-badge !text-[9px]"
                    >
                      可信
                    </span>
                    <span class="text-caption text-ink-400 ml-auto">
                      {{ formatDate(comment.createdAt) }}
                    </span>
                  </div>
                  <p class="text-body text-ink-700 leading-relaxed mb-2">
                    {{ comment.content }}
                  </p>
                  <div class="flex items-center gap-4">
                    <button
                      class="flex items-center gap-1 text-caption text-ink-400
                             hover:text-primary-500 transition-colors"
                    >
                      <ThumbsUp class="w-3.5 h-3.5" />
                      {{ comment.likeCount }}
                    </button>
                    <button
                      class="flex items-center gap-1 text-caption text-ink-400
                             hover:text-primary-500 transition-colors"
                      @click="startReply(comment)"
                    >
                      <Reply class="w-3.5 h-3.5" />
                      回复
                    </button>
                  </div>

                  <!-- 回复列表 -->
                  <div
                    v-if="(comment as any).replies && (comment as any).replies.length > 0"
                    class="mt-4 ml-2 pl-4 border-l-2 border-ink-100 space-y-4"
                  >
                    <div
                      v-for="reply in (comment as any).replies"
                      :key="reply.id"
                    >
                      <div class="flex gap-3">
                        <NAvatar
                          round
                          size="small"
                          :src="reply.author?.avatar"
                          class="!bg-mint-200 !w-8 !h-8 flex-shrink-0"
                        >
                          <User class="w-3.5 h-3.5 text-mint-700" />
                        </NAvatar>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2 mb-1">
                            <span class="text-caption font-semibold text-ink-900">
                              {{ reply.author?.nickname || reply.author?.username }}
                            </span>
                            <span
                              v-if="reply.replyTo && reply.author"
                              class="text-caption text-ink-400"
                            >
                              回复
                            </span>
                            <span class="text-caption text-primary-600">
                              {{ reply.replyTo === comment.userId
                                ? comment.author?.nickname || comment.author?.username
                                : '' }}
                            </span>
                            <span class="text-caption text-ink-400 ml-auto">
                              {{ formatDate(reply.createdAt) }}
                            </span>
                          </div>
                          <p class="text-caption text-ink-700 leading-relaxed mb-1">
                            {{ reply.content }}
                          </p>
                          <button
                            class="text-caption text-ink-400 hover:text-primary-500
                                   transition-colors flex items-center gap-1"
                            @click="startReply(reply)"
                          >
                            <Reply class="w-3 h-3" />
                            回复
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="py-12">
            <NEmpty description="还没有评论，来抢沙发吧~" />
          </div>
        </div>
      </article>
    </template>
  </div>
</template>
