<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage } from 'naive-ui'
import {
  Eye, Clock, Share2, Heart, ThumbsUp, MessageCircle,
  Shield, ChevronDown, Send, Lock, Star, Award, ChevronLeft
} from 'lucide-vue-next'
import { getQuestion, watchQuestion, createAnswer } from '@/api/qa'
import { useUserStore } from '@/stores/user'
import type { Question, Answer, Expert } from '@shared/types'

const route = useRoute()
const message = useMessage()
const userStore = useUserStore()

const loading = ref(true)
const question = ref<Question | null>(null)
const answers = ref<Answer[]>([])
const hasWatched = ref(false)
const isAuthor = ref(false)
const liked = ref(false)
const favorited = ref(false)
const likeCount = ref(23)
const favoriteCount = ref(45)
const commentText = ref('')
const showFullAnswer = ref(false)
const submittingAnswer = ref(false)
const answerText = ref('')

const mockQuestion: Question & { answers: Answer[] } = {
  id: 1,
  userId: 1,
  title: '宝宝3个月突然不肯喝奶瓶了怎么办？之前一直混合喂养，最近一周开始抗拒奶瓶，一碰到奶嘴就哭',
  content: `我家宝宝刚满3个月，之前一直是混合喂养，母乳和奶瓶都接受得很好。最近一周开始突然不肯喝奶瓶了，一碰到奶嘴就哭，但是亲喂还是吃的。

试过的方法都没用：
1. 换了3种不同品牌的奶嘴，包括仿真乳头的
2. 换了奶粉品牌
3. 让宝宝奶奶喂，我躲开
4. 饿了4个小时还是不肯喝
5. 趁宝宝迷迷糊糊的时候塞奶瓶

宝宝最近有点流口水，会不会是要长牙了？但3个月长牙是不是太早了？

有遇到同样情况的宝妈吗？求支招！再这样下去我的母乳实在不够啊...`,
  category: '喂养问题',
  isPublic: true,
  viewCount: 2341,
  isAnswered: true,
  watchCount: 156,
  createdAt: '2024-06-15T10:30:00Z',
  updatedAt: '2024-06-15T12:00:00Z',
  images: [],
  author: {
    id: 1, nickname: '焦虑的新手妈', avatar: '',
    createdAt: '2024-01-01', updatedAt: '2024-06-01',
    creditScore: 880, isExpert: false, isTrusted: true, username: 'mom1', phone: '',
  } as any,
  expert: {
    id: 1, nickname: '张医生', avatar: '', specialty: '儿科',
    rating: 4.9, reviewCount: 156, experienceYears: 12,
    licenseNumber: '', verifiedAt: '2024-01-15',
    username: 'dr_zhang', phone: '', bio: '', creditScore: 980,
    isExpert: true, isTrusted: true, createdAt: '', updatedAt: '',
  } as any,
  answers: [
    {
      id: 1,
      questionId: 1,
      expertId: 1,
      content: `您好！非常理解您的焦虑，3个月左右出现"奶瓶拒斥"是非常常见的现象，医学上称为"乳头混淆"的反向表现，大约有30-40%的混合喂养宝宝会遇到这个问题，不用太担心。

**首先分析可能的原因：**

1. **乳头偏好建立**：3个月是宝宝感官发育的关键期，已经能清晰分辨出乳头和奶嘴的触感、温度甚至味道差异，宝宝很聪明地选择了更舒适的亲喂方式。

2. **流流速差异**：奶瓶流速通常比母乳快，宝宝可能之前被呛过，产生了负面联想；或者反过来，奶嘴流速太慢，宝宝觉得吸吮费力。

3. **长牙前兆**：虽然3个月长牙确实偏早（一般6个月左右），但2-4个月开始出现牙床不适、流口水增多是很常见的，吸吮奶嘴时压迫牙床会加重不适感。

4. **环境或 routine 变化**：有没有换奶粉温度？喂奶姿势？看护人变化？这些细微变化宝宝都能感知到。

**给您的实操建议：**

✅ **奶嘴选择与处理**
- 选择宽口径、硅胶材质、有"乳晕设计"的仿真奶嘴
- 喂奶前用温水把奶嘴泡软，接近体温
- 在奶嘴上涂一点母乳，增加熟悉感

✅ **节奏与时机**
- 不要在宝宝非常饿的时候尝试奶瓶，那时情绪最糟
- 选择宝宝心情愉悦、半梦半醒的"黄金窗口"（如刚睡醒、小睡前）
- 亲喂5分钟后悄悄换成奶瓶，宝宝可能没察觉

✅ **喂奶仪式感**
- 固定一个喂奶的安静环境，减少干扰
- 让家人用您的衣服裹着宝宝喂，留有您的气味
- 保持和亲喂相似的姿势：半直立位，头高脚低

✅ **牙床缓解**
- 喂奶前15分钟用干净的手指轻轻按摩宝宝牙床
- 可以给宝宝咬一咬冷藏过的牙胶（不要冷冻的）
- 如果不适明显，可在医生指导下使用少量婴儿口腔凝胶

**关于母乳不够的问题：**

其实3个月左右是"供需平衡"建立期，您感觉到的"不够"很可能是宝宝的"猛长期"需求增加，多亲喂几天奶量会追上来的。如果确实需要补，建议用勺子或喂奶杯过渡，避免宝宝对奶瓶彻底反感。

如果以上方法尝试1周后仍无改善，建议可以带宝宝做个口腔检查，排除鹅口疮、舌系带等问题。

祝您和宝宝顺利度过这个阶段！有其他问题随时问我 💗`,
      images: [],
      expert: {
        id: 1, nickname: '张医生', avatar: '', specialty: '儿科',
        rating: 4.9, reviewCount: 156,
      } as Expert,
      createdAt: '2024-06-15T11:45:00Z',
      updatedAt: '2024-06-15T11:45:00Z',
    },
  ],
} as any

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const expectResponseMinutes = 180
const elapsedMinutes = computed(() => {
  if (!question.value) return 0
  const created = new Date(question.value.createdAt)
  return Math.floor((Date.now() - created.getTime()) / 60000)
})
const remainingMinutes = computed(() => Math.max(0, expectResponseMinutes - elapsedMinutes.value))
const timelineItems = computed(() => [
  { type: 'success', title: '问题发布成功', time: '已完成' },
  elapsedMinutes.value > 2
    ? { type: 'success', title: '专家已接单', time: '5分钟内' }
    : { type: 'process', title: '正在匹配专家', time: '进行中...' },
  question.value?.isAnswered
    ? { type: 'success', title: '专家已回答', time: formatTime(question.value.updatedAt) }
    : { type: 'wait', title: '等待专家回答中', time: `预计${Math.ceil(remainingMinutes.value / 60)}小时内` },
])

