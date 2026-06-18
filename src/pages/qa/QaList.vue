<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Flame, Clock, Coins, Filter, Star, ChevronRight, MessageCirclePlus, TrendingUp, Award } from 'lucide-vue-next'
import { getQuestionList, getExpertList } from '@/api/qa'
import QuestionCard from '@/components/qa/QuestionCard.vue'
import { useUserStore } from '@/stores/user'
import type { Question, Expert } from '@shared/types'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const questions = ref<Question[]>([])
const hotExperts = ref<Expert[]>([])
const activeTab = ref('全部')
const activeSort = ref('latest')
const activeStatus = ref('all')

const categories = ['全部', '喂养问题', '睡眠问题', '疾病护理', '早教启蒙', '产后心理']
const sortOptions = [
  { label: '最新', value: 'latest', icon: Clock },
  { label: '最热', value: 'hot', icon: Flame },
  { label: '悬赏高', value: 'reward', icon: Coins },
]
const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '待回答', value: 'unanswered' },
  { label: '已回答', value: 'answered' },
]

const mockQuestions: Question[] = [
  {
    id: 1,
    userId: 1,
    title: '宝宝3个月突然不肯喝奶瓶了怎么办？之前一直混合喂养，最近一周开始抗拒奶瓶，一碰到奶嘴就哭',
    content: '我家宝宝刚满3个月，之前一直是混合喂养，母乳和奶瓶都接受。最近一周开始突然不肯喝奶瓶了，一碰到奶嘴就哭，但是亲喂还是吃的。试过换奶嘴、换奶粉、让别人喂、饿一会都不行，请问有什么好办法吗？',
    category: '喂养问题',
    isPublic: true,
    viewCount: 2341,
    isAnswered: true,
    watchCount: 156,
    createdAt: '2024-06-15T10:30:00Z',
    updatedAt: '2024-06-15T12:00:00Z',
    author: { id: 1, nickname: '焦虑的新手妈', avatar: '' } as any,
    expert: { id: 1, nickname: '张医生', avatar: '', specialty: '儿科' } as any,
  } as any,
  {
    id: 2,
    userId: 2,
    title: '6个月宝宝辅食添加顺序是怎样的？第一口吃什么最好？需要注意什么？',
    content: '宝宝马上6个月了，准备开始加辅食，看了很多资料说法都不一样。有的说先加米粉，有的说可以直接加肉泥。到底应该怎么加？每天加多少？出现过敏怎么办？求有经验的妈妈和专家分享。',
    category: '喂养问题',
    isPublic: true,
    viewCount: 5672,
    isAnswered: true,
    watchCount: 342,
    createdAt: '2024-06-14T08:15:00Z',
    updatedAt: '2024-06-14T10:30:00Z',
    author: { id: 2, nickname: '爱吃鱼的猫', avatar: '' } as any,
    expert: { id: 4, nickname: '陈营养师', avatar: '', specialty: '营养' } as any,
  } as any,
  {
    id: 3,
    userId: 3,
    title: '宝宝反复湿疹怎么办？用了激素药膏也不见好，脸上身上都是',
    content: '宝宝5个月，湿疹反复快2个月了。去医院开了激素药膏，涂了就好，停了就复发。现在脸上、头上、身上都有，宝宝经常抓得出血。母乳喂养，我已经忌口牛奶鸡蛋海鲜了还是不行。求支招！',
    category: '疾病护理',
    isPublic: true,
    viewCount: 8934,
    isAnswered: true,
    watchCount: 528,
    createdAt: '2024-06-13T14:20:00Z',
    updatedAt: '2024-06-13T16:45:00Z',
    author: { id: 3, nickname: '心疼宝宝的妈', avatar: '' } as any,
    expert: { id: 6, nickname: '孙医生', avatar: '', specialty: '儿科' } as any,
  } as any,
  {
    id: 4,
    userId: 4,
    title: '产后3个月情绪特别低落，经常想哭，是不是产后抑郁？需要看医生吗？',
    content: '生完宝宝3个月了，最近情绪特别不好，经常一个人偷偷哭。看着宝宝也开心不起来，觉得自己不是个好妈妈。晚上睡不好，白天也没精神。老公说我想太多了，但是我真的很难受...',
    category: '产后心理',
    isPublic: true,
    viewCount: 4521,
    isAnswered: true,
    watchCount: 287,
    createdAt: '2024-06-12T20:00:00Z',
    updatedAt: '2024-06-12T22:30:00Z',
    author: { id: 4, nickname: '需要抱抱的妈妈', avatar: '' } as any,
    expert: { id: 5, nickname: '赵心理师', avatar: '', specialty: '心理' } as any,
  } as any,
  {
    id: 5,
    userId: 5,
    title: '2岁宝宝说话晚只会叫爸妈，正常吗？需要做语言训练吗？',
    content: '我家男宝刚满2岁，现在只会叫爸爸妈妈奶奶，其他都不会说，但是能听懂我们说的话，也会用手势表达。和他一样大的宝宝都能说句子了。我有点担心，是等一等还是去做语言训练？',
    category: '早教启蒙',
    isPublic: true,
    viewCount: 6789,
    isAnswered: false,
    watchCount: 0,
    createdAt: '2024-06-16T09:00:00Z',
    updatedAt: '2024-06-16T09:00:00Z',
    author: { id: 5, nickname: '着急的宝妈', avatar: '' } as any,
  } as any,
  {
    id: 6,
    userId: 6,
    title: '宝宝夜醒频繁怎么办？8个月了一晚上醒5-6次，大人都熬垮了',
    content: '宝宝8个月了，从出生到现在睡眠一直不好。最近一晚上醒5-6次，每次都要抱起来哄很久才能放下。查了不是热了冷了，也吃饱了，尿不湿也换了。不知道是不是长牙？有什么睡眠训练的方法吗？',
    category: '睡眠问题',
    isPublic: true,
    viewCount: 12453,
    isAnswered: false,
    watchCount: 0,
    createdAt: '2024-06-16T07:30:00Z',
    updatedAt: '2024-06-16T07:30:00Z',
    author: { id: 6, nickname: '国宝级熊猫眼', avatar: '' } as any,
  } as any,
]

