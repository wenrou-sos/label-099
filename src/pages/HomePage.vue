<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  NCarousel,
  NSkeleton,
  NAvatar,
  NTag,
  NButton,
  NRate,
} from 'naive-ui'
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Heart,
  MessageCircle,
  Star,
  User,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Utensils,
  ShoppingBag,
  Moon,
  Activity,
  HelpCircle,
} from 'lucide-vue-next'
import { getPostList } from '@/api/post'
import { getProductList } from '@/api/product'
import { getExpertList } from '@/api/qa'
import type { Post, Product, Expert } from '../../shared/types'

const router = useRouter()

const loading = ref(true)
const hotPosts = ref<Post[]>([])
const hotProducts = ref<Product[]>([])
const experts = ref<Expert[]>([])

const banners = [
  {
    title: '新手妈妈成长营',
    subtitle: '从零开始，陪你走过宝宝的第一年',
    emoji: '👶',
    gradient: 'from-primary-400 via-primary-300 to-lavender-400',
    btnText: '立即加入',
  },
  {
    title: '闲置好物，给宝宝更好的',
    subtitle: '安全 · 实惠 · 可信的母婴二手交易',
    emoji: '🍼',
    gradient: 'from-lavender-400 via-primary-300 to-mint-400',
    btnText: '去逛逛',
  },
  {
    title: '育儿专家在线答疑',
    subtitle: '儿科医生、营养师、心理咨询师',
    emoji: '🧸',
    gradient: 'from-mint-400 via-lavender-300 to-primary-400',
    btnText: '立即咨询',
  },
]

const quickEntries = [
  {
    label: '经验分享',
    emoji: '💬',
    gradient: 'from-primary-400 to-primary-500',
    path: '/community?category=experience',
  },
  {
    label: '辅食教程',
    emoji: '🥣',
    gradient: 'from-mint-400 to-mint-500',
    path: '/community?category=food',
  },
  {
    label: '闲置交易',
    emoji: '🛍️',
    gradient: 'from-lavender-400 to-lavender-500',
    path: '/market',
  },
  {
    label: '睡眠训练',
    emoji: '🌙',
    gradient: 'from-blue-400 to-indigo-500',
    path: '/community?category=sleep',
  },
  {
    label: '产后恢复',
    emoji: '💪',
    gradient: 'from-orange-400 to-pink-500',
    path: '/community?category=recovery',
  },
  {
    label: '付费问答',
    emoji: '❓',
    gradient: 'from-purple-400 to-purple-500',
    path: '/qa/ask',
  },
]

const fallbackPosts: Post[] = [
  {
    id: 1,
    userId: 1,
    author: { id: 1, username: '小美妈', phone: '', creditScore: 98, isExpert: false, isTrusted: true, createdAt: '', updatedAt: '' },
    title: '宝宝6个月辅食添加全攻略，新手妈妈必看！',
    content: '从第一口高铁米粉到手指食物，详细记录每个阶段的食材、做法和注意事项...',
    category: '辅食制作',
    tags: ['辅食', '6个月'],
    viewCount: 12580,
    likeCount: 892,
    commentCount: 156,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    userId: 2,
    author: { id: 2, username: '果果妈咪', phone: '', creditScore: 95, isExpert: false, isTrusted: true, createdAt: '', updatedAt: '' },
    title: '关于肠胀气的那些事，我的实战经验分享',
    content: '宝宝前三个月肠胀气闹得厉害，试了各种方法终于找到了适合的...',
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
    author: { id: 3, username: '豆豆妈', phone: '', creditScore: 92, isExpert: false, isTrusted: false, createdAt: '', updatedAt: '' },
    title: '顺产vs剖腹产，我的经历告诉你怎么选',
    content: '两胎分别顺产和剖腹产，亲身经历分享两种分娩方式的优缺点...',
    category: '产后恢复',
    tags: ['分娩', '产后'],
    viewCount: 15600,
    likeCount: 1208,
    commentCount: 234,
    createdAt: '2024-01-13T09:45:00Z',
    updatedAt: '2024-01-13T09:45:00Z',
  },
  {
    id: 4,
    userId: 4,
    author: { id: 4, username: '安安妈妈', phone: '', creditScore: 90, isExpert: false, isTrusted: false, createdAt: '', updatedAt: '' },
    title: '宝宝睡眠训练第7天，终于睡整觉了！',
    content: '记录从夜醒5次到一觉睡到天亮的全过程，方法+时间表分享...',
    category: '睡眠训练',
    tags: ['睡眠', '1岁'],
    viewCount: 23450,
    likeCount: 2103,
    commentCount: 412,
    createdAt: '2024-01-12T20:10:00Z',
    updatedAt: '2024-01-12T20:10:00Z',
  },
]