const shouldBlur = computed(() =>
  question.value?.isAnswered &&
  !isAuthor.value &&
  !userStore.isExpert &&
  !hasWatched.value &&
  !showFullAnswer.value
)

const fetchData = async () => {
  loading.value = true
  try {
    const id = Number(route.params.id)
    const res = await getQuestion(id)
    question.value = res
    answers.value = res.answers || []
    isAuthor.value = res.userId === userStore.userInfo?.id
    if (answers.value.length > 0) question.value!.isAnswered = true
  } catch {
    question.value = mockQuestion
    answers.value = mockQuestion.answers || []
    isAuthor.value = false
  } finally {
    loading.value = false
  }
}

const payWatch = async () => {
  if (!userStore.isLoggedIn) {
    message.warning('请先登录')
    return
  }
  try {
    await watchQuestion(Number(route.params.id))
    hasWatched.value = true
    showFullAnswer.value = true
    message.success('围观成功！解锁完整回答')
  } catch {
    hasWatched.value = true
    showFullAnswer.value = true
    message.success('演示模式：已解锁完整回答')
  }
}

const toggleLike = () => {
  liked.value = !liked.value
  likeCount.value += liked.value ? 1 : -1
}
const toggleFav = () => {
  favorited.value = !favorited.value
  favoriteCount.value += favorited.value ? 1 : -1
  message.success(favorited.value ? '已收藏' : '已取消收藏')
}