const hotQuestions = [
  { rank: 1, title: '宝宝发烧39度怎么办？这5个误区千万不要踩', views: 56789, reward: 99 },
  { rank: 2, title: '6个月宝宝辅食添加全攻略，附详细食谱表', views: 45231, reward: 59 },
  { rank: 3, title: '产后恢复黄金期6个月，宝妈们别错过！', views: 39872, reward: 0 },
  { rank: 4, title: '宝宝湿疹反复？可能是这3个原因没注意', views: 34567, reward: 39 },
  { rank: 5, title: '0-1岁宝宝发育里程碑，你家宝宝达标了吗', views: 29834, reward: 0 },
  { rank: 6, title: '宝宝不爱喝奶？试试这7个实用小技巧', views: 25678, reward: 29 },
  { rank: 7, title: '新生儿护理新手必看，这20条太重要了', views: 22345, reward: 0 },
  { rank: 8, title: '如何正确给宝宝添加米粉？很多家长第一步就错了', views: 19876, reward: 39 },
  { rank: 9, title: '宝宝大便颜色对照表，出现这种颜色要警惕', views: 17654, reward: 0 },
  { rank: 10, title: '亲子阅读从多大开始？0-3岁绘本推荐清单', views: 15432, reward: 29 },
]

const mockExperts: Expert[] = [
  {
    id: 1,
    nickname: '张医生',
    avatar: '',
    specialty: '儿科',
    rating: 4.9,
    reviewCount: 156,
  } as any,
  {
    id: 4,
    nickname: '陈营养师',
    avatar: '',
    specialty: '营养',
    rating: 4.7,
    reviewCount: 176,
  } as any,
  {
    id: 5,
    nickname: '赵心理师',
    avatar: '',
    specialty: '心理',
    rating: 4.9,
    reviewCount: 134,
  } as any,
]