const fallbackProducts: Product[] = [
  {
    id: 1,
    userId: 1,
    seller: { id: 1, username: '米粒妈', phone: '', creditScore: 96, isExpert: false, isTrusted: true, avatar: '', nickname: '米粒妈', createdAt: '', updatedAt: '' },
    title: 'Stokke Tripp Trapp 成长椅 经典款',
    description: '99成新，宝宝坐了没几次，配件齐全',
    images: [],
    category: 'baby_gear',
    condition: 'like_new',
    originalPrice: 2599,
    price: 1680,
    location: '北京·朝阳区',
    isNegotiable: true,
    status: 'available',
    viewCount: 328,
    favoriteCount: 56,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 2,
    userId: 2,
    seller: { id: 2, username: '小核桃', phone: '', creditScore: 94, isExpert: false, isTrusted: true, avatar: '', nickname: '小核桃', createdAt: '', updatedAt: '' },
    title: 'Britax 双面骑士安全座椅 0-4岁',
    description: '全新未拆封，朋友送的重复了，转需',
    images: [],
    category: 'baby_gear',
    condition: 'new',
    originalPrice: 3680,
    price: 2580,
    location: '上海·浦东新区',
    isNegotiable: false,
    status: 'available',
    viewCount: 512,
    favoriteCount: 89,
    createdAt: '2024-01-14T14:30:00Z',
    updatedAt: '2024-01-14T14:30:00Z',
  },
  {
    id: 3,
    userId: 3,
    seller: { id: 3, username: '柠檬妈', phone: '', creditScore: 91, isExpert: false, isTrusted: false, avatar: '', nickname: '柠檬妈', createdAt: '', updatedAt: '' },
    title: '费雪钢琴健身架 0-1岁宝宝玩具',
    description: '轻微使用痕迹，功能完好，宝宝大了用不上',
    images: [],
    category: 'baby_toys',
    condition: 'good',
    originalPrice: 599,
    price: 220,
    location: '广州·天河区',
    isNegotiable: true,
    status: 'available',
    viewCount: 286,
    favoriteCount: 34,
    createdAt: '2024-01-13T11:20:00Z',
    updatedAt: '2024-01-13T11:20:00Z',
  },
  {
    id: 4,
    userId: 4,
    seller: { id: 4, username: '糖糖妈咪', phone: '', creditScore: 97, isExpert: false, isTrusted: true, avatar: '', nickname: '糖糖妈咪', createdAt: '', updatedAt: '' },
    title: 'gb好孩子婴儿床 实木多功能',
    description: '9成新，可拼接大床，有储物抽屉，送床品',
    images: [],
    category: 'baby_gear',
    condition: 'good',
    originalPrice: 1299,
    price: 580,
    location: '深圳·南山区',
    isNegotiable: true,
    status: 'available',
    viewCount: 421,
    favoriteCount: 67,
    createdAt: '2024-01-12T16:40:00Z',
    updatedAt: '2024-01-12T16:40:00Z',
  },
]

