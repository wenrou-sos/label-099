<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { Upload, ImagePlus, Sparkles, Clock, Shield, Check, X } from 'lucide-vue-next'
import { createQuestion, getExpertList } from '@/api/qa'
import type { Expert, CreateQuestionParams } from '@shared/types'

const router = useRouter()
const message = useMessage()

const currentStep = ref(0)
const submitting = ref(false)
const experts = ref<Expert[]>([])
const expertsLoading = ref(false)

const form = ref<CreateQuestionParams & { expertId?: number }>({
  title: '',
  content: '',
  category: '',
  images: [],
  expertId: undefined,
  isPublic: true,
})

const categories = [
  { value: '喂养问题', label: '🍼 喂养问题', desc: '奶粉、辅食、母乳、挑食' },
  { value: '睡眠问题', label: '😴 睡眠问题', desc: '夜醒、哄睡、睡眠训练' },
  { value: '疾病护理', label: '🏥 疾病护理', desc: '发烧、湿疹、感冒用药' },
  { value: '早教启蒙', label: '🎨 早教启蒙', desc: '发育、认知、亲子游戏' },
  { value: '产后心理', label: '💗 产后心理', desc: '情绪、抑郁、家庭关系' },
  { value: '其他问题', label: '❓ 其他问题', desc: '其他育儿相关问题' },
]

const assignExpert = ref(false)
const selectedExpertId = ref<number | null>(null)
const payMethod = ref('wechat')

const mockExperts: Expert[] = [
  { id: 1, nickname: '张医生', avatar: '', specialty: '儿科', rating: 4.9, reviewCount: 156, experienceYears: 12 } as any,
  { id: 6, nickname: '孙医生', avatar: '', specialty: '儿科', rating: 4.8, reviewCount: 245, experienceYears: 15 } as any,
  { id: 4, nickname: '陈营养师', avatar: '', specialty: '营养', rating: 4.7, reviewCount: 176, experienceYears: 10 } as any,
  { id: 3, nickname: '王老师', avatar: '', specialty: '早教', rating: 4.9, reviewCount: 98, experienceYears: 8 } as any,
]

const priceMap: Record<string, number> = {
  '张医生': 39, '孙医生': 49, '陈营养师': 39, '王老师': 29,
}

const avatarColors = [
  'from-pink-400 to-rose-500', 'from-blue-400 to-cyan-500',
  'from-green-400 to-emerald-500', 'from-amber-400 to-orange-500',
]

const titleCount = computed(() => form.value.title.length)
const contentCount = computed(() => form.value.content.length)
const images = ref<{ url: string; name: string }[]>([])

const canStep1 = computed(() =>
  form.value.category &&
  titleCount.value >= 10 && titleCount.value <= 50 &&
  contentCount.value >= 20 && contentCount.value <= 2000
)
const canStep2 = computed(() => !assignExpert.value || selectedExpertId.value !== null)

const totalPrice = computed(() => {
  let base = 39
  if (assignExpert.value && selectedExpertId.value) {
    const expert = experts.value.find(e => e.id === selectedExpertId.value)
    base = expert ? (priceMap[expert.nickname || ''] || 39) : 39
  }
  return base
})
const serviceFee = computed(() => Math.ceil(totalPrice.value * 0.05))
const finalPrice = computed(() => totalPrice.value + serviceFee.value)

const fetchExperts = async () => {
  expertsLoading.value = true
  try {
    const res = await getExpertList({ page: 1, pageSize: 10 })
    experts.value = res.list.length > 0 ? res.list : mockExperts
  } catch {
    experts.value = mockExperts
  } finally {
    expertsLoading.value = false
  }
}

const next = () => {
  if (currentStep.value === 0 && !canStep1.value) {
    message.warning('请完善问题信息')
    return
  }
  if (currentStep.value === 1 && !canStep2.value) {
    message.warning('请选择专家或开启智能分配')
    return
  }
  if (currentStep.value < 2) currentStep.value++
}
const prev = () => {
  if (currentStep.value > 0) currentStep.value--
}