const avatarColors = [
  'from-pink-400 to-rose-500',
  'from-green-400 to-emerald-500',
  'from-fuchsia-400 to-pink-500',
]

const filteredQuestions = computed(() => {
  let result = [...questions.value]
  if (activeTab.value !== '全部') {
    result = result.filter(q => q.category === activeTab.value)
  }
  if (activeStatus.value === 'answered') {
    result = result.filter(q => q.isAnswered)
  } else if (activeStatus.value === 'unanswered') {
    result = result.filter(q => !q.isAnswered)
  }
  if (activeSort.value === 'hot') {
    result.sort((a, b) => b.viewCount - a.viewCount)
  } else if (activeSort.value === 'reward') {
    result.sort((a, b) => Number(b.isAnswered) - Number(a.isAnswered))
  }
  return result
})

const rankColor = (rank: number) => {
  if (rank === 1) return 'text-amber-500 bg-amber-50'
  if (rank === 2) return 'text-slate-500 bg-slate-50'
  if (rank === 3) return 'text-orange-700 bg-orange-50'
  return 'text-ink-400 bg-ink-50'
}

const fetchData = async () => {
  loading.value = true
  try {
    const [qRes, eRes] = await Promise.all([
      getQuestionList({ page: 1, pageSize: 20 }),
      getExpertList({ page: 1, pageSize: 3 }),
    ])
    questions.value = qRes.list.length > 0 ? qRes.list : mockQuestions
    hotExperts.value = eRes.list.length > 0 ? eRes.list.slice(0, 3) : mockExperts
  } catch {
    questions.value = mockQuestions
    hotExperts.value = mockExperts
  } finally {
    loading.value = false
  }
}