const submitAnswer = async () => {
  if (!answerText.value.trim()) {
    message.warning('请输入回答内容')
    return
  }
  submittingAnswer.value = true
  try {
    await createAnswer({
      questionId: Number(route.params.id),
      content: answerText.value,
    })
    message.success('回答提交成功！')
    answers.value.push({
      id: Date.now(),
      questionId: Number(route.params.id),
      expertId: userStore.userInfo?.id || 0,
      content: answerText.value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expert: userStore.userInfo as any,
    })
    answerText.value = ''
    if (question.value) question.value.isAnswered = true
  } catch {
    message.success('演示模式：回答提交成功！')
    answers.value.push({
      id: Date.now(),
      questionId: Number(route.params.id),
      expertId: userStore.userInfo?.id || 0,
      content: answerText.value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expert: userStore.userInfo as any,
    })
    answerText.value = ''
    if (question.value) question.value.isAnswered = true
  } finally {
    submittingAnswer.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="min-h-screen bg-cream-50 py-8">
    <div class="container max-w-4xl">
      <button class="mb-4 flex items-center gap-1 text-ink-500 hover:text-primary-500 transition-colors" onclick="history.back()">
        <ChevronLeft class="w-4 h-4" /> 返回
      </button>

      <n-skeleton v-if="loading" :rows="15" />

      <div v-else>
        <div class="card p-8 mb-6 animate-fade-in-up">
          <div class="flex flex-wrap items-center gap-3 mb-4">
            <span class="chip-lavender">{{ question?.category }}</span>
            <span class="text-caption text-ink-400 flex items-center gap-1">
              <Eye class="w-3.5 h-3.5" /> {{ question?.viewCount }} 浏览
            </span>
            <span class="text-caption text-ink-400 flex items-center gap-1">
              <Clock class="w-3.5 h-3.5" /> {{ question && formatTime(question.createdAt) }}
            </span>
            <span v-if="question?.isAnswered" class="chip-mint flex items-center gap-1 ml-auto">
              <Shield class="w-3 h-3" /> 专家已回答
            </span>
            <span v-else class="chip-primary flex items-center gap-1 ml-auto animate-pulse">
              <Clock class="w-3 h-3" /> 待回答
            </span>
          </div>

          <h1 class="text-heading-1 text-ink-900 mb-6 leading-tight">
            {{ question?.title }}
          </h1>

          <div class="text-body text-ink-700 whitespace-pre-line leading-7 mb-6">
            {{ question?.content }}
          </div>

          <div v-if="question?.images?.length" class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <img
              v-for="(img, idx) in question.images"
              :key="idx"
              :src="img"
              class="w-full h-32 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
            />
          </div>

          <div class="flex items-center gap-3 p-4 bg-cream-50 rounded-xl">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold">
              {{ question?.author?.nickname?.charAt(0) || 'U' }}
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-ink-900">{{ question?.author?.nickname }}</span>
                <span v-if="question?.author?.isTrusted" class="trusted-badge">诚信宝妈</span>
              </div>
              <span class="text-caption text-ink-400">Lv.3 · 发布提问 {{ 23 }} 个 · 帮助过 {{ 128 }} 人</span>
            </div>
          </div>
        </div>

        <div v-if="!question?.isAnswered" class="card p-8 mb-6 border-2 border-dashed border-primary-200 animate-fade-in-up">
          <h3 class="text-heading-3 text-ink-900 mb-6 flex items-center gap-2">
            <Clock class="w-5 h-5 text-primary-500 animate-pulse" />
            等待专家回答中...
          </h3>
          <n-timeline class="pl-4">
            <n-timeline-item
              v-for="(item, idx) in timelineItems"
              :key="idx"
              :type="item.type"
              :title="item.title"
              :time="item.time"
            />
          </n-timeline>
          <div class="mt-6 p-4 bg-lavender-100/50 rounded-xl text-center">
            <div class="text-2xl font-bold text-lavender-700 mb-1">
              {{ Math.ceil(remainingMinutes / 60) }}小时{{ remainingMinutes % 60 }}分
            </div>
            <div class="text-caption text-ink-500">预计响应时间内</div>
          </div>

          <div v-if="userStore.isExpert" class="mt-6 pt-6 border-t border-ink-100">
            <h4 class="text-heading-4 text-ink-900 mb-3">我来回答</h4>
            <textarea
              v-model="answerText"
              rows="5"
              placeholder="请输入专业回答，帮助宝妈解决问题..."
              class="textarea-base mb-3"
            />
            <div class="flex justify-end">
              <button class="btn-lavender h-11 px-6" @click="submitAnswer" :disabled="submittingAnswer">
                <n-spin v-if="submittingAnswer" size="small" class="mr-2" />
                提交回答
              </button>
            </div>
          </div>
        </div>

        <div
          v-for="answer in answers"
          :key="answer.id"
          class="relative mb-6 animate-fade-in-up"
        >
          <div class="absolute inset-0 rounded-3xl p-[2px] bg-gradient-lavender pointer-events-none" />
          <div class="relative card p-8">
            <div class="flex items-center gap-4 p-4 bg-gradient-to-r from-lavender-100/50 to-primary-50/30 rounded-xl mb-6">
              <div class="relative">
                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-2xl font-bold">
                  {{ answer.expert?.nickname?.charAt(0) || 'E' }}
                </div>
                <div class="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-gradient-lavender flex items-center justify-center text-white text-xs border-2 border-white">
                  ✓
                </div>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-heading-4 text-ink-900 font-bold">{{ answer.expert?.nickname }}</span>
                  <span class="chip-lavender text-xs py-0">认证专家</span>
                  <span class="trusted-badge">金牌</span>
                </div>
                <div class="text-caption text-ink-500 mb-1">
                  {{ (answer.expert as any)?.specialty || '儿科' }} · 从业{{ (answer.expert as any)?.experienceYears || 10 }}年 · 三甲医院
                </div>
                <div class="flex items-center gap-3">
                  <div class="flex items-center gap-1">
                    <Star class="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span class="text-sm font-bold text-ink-900">{{ (answer.expert as any)?.rating || 4.9 }}</span>
                  </div>
                  <span class="text-caption text-ink-400">· 回答 {{ (answer.expert as any)?.reviewCount || 156 }} 次</span>
                </div>
              </div>
            </div>

            <div class="relative">
              <div :class="['text-body text-ink-700 leading-7 whitespace-pre-line transition-all duration-500', shouldBlur && 'mask-blur-bottom select-none pointer-events-none']">
                {{ answer.content }}
              </div>

              <div
                v-if="shouldBlur"
                class="absolute inset-0 flex flex-col items-center justify-end pb-6"
              >
                <div class="absolute inset-0 bg-gradient-to-b from-white/20 via-white/60 to-white pointer-events-none" />
                <div class="relative z-10 flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg max-w-md w-full">
                  <Lock class="w-10 h-10 text-lavender-500 mb-3" />
                  <h4 class="text-heading-4 text-ink-900 mb-1">解锁专家完整回答</h4>
                  <p class="text-caption text-ink-500 mb-4 text-center">
                    已有 <span class="text-primary-500 font-bold">{{ question?.watchCount }}</span> 位宝妈围观学习
                  </p>
                  <button class="btn-lavender w-full h-12 text-lg font-medium" @click="payWatch">
                    支付 ¥2.9 查看完整回答
                  </button>
                  <p class="text-caption text-ink-400 mt-3 flex items-center gap-1">
                    <Shield class="w-3 h-3" /> 支付即表示同意《围观服务协议》
                  </p>
                </div>
              </div>
            </div>

            <div v-if="answer.images?.length" class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
              <img
                v-for="(img, idx) in answer.images"
                :key="idx"
                :src="img"
                class="w-full h-32 object-cover rounded-xl"
              />
            </div>

            <div class="flex items-center gap-4 mt-6 pt-6 border-t border-ink-100 text-caption text-ink-500">
              <span>回答于 {{ formatTime(answer.createdAt) }}</span>
              <div class="flex-1" />
              <button
                @click="toggleLike"
                :class="['flex items-center gap-1 hover:text-primary-500 transition-colors', liked && 'text-primary-500']"
              >
                <ThumbsUp class="w-4 h-4" :class="liked && 'fill-primary-500'" />
                <span>有用 {{ likeCount }}</span>
              </button>
              <button
                @click="toggleFav"
                :class="['flex items-center gap-1 hover:text-primary-500 transition-colors', favorited && 'text-primary-500']"
              >
                <Heart class="w-4 h-4" :class="favorited && 'fill-primary-500'" />
                <span>收藏 {{ favoriteCount }}</span>
              </button>
              <button class="flex items-center gap-1 hover:text-primary-500 transition-colors">
                <Share2 class="w-4 h-4" />
                <span>分享</span>
              </button>
            </div>

            <div v-if="(isAuthor || hasWatched || showFullAnswer || userStore.isExpert)" class="mt-6 pt-6 border-t border-ink-100">
              <h4 class="text-heading-4 text-ink-900 mb-4 flex items-center gap-2">
                <MessageCircle class="w-5 h-5" /> 评论区
              </h4>
              <div class="space-y-4 mb-4">
                <div v-for="(_, idx) in 2" :key="idx" class="flex gap-3">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {{ ['妈', '幸'][idx] }}
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="font-medium text-ink-900 text-sm">{{ ['爱心妈妈', '幸福小宝妈'][idx] }}</span>
                      <span class="text-caption text-ink-400">{{ ['1小时前', '2小时前'][idx] }}</span>
                    </div>
                    <p class="text-body text-ink-600">
                      {{ ['感谢张医生！我家娃之前也这样，按您说的方法试了真的有效！', '请问牙胶有推荐品牌吗？'][idx] }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="flex gap-3">
                <input
                  v-model="commentText"
                  type="text"
                  placeholder="向专家追问或发表评论..."
                  class="input-base flex-1"
                  @keyup.enter="commentText = ''; message.success('评论发送成功')"
                />
                <button
                  class="btn-primary h-12 px-5"
                  @click="commentText = ''; message.success('评论发送成功')"
                >
                  <Send class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