const fallbackExperts: (Expert & { specialties: string[]; consultationFee: number })[] = [
  {
    id: 101,
    username: '李医生',
    phone: '',
    nickname: '李婉婷',
    creditScore: 100,
    isExpert: true,
    isTrusted: true,
    specialty: '儿科常见病、新生儿护理',
    specialties: ['新生儿护理', '发热感冒', '疫苗接种'],
    licenseNumber: '110101199001011234',
    experienceYears: 12,
    verifiedAt: '2023-06-01T00:00:00Z',
    rating: 4.9,
    reviewCount: 1528,
    consultationFee: 88,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 102,
    username: '营养师王',
    phone: '',
    nickname: '王美华',
    creditScore: 100,
    isExpert: true,
    isTrusted: true,
    specialty: '婴幼儿营养、辅食添加',
    specialties: ['辅食添加', '挑食偏食', '营养评估'],
    licenseNumber: '220101198505015678',
    experienceYears: 15,
    verifiedAt: '2023-03-15T00:00:00Z',
    rating: 4.8,
    reviewCount: 2341,
    consultationFee: 68,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 103,
    username: '心理师张',
    phone: '',
    nickname: '张雨桐',
    creditScore: 100,
    isExpert: true,
    isTrusted: true,
    specialty: '产后心理、亲子关系',
    specialties: ['产后抑郁', '亲子依恋', '情绪管理'],
    licenseNumber: '330101198808089012',
    experienceYears: 10,
    verifiedAt: '2023-08-20T00:00:00Z',
    rating: 4.9,
    reviewCount: 892,
    consultationFee: 128,
    createdAt: '',
    updatedAt: '',
  },
]

const productEmojis: Record<string, string> = {
  baby_gear: '🚼',
  baby_toys: '🧸',
  baby_clothes: '👕',
  baby_food: '🍼',
  maternity: '🤰',
  diapers: '🧷',
  other: '📦',
}

function getConditionClass(condition: string) {
  switch (condition) {
    case 'new':
      return 'condition-new'
    case 'like_new':
      return 'condition-like-new'
    case 'good':
      return 'condition-light'
    default:
      return 'condition-heavy'
  }
}