const uploadImage = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  const files = Array.from(input.files).slice(0, 6 - images.value.length)
  for (const file of files) {
    const reader = new FileReader()
    reader.onload = () => {
      images.value.push({ url: reader.result as string, name: file.name })
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = (idx: number) => images.value.splice(idx, 1)

const submit = async () => {
  submitting.value = true
  try {
    const data: CreateQuestionParams = {
      title: form.value.title,
      content: form.value.content,
      category: form.value.category,
      images: images.value.map(i => i.url),
      isPublic: form.value.isPublic,
      expertId: assignExpert.value && selectedExpertId.value ? selectedExpertId.value : undefined,
    }
    await createQuestion(data)
    message.success('提问成功！等待专家回答')
    setTimeout(() => router.push('/qa'), 1500)
  } catch (err: any) {
    message.success('提问提交成功！（演示模式）')
    setTimeout(() => router.push('/qa'), 1500)
  } finally {
    submitting.value = false
  }
}

onMounted(() => fetchExperts())
</script>

<template>
  <div class="min-h-screen bg-cream-50 py-8">
    <div class="container max-w-4xl">
      <h1 class="text-heading-1 text-ink-900 mb-2">发起提问</h1>
      <p class="text-body text-ink-500 mb-8">专业专家一对一解答，最快3分钟响应</p>

      <div class="card p-8 mb-6">
        <n-steps :current="currentStep" size="large" class="mb-10">
          <n-step title="填写问题" description="描述您的育儿疑问" />
          <n-step title="选择专家" description="指定或智能分配" />
          <n-step title="确认支付" description="完成咨询费支付" />
        </n-steps>

        <div v-if="currentStep === 0" class="animate-fade-in space-y-6">
          <div>
            <label class="block text-heading-4 text-ink-900 mb-3">问题分类 <span class="text-primary-500">*</span></label>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div
                v-for="cat in categories"
                :key="cat.value"
                @click="form.category = cat.value"
                :class="[
                  'p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200',
                  form.category === cat.value
                    ? 'border-lavender-500 bg-lavender-100/50'
                    : 'border-ink-100 hover:border-primary-300 hover:bg-primary-50/30'
                ]"
              >
                <div class="text-lg font-bold mb-1">{{ cat.label }}</div>
                <div class="text-caption text-ink-500">{{ cat.desc }}</div>
              </div>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-heading-4 text-ink-900">问题标题 <span class="text-primary-500">*</span></label>
              <span :class="['text-caption', titleCount >= 10 && titleCount <= 50 ? 'text-mint-700' : 'text-ink-400']">
                {{ titleCount }}/50
              </span>
            </div>
            <input
              v-model="form.title"
              type="text"
              placeholder="一句话概括您的问题，如：宝宝3个月不肯喝奶瓶怎么办？"
              maxlength="50"
              class="input-base"
            />
            <p class="text-caption text-ink-400 mt-2">标题要求10-50字，清晰表达核心疑问</p>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-heading-4 text-ink-900">详细描述 <span class="text-primary-500">*</span></label>
              <span :class="['text-caption', contentCount >= 20 && contentCount <= 2000 ? 'text-mint-700' : 'text-ink-400']">
                {{ contentCount }}/2000
              </span>
            </div>
            <textarea
              v-model="form.content"
              rows="6"
              maxlength="2000"
              placeholder="建议包含以下信息：&#10;• 宝宝月龄 / 性别 / 体重等基本情况&#10;• 症状或问题的详细描述（持续时间、频率等）&#10;• 已经尝试过的方法和效果&#10;• 您最想了解的问题"
              class="textarea-base"
            />
          </div>

          <div>
            <label class="block text-heading-4 text-ink-900 mb-3">上传图片（可选，最多6张）</label>
            <div class="flex flex-wrap gap-3">
              <div
                v-for="(img, idx) in images"
                :key="idx"
                class="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-ink-100"
              >
                <img :src="img.url" class="w-full h-full object-cover" />
                <button
                  @click="removeImage(idx)"
                  class="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
              <label
                v-if="images.length < 6"
                class="w-24 h-24 rounded-xl border-2 border-dashed border-ink-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all"
              >
                <ImagePlus class="w-6 h-6 text-ink-400 mb-1" />
                <span class="text-caption text-ink-400">添加图片</span>
                <input type="file" accept="image/*" multiple class="hidden" @change="uploadImage" />
              </label>
            </div>
            <p class="text-caption text-ink-400 mt-2">支持上传宝宝便便、皮肤、舌苔等照片帮助诊断</p>
          </div>

          <div class="flex justify-end pt-4">
            <button class="btn-primary h-12 px-8" @click="next" :disabled="!canStep1">
              下一步：选择专家
            </button>
          </div>
        </div>

        <div v-else-if="currentStep === 1" class="animate-fade-in space-y-6">
          <div class="card p-5 bg-cream-50/50">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-heading-4 text-ink-900 mb-1">指定专家</h3>
                <p class="text-caption text-ink-500">开启后可选择特定专家回答，关闭则由平台智能分配</p>
              </div>
              <n-switch v-model:value="assignExpert" size="large" />
            </div>

            <div v-if="!assignExpert" class="flex items-center gap-4 p-5 rounded-xl bg-gradient-lavender text-white">
              <Sparkles class="w-10 h-10 flex-shrink-0 animate-float" />
              <div>
                <h4 class="font-bold mb-1">平台智能分配</h4>
                <p class="text-white/90 text-sm flex items-center gap-1">
                  <Clock class="w-4 h-4" /> 最快3分钟内响应 · 匹配最合适的专家
                </p>
              </div>
            </div>

            <div v-else class="space-y-3 mt-4">
              <n-skeleton v-if="expertsLoading" />
              <div
                v-for="(expert, idx) in experts"
                :key="expert.id"
                @click="selectedExpertId = expert.id"
                :class="[
                  'p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-4',
                  selectedExpertId === expert.id
                    ? 'border-lavender-500 bg-lavender-100/50'
                    : 'border-ink-100 hover:border-primary-300'
                ]"
              >
                <div
                  :class="[
                    'w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold bg-gradient-to-br flex-shrink-0',
                    avatarColors[idx % avatarColors.length]
                  ]"
                >
                  {{ expert.nickname?.charAt(0) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-bold text-ink-900">{{ expert.nickname }}</span>
                    <span class="chip-lavender text-xs py-0">{{ expert.specialty }}</span>
                  </div>
                  <div class="text-caption text-ink-500 mb-1">
                    从业{{ expert.experienceYears }}年 · ⭐{{ expert.rating }} · 回答{{ expert.reviewCount }}
                  </div>
                  <div class="text-primary-500 font-bold">¥{{ priceMap[expert.nickname || ''] || 39 }}/次</div>
                </div>
                <div
                  :class="[
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                    selectedExpertId === expert.id
                      ? 'border-lavender-500 bg-lavender-500'
                      : 'border-ink-200'
                  ]"
                >
                  <Check v-if="selectedExpertId === expert.id" class="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div class="card p-5 bg-cream-50/50">
            <div class="flex items-center justify-between mb-3">
              <div>
                <h3 class="text-heading-4 text-ink-900 mb-1">公开围观</h3>
                <p class="text-caption text-ink-500">
                  开启后其他用户可付费围观，您可获得围观收入分成（约50%）
                </p>
              </div>
              <n-switch v-model:value="form.isPublic" size="large" :default-value="true" />
            </div>
            <n-alert type="info" v-if="form.isPublic" class="mt-2">
              <div class="text-sm">
                💡 假设有100人围观 ¥2.9/人，您可获得约 ¥145 收入分成
              </div>
            </n-alert>
          </div>

          <div class="flex justify-between pt-4">
            <button class="btn-secondary h-12 px-6" @click="prev">上一步</button>
            <button class="btn-primary h-12 px-8" @click="next" :disabled="!canStep2">
              下一步：确认支付
            </button>
          </div>
        </div>

        <div v-else class="animate-fade-in space-y-6">
          <div class="card p-6 border-2 border-lavender-200">
            <h3 class="text-heading-4 text-ink-900 mb-5 flex items-center gap-2">
              <Shield class="w-5 h-5 text-lavender-500" /> 费用明细
            </h3>
            <div class="space-y-3 text-body">
              <div class="flex items-center justify-between">
                <span class="text-ink-500">咨询费{{ assignExpert ? `（${experts.find(e => e.id === selectedExpertId)?.nickname || '智能分配'}）` : '（智能分配）' }}</span>
                <span class="text-ink-900 font-medium">¥{{ totalPrice }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-ink-500">平台服务费（5%）</span>
                <span class="text-ink-900 font-medium">¥{{ serviceFee }}</span>
              </div>
              <div v-if="form.isPublic" class="flex items-center justify-between">
                <span class="text-ink-500">围观分成预计</span>
                <span class="text-mint-700 font-medium">-¥0 ~ +收益</span>
              </div>
              <div class="h-px bg-ink-100 my-2" />
              <div class="flex items-center justify-between">
                <span class="text-heading-4 text-ink-900 font-bold">合计实付</span>
                <span class="text-primary-500 font-bold text-2xl">¥{{ finalPrice }}</span>
              </div>
            </div>
          </div>

          <div class="card p-6">
            <h3 class="text-heading-4 text-ink-900 mb-5">选择支付方式</h3>
            <div class="space-y-3">
              <div
                @click="payMethod = 'wechat'"
                :class="[
                  'p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4',
                  payMethod === 'wechat' ? 'border-mint-500 bg-mint-100/30' : 'border-ink-100 hover:border-mint-300'
                ]"
              >
                <div class="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white text-2xl font-bold">💬</div>
                <div class="flex-1">
                  <div class="font-bold text-ink-900">微信支付</div>
                  <div class="text-caption text-ink-500">推荐使用，支持微信扫码支付</div>
                </div>
                <div
                  :class="[
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                    payMethod === 'wechat' ? 'border-mint-500 bg-mint-500' : 'border-ink-200'
                  ]"
                >
                  <Check v-if="payMethod === 'wechat'" class="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div
                @click="payMethod = 'alipay'"
                :class="[
                  'p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4',
                  payMethod === 'alipay' ? 'border-blue-500 bg-blue-50' : 'border-ink-100 hover:border-blue-300'
                ]"
              >
                <div class="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">支</div>
                <div class="flex-1">
                  <div class="font-bold text-ink-900">支付宝</div>
                  <div class="text-caption text-ink-500">支持花呗、余额宝等</div>
                </div>
                <div
                  :class="[
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                    payMethod === 'alipay' ? 'border-blue-500 bg-blue-500' : 'border-ink-200'
                  ]"
                >
                  <Check v-if="payMethod === 'alipay'" class="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </div>
          </div>

          <n-alert type="info">
            <div class="flex items-start gap-2 text-sm">
              <Shield class="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <div class="font-bold mb-0.5">支付安全保障</div>
                <div class="text-ink-600">
                  所有支付均通过官方通道加密处理，资金在专家回答前由平台托管，不满意可申请退款。
                </div>
              </div>
            </div>
          </n-alert>

          <div class="flex justify-between pt-4">
            <button class="btn-secondary h-12 px-6" @click="prev">上一步</button>
            <button class="btn-lavender h-14 px-10 text-lg" @click="submit" :disabled="submitting">
              <n-spin v-if="submitting" size="small" class="mr-2" />
              确认支付 ¥{{ finalPrice }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