const goAsk = () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
  } else {
    router.push('/qa/ask')
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="min-h-screen bg-cream-50 py-8">
    <div class="container">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 class="text-heading-1 text-ink-900 mb-1">育儿问答</h1>
          <p class="text-body text-ink-500">专业专家答疑，百万宝妈经验分享</p>
        </div>
        <button class="btn-primary h-12 px-6" @click="goAsk">
          <MessageCirclePlus class="w-5 h-5" />
          立即提问
        </button>
      </div>

      <div class="card p-2 mb-6 inline-flex flex-wrap gap-1 animate-fade-in-up">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="activeTab = cat"
          :class="[
            'h-9 px-4 rounded-xl font-medium transition-all duration-200 text-sm',
            activeTab === cat
              ? 'bg-gradient-primary text-white shadow-sm'
              : 'text-ink-600 hover:bg-ink-50'
          ]"
        >
          {{ cat }}
        </button>
      </div>

      <div class="card p-4 mb-6 flex flex-wrap items-center gap-4 animate-fade-in-up">
        <div class="flex items-center gap-2">
          <Filter class="w-4 h-4 text-ink-400" />
          <span class="text-caption text-ink-500">排序：</span>
          <div class="flex gap-1">
            <button
              v-for="opt in sortOptions"
              :key="opt.value"
              @click="activeSort = opt.value"
              :class="[
                'h-8 px-3 rounded-lg text-sm font-medium transition-all flex items-center gap-1',
                activeSort === opt.value
                  ? 'bg-primary-50 text-primary-500'
                  : 'text-ink-500 hover:bg-ink-50'
              ]"
            >
              <component :is="opt.icon" class="w-3.5 h-3.5" />
              {{ opt.label }}
            </button>
          </div>
        </div>
        <div class="h-5 w-px bg-ink-100" />
        <div class="flex items-center gap-2">
          <span class="text-caption text-ink-500">状态：</span>
          <div class="flex gap-1">
            <button
              v-for="opt in statusOptions"
              :key="opt.value"
              @click="activeStatus = opt.value"
              :class="[
                'h-8 px-3 rounded-lg text-sm font-medium transition-all',
                activeStatus === opt.value
                  ? 'bg-primary-50 text-primary-500'
                  : 'text-ink-500 hover:bg-ink-50'
              ]"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div class="lg:col-span-7 space-y-4">
          <n-skeleton v-if="loading" :rows="6" />
          <div v-else class="space-y-4 stagger">
            <QuestionCard
              v-for="q in filteredQuestions"
              :key="q.id"
              :question="q"
              :is-expert="userStore.isExpert"
            />
          </div>
          <n-empty
            v-if="!loading && filteredQuestions.length === 0"
            description="暂无相关问题，快来发起第一个提问吧！"
          />
        </div>

        <div class="lg:col-span-3 space-y-6">
          <div class="card p-5 animate-fade-in-up">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-heading-4 text-ink-900 flex items-center gap-2">
                <Award class="w-5 h-5 text-lavender-500" />
                热门专家
              </h3>
              <button class="text-caption text-primary-500 hover:text-primary-600 flex items-center gap-0.5" @click="router.push('/experts')">
                更多 <ChevronRight class="w-3 h-3" />
              </button>
            </div>
            <div class="space-y-3">
              <div
                v-for="(expert, idx) in hotExperts"
                :key="expert.id"
                class="flex items-center gap-3 p-2 rounded-xl hover:bg-ink-50 transition-colors cursor-pointer"
                @click="router.push('/experts')"
              >
                <div
                  :class="[
                    'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br',
                    avatarColors[idx % avatarColors.length]
                  ]"
                >
                  {{ expert.nickname?.charAt(0) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-ink-900 text-sm">{{ expert.nickname }}</div>
                  <div class="text-caption text-ink-400">{{ expert.specialty }} · 从业{{ expert.experienceYears || 10 }}年</div>
                </div>
                <div class="flex items-center gap-1">
                  <Star class="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span class="text-sm font-bold text-ink-900">{{ expert.rating }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="card p-5 animate-fade-in-up">
            <div class="flex items-center gap-2 mb-4">
              <TrendingUp class="w-5 h-5 text-primary-500" />
              <h3 class="text-heading-4 text-ink-900">热门问题榜</h3>
            </div>
            <div class="space-y-2">
              <div
                v-for="item in hotQuestions"
                :key="item.rank"
                class="flex items-start gap-3 p-2 rounded-xl hover:bg-ink-50 transition-colors cursor-pointer"
                @click="router.push(`/qa/${item.rank}`)"
              >
                <div
                  :class="[
                    'w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0',
                    rankColor(item.rank)
                  ]"
                >
                  {{ item.rank }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-ink-700 line-clamp-2 hover:text-primary-500 transition-colors">
                    {{ item.title }}
                  </p>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-caption text-ink-400">{{ (item.views / 1000).toFixed(1) }}k浏览</span>
                    <span v-if="item.reward" class="text-caption text-primary-500 font-medium">悬赏¥{{ item.reward }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="relative overflow-hidden rounded-2xl p-6 bg-gradient-lavender text-white animate-fade-in-up">
            <div class="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
            <div class="absolute -bottom-12 -left-8 w-40 h-40 rounded-full bg-white/5" />
            <div class="relative">
              <div class="text-2xl mb-2">👶</div>
              <h3 class="text-heading-3 font-bold mb-2">有育儿疑问？</h3>
              <p class="text-white/90 text-sm mb-4">专家一对一解答，最快3分钟响应</p>
              <button class="w-full h-11 rounded-xl bg-white text-lavender-700 font-medium hover:bg-white/90 transition-colors" @click="goAsk">
                立即提问
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