function getConditionText(condition: string) {
  switch (condition) {
    case 'new':
      return '全新'
    case 'like_new':
      return '99新'
    case 'good':
      return '轻微'
    default:
      return '明显'
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function go(path: string) {
  router.push(path)
}

async function fetchData() {
  loading.value = true
  try {
    const [postsRes, productsRes, expertsRes] = await Promise.allSettled([
      getPostList({ page: 1, pageSize: 4 }),
      getProductList({ page: 1, pageSize: 4 }),
      getExpertList({ page: 1, pageSize: 3 }),
    ])

    if (postsRes.status === 'fulfilled' && postsRes.value.list.length > 0) {
      hotPosts.value = postsRes.value.list
    } else {
      hotPosts.value = fallbackPosts
    }

    if (productsRes.status === 'fulfilled' && productsRes.value.list.length > 0) {
      hotProducts.value = productsRes.value.list
    } else {
      hotProducts.value = fallbackProducts
    }

    if (expertsRes.status === 'fulfilled' && expertsRes.value.list.length > 0) {
      experts.value = expertsRes.value.list.map((e: any) => ({
        ...e,
        specialties: e.specialty?.split(/[,，、]/) || [],
        consultationFee: e.consultationFee || 88,
      }))
    } else {
      experts.value = fallbackExperts as any
    }
  } catch {
    hotPosts.value = fallbackPosts
    hotProducts.value = fallbackProducts
    experts.value = fallbackExperts as any
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="container mx-auto px-4 py-6 md:py-8 space-y-10 md:space-y-12">
    <!-- Hero 轮播区 -->
    <section class="stagger">
      <NCarousel
        :show-dots="true"
        :autoplay="true"
        :interval="5000"
        :dot-placement="'bottom'"
        dot-color="rgba(255,255,255,0.4)"
        dot-color-active="rgba(255,255,255,1)"
        class="rounded-3xl overflow-hidden"
      >
        <div
          v-for="(banner, idx) in banners"
          :key="idx"
          class="h-[280px] md:h-[360px] relative bg-gradient-to-br overflow-hidden"
          :class="banner.gradient"
        >
          <div class="absolute inset-0 flex items-center justify-between px-6 md:px-16">
            <div class="flex-1 max-w-xl space-y-4 md:space-y-6 text-white z-10">
              <h1 class="text-heading-2 md:text-heading-1 font-bold leading-tight drop-shadow-sm">
                {{ banner.title }}
              </h1>
              <p class="text-body md:text-heading-4 opacity-90 font-medium">
                {{ banner.subtitle }}
              </p>
              <button
                class="btn !bg-white !text-primary-500 !h-11 md:!h-12 !px-6 md:!px-8 !font-semibold
                       hover:!translate-y-[-2px] hover:!shadow-lg transition-all"
                @click="go(banner.btnText === '去逛逛' ? '/market' : banner.btnText === '立即咨询' ? '/experts' : '/community')"
              >
                {{ banner.btnText }}
                <ArrowRight class="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
            <div
              class="hidden md:flex flex-shrink-0 w-48 h-48 md:w-64 md:h-64 rounded-3xl
                     bg-white/20 backdrop-blur-sm items-center justify-center
                     text-6xl md:text-8xl animate-float"
              style="animation-delay: 0.2s"
            >
              {{ banner.emoji }}
            </div>
          </div>

          <div class="absolute top-4 right-4 flex gap-2 z-20">
            <button
              class="n-carousel__arrow w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm
                     text-white flex items-center justify-center
                     hover:bg-white/30 transition-all"
            >
              <ChevronLeft class="w-5 h-5" />
            </button>
            <button
              class="n-carousel__arrow w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm
                     text-white flex items-center justify-center
                     hover:bg-white/30 transition-all"
            >
              <ChevronRight class="w-5 h-5" />
            </button>
          </div>

          <div class="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10" />
          <div class="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/10" />
        </div>
      </NCarousel>
    </section>

    <!-- 快捷功能入口 -->
    <section class="stagger">
      <div class="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
        <button
          v-for="(entry, idx) in quickEntries"
          :key="idx"
          class="flex flex-col items-center gap-3 p-4 md:p-5 rounded-2xl bg-white card-hover group"
          @click="go(entry.path)"
        >
          <div
            class="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center
                   text-2xl md:text-3xl bg-gradient-to-br shadow-md
                   group-hover:scale-110 transition-transform"
            :class="entry.gradient"
          >
            {{ entry.emoji }}
          </div>
          <span class="text-body md:text-caption font-medium text-ink-700 group-hover:text-primary-500 transition-colors">
            {{ entry.label }}
          </span>
        </button>
      </div>
    </section>

    <!-- 热门话题区 -->
    <section class="stagger">
      <div class="section-title">
        <div class="flex items-center gap-2">
          <Sparkles class="w-5 h-5 md:w-6 md:h-6 text-primary-500" />
          <h2>热门话题</h2>
        </div>
        <button
          class="flex items-center gap-1 text-primary-500 hover:text-primary-600 font-medium transition-colors"
          @click="go('/community')"
        >
          查看全部
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>

      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <NSkeleton
          v-for="i in 4"
          :key="i"
          text
          :repeat="4"
          round
          class="!h-[180px] md:!h-[200px]"
        />
      </div>

      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
      >
        <button
          v-for="post in hotPosts"
          :key="post.id"
          class="card-hover p-5 md:p-6 text-left group relative overflow-hidden
                 bg-gradient-to-br from-primary-50 via-white to-lavender-50"
          @click="go(`/community/${post.id}`)"
        >
          <div class="flex items-start justify-between gap-3 mb-3">
            <span
              class="chip-primary !bg-gradient-primary !text-white !py-1.5"
            >
              {{ post.category }}
            </span>
            <span class="text-caption text-ink-400 whitespace-nowrap">
              {{ formatDate(post.createdAt) }}
            </span>
          </div>

          <h3
            class="text-heading-4 md:text-heading-3 font-semibold text-ink-900 mb-2
                   line-clamp-2 group-hover:text-primary-500 transition-colors"
          >
            {{ post.title }}
          </h3>

          <p class="text-body text-ink-500 line-clamp-2 mb-4">
            {{ post.content }}
          </p>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <NAvatar
                round
                size="small"
                :src="post.author?.avatar"
                class="!bg-gradient-primary !w-7 !h-7"
              >
                <User class="w-3.5 h-3.5 text-white" />
              </NAvatar>
              <div class="flex items-center gap-1">
                <span class="text-caption font-medium text-ink-700">
                  {{ post.author?.nickname || post.author?.username }}
                </span>
                <ShieldCheck
                  v-if="post.author?.isTrusted"
                  class="w-3.5 h-3.5 text-primary-500"
                />
              </div>
            </div>

            <div class="flex items-center gap-3 text-ink-400">
              <span class="flex items-center gap-1 text-caption">
                <MessageCircle class="w-3.5 h-3.5" />
                {{ post.commentCount }}
              </span>
              <span class="flex items-center gap-1 text-caption">
                <Heart class="w-3.5 h-3.5" />
                {{ post.likeCount }}
              </span>
            </div>
          </div>

          <div
            class="absolute -bottom-8 -right-8 w-24 h-24 rounded-full
                   bg-gradient-primary opacity-5 group-hover:opacity-10 transition-opacity"
          />
        </button>
      </div>
    </section>

    <!-- 精选闲置商品区 -->
    <section class="stagger">
      <div class="section-title">
        <div class="flex items-center gap-2">
          <ShoppingBag class="w-5 h-5 md:w-6 md:h-6 text-primary-500" />
          <h2>精选闲置</h2>
        </div>
        <button
          class="flex items-center gap-1 text-primary-500 hover:text-primary-600 font-medium transition-colors"
          @click="go('/market')"
        >
          查看全部
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>

      <div v-if="loading" class="overflow-x-auto -mx-4 px-4">
        <div class="flex gap-4 w-max">
          <NSkeleton
            v-for="i in 4"
            :key="i"
            class="w-[220px] !h-[320px] rounded-2xl"
            round
          />
        </div>
      </div>

      <div
        v-else
        class="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-2"
      >
        <div class="flex gap-4 md:gap-6 w-max md:w-auto md:grid md:grid-cols-2 lg:grid-cols-4">
          <button
            v-for="product in hotProducts"
            :key="product.id"
            class="card-hover overflow-hidden w-[220px] md:w-auto text-left flex-shrink-0 group"
            @click="go(`/market/${product.id}`)"
          >
            <div
              class="relative w-full aspect-square bg-gradient-to-br flex items-center justify-center text-6xl"
              :class="[
                product.condition === 'new' ? 'from-mint-100 to-mint-200' :
                product.condition === 'like_new' ? 'from-blue-50 to-lavender-100' :
                product.condition === 'good' ? 'from-orange-50 to-primary-100' :
                'from-ink-50 to-ink-100'
              ]"
            >
              {{ productEmojis[product.category] || '📦' }}
              <span
                :class="getConditionClass(product.condition)"
                class="absolute top-3 left-3"
              >
                {{ getConditionText(product.condition) }}
              </span>
              <div
                v-if="product.isNegotiable"
                class="absolute top-3 right-3 chip-lavender !py-0.5 !px-2"
              >
                可议价
              </div>
            </div>

            <div class="p-4">
              <h4
                class="text-body font-medium text-ink-900 line-clamp-2 mb-2
                       group-hover:text-primary-500 transition-colors h-[44px]"
              >
                {{ product.title }}
              </h4>

              <div class="flex items-baseline gap-2 mb-3">
                <span class="price-tag text-xl md:text-2xl">
                  ¥{{ product.price }}
                </span>
                <span class="price-origin">
                  ¥{{ product.originalPrice }}
                </span>
              </div>

              <div class="flex items-center justify-between border-t border-ink-50 pt-3">
                <div class="flex items-center gap-1.5 min-w-0">
                  <NAvatar
                    round
                    size="small"
                    :src="product.seller?.avatar"
                    class="!bg-lavender-200 !w-6 !h-6 flex-shrink-0"
                  >
                    <User class="w-3 h-3 text-lavender-600" />
                  </NAvatar>
                  <span class="text-caption text-ink-500 truncate max-w-[80px]">
                    {{ product.seller?.nickname || product.seller?.username }}
                  </span>
                </div>
                <span class="text-caption text-ink-400 flex-shrink-0">
                  {{ product.location?.split('·')[0] || '同城' }}
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </section>

    <!-- 认证专家推荐区 -->
    <section class="stagger">
      <div class="section-title">
        <div class="flex items-center gap-2">
          <Star class="w-5 h-5 md:w-6 md:h-6 text-primary-500" />
          <h2>专家在线</h2>
        </div>
        <button
          class="flex items-center gap-1 text-primary-500 hover:text-primary-600 font-medium transition-colors"
          @click="go('/experts')"
        >
          查看全部
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>

      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <NSkeleton
          v-for="i in 3"
          :key="i"
          round
          class="!h-[280px]"
        />
      </div>

      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
      >
        <div
          v-for="(expert, idx) in experts"
          :key="expert.id"
          class="card-hover p-5 md:p-6 group"
        >
          <div class="flex items-start gap-4 mb-4">
            <div class="relative flex-shrink-0">
              <NAvatar
                round
                size="large"
                :src="expert.avatar"
                class="!bg-gradient-to-br !from-primary-400 !to-lavender-500 !w-16 !h-16"
              >
                <User class="w-8 h-8 text-white" />
              </NAvatar>
              <div
                class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-mint-500
                       flex items-center justify-center shadow-md border-2 border-white"
              >
                <ShieldCheck class="w-4 h-4 text-white" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h4 class="text-heading-4 font-semibold text-ink-900">
                  {{ expert.nickname || expert.username }}
                </h4>
                <NTag round size="small" type="info" class="!border-0">
                  已认证
                </NTag>
              </div>
              <p class="text-caption text-ink-500 mb-2">
                {{ expert.specialty?.substring(0, 15) }}{{ expert.specialty?.length > 15 ? '...' : '' }}
              </p>
              <div class="flex items-center gap-1">
                <NRate
                  :model-value="expert.rating"
                  readonly
                  size="small"
                  color="#FFB800"
                />
                <span class="text-caption font-medium text-amber-500">
                  {{ expert.rating }}
                </span>
                <span class="text-caption text-ink-400 ml-1">
                  ({{ expert.reviewCount }}评价)
                </span>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <div class="flex flex-wrap gap-1.5 mb-4">
              <NTag
                v-for="(tag, i) in (expert as any).specialties?.slice(0, 3) || []"
                :key="i"
                round
                size="small"
                class="!bg-primary-50 !text-primary-600 !border-primary-100"
              >
                {{ tag }}
              </NTag>
            </div>

            <div class="flex items-center justify-between pt-3 border-t border-ink-50">
              <div>
                <span class="text-caption text-ink-400">咨询费</span>
                <div class="flex items-baseline gap-1">
                  <span class="text-primary-500 font-bold text-xl">
                    ¥{{ (expert as any).consultationFee || 88 }}
                  </span>
                  <span class="text-caption text-ink-400">/次</span>
                </div>
              </div>
              <NButton
                type="primary"
                round
                size="large"
                class="!bg-gradient-primary !border-0"
                @click="go(`/qa/ask?expertId=${expert.id}`)"
              >
                立即咨询
              </NButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
