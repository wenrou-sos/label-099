<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  NSteps,
  NButton,
  NInput,
  NInputNumber,
  NCheckbox,
  NCheckboxGroup,
  NSelect,
  NSwitch,
  NSlider,
  NCard,
  NIcon,
  NUpload,
  NMessageProvider,
  useMessage,
} from 'naive-ui'
import {
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  X,
  Check,
  Sparkles,
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import ConditionPicker from '@/components/product/ConditionPicker.vue'
import { createProduct, suggestPrice } from '@/api/product'
import type { ProductCategory, ProductCondition } from '../../../shared/types'

const router = useRouter()
const message = useMessage()

const currentStep = ref(0)
const submitting = ref(false)
const suggestLoading = ref(false)

const title = ref('')
const description = ref('')
const category = ref<ProductCategory | null>(null)
const condition = ref<ProductCondition | null>(null)
const originalPrice = ref<number | null>(null)
const finalPrice = ref<number | null>(null)
const images = ref<string[]>([])
const tradeMethods = ref<string[]>([])
const city = ref<string | null>(null)
const meetupPlace = ref<string>('')
const isFreeShipping = ref(false)

const categoryOptions = [
  { value: 'baby_gear', label: '婴儿车', emoji: '🚼', desc: '婴儿推车、伞车、遛娃神器' },
  { value: 'carseat', label: '安全座椅', emoji: '💺', desc: '汽车安全座椅、增高垫' },
  { value: 'crib', label: '婴儿床', emoji: '🛏️', desc: '婴儿床、床围、床垫' },
  { value: 'baby_toys', label: '玩具', emoji: '🧸', desc: '益智玩具、毛绒玩具、积木' },
  { value: 'baby_clothes', label: '童装', emoji: '👕', desc: '宝宝衣服、鞋子、配饰' },
  { value: 'books', label: '绘本', emoji: '📚', desc: '儿童绘本、读物、益智书' },
]

const cityOptions = [
  { label: '北京', value: '北京' },
  { label: '上海', value: '上海' },
  { label: '广州', value: '广州' },
  { label: '深圳', value: '深圳' },
  { label: '杭州', value: '杭州' },
]

const meetupOptions = [
  { label: '大型商场', value: '大型商场' },
  { label: '连锁咖啡店', value: '连锁咖啡店' },
  { label: '地铁站出口', value: '地铁站出口' },
  { label: '社区便利店', value: '社区便利店' },
]

const titleCount = computed(() => title.value.length)
const descCount = computed(() => description.value.length)
const titleValid = computed(() => titleCount.value >= 10 && titleCount.value <= 50)
const descValid = computed(() => descCount.value >= 50 && descCount.value <= 2000)

const suggestedMin = ref(0)
const suggestedMax = ref(0)
const suggestedDefault = ref(0)

function computeSuggestRange() {
  if (!originalPrice.value || !condition.value) return
  const ratios: Record<ProductCondition, [number, number, number]> = {
    new: [0.6, 0.7, 0.8],
    like_new: [0.5, 0.6, 0.7],
    good: [0.35, 0.45, 0.55],
    fair: [0.2, 0.3, 0.4],
  }
  const [minR, defR, maxR] = ratios[condition.value]
  const price = originalPrice.value
  suggestedMin.value = Math.round(price * minR)
  suggestedMax.value = Math.round(price * maxR)
  suggestedDefault.value = Math.round(price * defR)
  if (finalPrice.value === null) {
    finalPrice.value = suggestedDefault.value
  }
}

watch([originalPrice, condition], computeSuggestRange)

const conditionTextMap: Record<ProductCondition, string> = {
  new: '全新未拆封',
  like_new: '几乎全新',
  good: '轻微使用痕迹',
  fair: '明显使用痕迹',
}

const canNextStep0 = computed(() => {
  return category.value !== null && titleValid.value && descValid.value && images.value.length > 0
})
const canNextStep1 = computed(() => {
  return condition.value !== null && originalPrice.value !== null && originalPrice.value > 0 && finalPrice.value !== null && finalPrice.value > 0
})
const canNextStep2 = computed(() => {
  return tradeMethods.value.length > 0
    && (!tradeMethods.value.includes('local') || (city.value !== null && meetupPlace.value !== ''))
})

function nextStep() {
  if (currentStep.value < 3) currentStep.value++
}
function prevStep() {
  if (currentStep.value > 0) currentStep.value--
}

function handleImageUpload(data: any) {
  const file = data.file as File
  const reader = new FileReader()
  reader.onload = (e) => {
    if (images.value.length < 9) {
      images.value.push(e.target?.result as string)
    }
  }
  reader.readAsDataURL(file)
}

function removeImage(idx: number) {
  images.value.splice(idx, 1)
}

async function fetchSuggestPrice() {
  if (!category.value || !condition.value || !originalPrice.value) return
  suggestLoading.value = true
  try {
    const res = await suggestPrice({
      category: category.value,
      condition: condition.value,
      originalPrice: originalPrice.value,
    })
    if (res.suggestedPrice) {
      finalPrice.value = Math.round(res.suggestedPrice)
    }
  } catch {
  } finally {
    suggestLoading.value = false
  }
}

watch([category, condition, originalPrice], () => {
  if (category.value && condition.value && originalPrice.value) {
    fetchSuggestPrice()
  }
})

async function submitProduct() {
  submitting.value = true
  try {
    await createProduct({
      title: title.value,
      description: description.value,
      images: images.value,
      category: category.value!,
      condition: condition.value!,
      originalPrice: originalPrice.value!,
      price: finalPrice.value!,
      location: tradeMethods.value.includes('local') ? city.value! : undefined,
      isNegotiable: true,
    })
    message.success('🎉 商品发布成功！正在跳转...')
    setTimeout(() => router.push('/market'), 1500)
  } catch (e: any) {
    message.error(e?.message || '发布失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-cream-50 py-6 px-4 md:px-6 lg:px-8">
    <div class="max-w-[1100px] mx-auto">
      <div class="mb-6">
        <h1 class="text-heading-1 text-ink-900 mb-2">发布闲置 🌸</h1>
        <p class="text-body text-ink-500">让爱延续，把闲置好物传递给需要的宝妈～</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <div class="hidden lg:block">
          <div class="card p-5 sticky top-6">
            <NSteps v-model:current="currentStep" vertical>
              <NTooltip>
                <template #trigger>
                  <n-step title="基本信息" description="品类、标题、图片" />
                </template>
                填写商品基本信息
              </NTooltip>
              <n-step title="成色定价" description="成色、售价" />
              <n-step title="交易方式" description="面交/快递" />
              <n-step title="确认发布" description="预览提交" />
            </NSteps>
          </div>
        </div>

        <div class="space-y-6">
          <div class="card p-6">
            <div v-if="currentStep === 0" class="space-y-6 animate-fade-in">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <label class="text-body text-ink-700 font-medium">选择品类 <span class="text-primary-500">*</span></label>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <button
                    v-for="opt in categoryOptions"
                    :key="opt.value"
                    class="text-left p-4 rounded-2xl border-2 transition-all"
                    :class="category === opt.value
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-ink-100 bg-white hover:border-primary-200 hover:bg-primary-50/40'"
                    @click="category = opt.value"
                  >
                    <div class="text-3xl mb-2">{{ opt.emoji }}</div>
                    <div class="text-heading-4 text-ink-900 mb-1">{{ opt.label }}</div>
                    <div class="text-caption text-ink-400">{{ opt.desc }}</div>
                  </button>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-3">
                  <label class="text-body text-ink-700 font-medium">商品标题 <span class="text-primary-500">*</span></label>
                  <span class="text-caption" :class="titleValid ? 'text-mint-700' : 'text-ink-400'">{{ titleCount }}/50</span>
                </div>
                <NInput
                  v-model:value="title"
                  placeholder="请输入商品标题（10-50字），如：9成新博格步婴儿推车轻便折叠"
                  maxlength="50"
                  :status="titleCount > 0 && !titleValid ? 'error' : undefined"
                />
              </div>

              <div>
                <div class="flex items-center justify-between mb-3">
                  <label class="text-body text-ink-700 font-medium">商品描述 <span class="text-primary-500">*</span></label>
                  <span class="text-caption" :class="descValid ? 'text-mint-700' : 'text-ink-400'">{{ descCount }}/2000</span>
                </div>
                <NInput
                  v-model:value="description"
                  type="textarea"
                  placeholder="详细描述商品的使用情况、购买时间、有无瑕疵等（50-2000字）..."
                  :rows="6"
                  maxlength="2000"
                  :status="descCount > 0 && !descValid ? 'error' : undefined"
                />
              </div>

              <div>
                <div class="flex items-center justify-between mb-3">
                  <label class="text-body text-ink-700 font-medium">商品图片 <span class="text-primary-500">*</span></label>
                  <span class="text-caption text-ink-400">{{ images.length }}/9，首张为封面</span>
                </div>
                <div class="grid grid-cols-3 md:grid-cols-5 gap-3">
                  <div
                    v-for="(img, idx) in images"
                    :key="idx"
                    class="relative aspect-square rounded-xl overflow-hidden border border-ink-100"
                  >
                    <img :src="img" class="w-full h-full object-cover" />
                    <button
                      class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-ink-900/60 text-white flex items-center justify-center hover:bg-primary-500 transition-colors"
                      @click="removeImage(idx)"
                    >
                      <NIcon :size="14"><X /></NIcon>
                    </button>
                  </div>
                  <label
                    v-if="images.length < 9"
                    class="aspect-square rounded-xl border-2 border-dashed border-ink-200 bg-ink-50 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all text-ink-400 hover:text-primary-500"
                  >
                    <NIcon :size="28" class="mb-1"><UploadCloud /></NIcon>
                    <span class="text-caption font-medium">上传图片</span>
                    <NUpload
                      :show-file-list="false"
                      accept="image/*"
                      :custom-request="handleImageUpload"
                      class="hidden"
                    />
                  </label>
                </div>
              </div>

              <div class="flex justify-end pt-4 border-t border-ink-50">
                <NButton type="primary" size="large" :disabled="!canNextStep0" @click="nextStep">
                  下一步
                  <NIcon><ArrowRight /></NIcon>
                </NButton>
              </div>
            </div>

            <div v-else-if="currentStep === 1" class="space-y-6 animate-fade-in">
              <div>
                <label class="text-body text-ink-700 font-medium mb-3 block">选择成色 <span class="text-primary-500">*</span></label>
                <ConditionPicker v-model="condition" />
              </div>

              <div>
                <div class="flex items-center justify-between mb-3">
                  <label class="text-body text-ink-700 font-medium">商品原价 <span class="text-primary-500">*</span></label>
                  <span class="text-caption text-ink-400">购买时的价格</span>
                </div>
                <NInputNumber
                  v-model:value="originalPrice"
                  placeholder="请输入原价"
                  :min="0"
                  :max="99999"
                  class="w-full"
                  size="large"
                  :prefix="() => '¥'"
                />
              </div>

              <div v-if="originalPrice && condition" class="p-5 rounded-2xl bg-gradient-to-br from-primary-50 to-lavender-100 border border-primary-100">
                <div class="flex items-center gap-2 mb-4">
                  <NIcon class="text-primary-500" :size="20"><Sparkles /></NIcon>
                  <span class="text-heading-4 text-ink-900">平台建议售价区间</span>
                </div>
                <div class="mb-4">
                  <div class="text-caption text-ink-500 mb-1">
                    根据成色「{{ conditionTextMap[condition!] }}」和原价 ¥{{ originalPrice }} 计算得出
                  </div>
                  <div class="text-body font-bold text-ink-900">
                    <span class="text-2xl text-primary-600">¥{{ suggestedMin }}</span>
                    <span class="mx-2 text-ink-300">—</span>
                    <span class="text-2xl text-primary-600">¥{{ suggestedMax }}</span>
                  </div>
                </div>
                <div class="px-2 mb-4">
                  <NSlider
                    v-model:value="finalPrice"
                    :min="Math.max(0, suggestedMin - 100)"
                    :max="suggestedMax + 100"
                    :step="10"
                    :marks="{
                      [suggestedMin]: `¥${suggestedMin}`,
                      [suggestedDefault]: '建议',
                      [suggestedMax]: `¥${suggestedMax}`,
                    }"
                  />
                </div>
                <div class="flex items-end justify-between">
                  <span class="text-caption text-ink-500">最终售价</span>
                  <span class="price-tag text-3xl">¥{{ finalPrice }}</span>
                </div>
              </div>

              <div class="flex items-center justify-between pt-4 border-t border-ink-50">
                <NButton size="large" @click="prevStep">
                  <NIcon><ArrowLeft /></NIcon>
                  上一步
                </NButton>
                <NButton type="primary" size="large" :disabled="!canNextStep1" @click="nextStep">
                  下一步
                  <NIcon><ArrowRight /></NIcon>
                </NButton>
              </div>
            </div>

            <div v-else-if="currentStep === 2" class="space-y-6 animate-fade-in">
              <div>
                <label class="text-body text-ink-700 font-medium mb-3 block">选择交易方式 <span class="text-primary-500">*</span>（可多选）</label>
                <NCheckboxGroup v-model:value="tradeMethods">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <NCheckbox value="local" class="!flex !items-center !p-4 !rounded-2xl !border-2 !h-auto"
                      :class="tradeMethods.includes('local') ? '!border-primary-400 !bg-primary-50' : '!border-ink-100 !bg-white hover:!border-primary-200'">
                      <div class="flex items-start gap-3 ml-1">
                        <span class="text-3xl">🤝</span>
                        <div>
                          <div class="text-heading-4 text-ink-900 mb-1">同城面交</div>
                          <div class="text-caption text-ink-500">当面验货，安全放心</div>
                        </div>
                      </div>
                    </NCheckbox>
                    <NCheckbox value="express" class="!flex !items-center !p-4 !rounded-2xl !border-2 !h-auto"
                      :class="tradeMethods.includes('express') ? '!border-primary-400 !bg-primary-50' : '!border-ink-100 !bg-white hover:!border-primary-200'">
                      <div class="flex items-start gap-3 ml-1">
                        <span class="text-3xl">📦</span>
                        <div>
                          <div class="text-heading-4 text-ink-900 mb-1">快递邮寄</div>
                          <div class="text-caption text-ink-500">平台担保，物流跟踪</div>
                        </div>
                      </div>
                    </NCheckbox>
                  </div>
                </NCheckboxGroup>
              </div>

              <div v-if="tradeMethods.includes('local')" class="p-5 rounded-2xl bg-mint-50 border border-mint-100 space-y-4 animate-fade-in">
                <div class="flex items-center gap-2 text-heading-4 text-ink-900">
                  <span>📍</span><span>同城面交设置</span>
                </div>
                <div>
                  <label class="text-caption text-ink-500 mb-2 block">所在城市 <span class="text-primary-500">*</span></label>
                  <NSelect v-model:value="city" :options="cityOptions" placeholder="请选择城市" />
                </div>
                <div>
                  <label class="text-caption text-ink-500 mb-2 block">建议面交地点</label>
                  <div class="flex flex-wrap gap-2 mb-2">
                    <button
                      v-for="opt in meetupOptions"
                      :key="opt.value"
                      class="px-3 py-1.5 rounded-full text-caption transition-all"
                      :class="meetupPlace === opt.value ? 'bg-primary-500 text-white' : 'bg-white text-ink-600 border border-ink-100 hover:border-primary-300'"
                      @click="meetupPlace = opt.value"
                    >
                      {{ opt.label }}
                    </button>
                  </div>
                  <NInput v-model:value="meetupPlace" placeholder="或自定义详细地点，如：徐汇区日月光中心星巴克" />
                </div>
              </div>

              <div v-if="tradeMethods.includes('express')" class="p-5 rounded-2xl bg-lavender-50 border border-lavender-100 space-y-4 animate-fade-in">
                <div class="flex items-center gap-2 text-heading-4 text-ink-900">
                  <span>🚚</span><span>快递邮寄设置</span>
                </div>
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-body text-ink-700 font-medium">是否包邮</div>
                    <div class="text-caption text-ink-400">包邮可提高商品吸引力哦～</div>
                  </div>
                  <NSwitch v-model:value="isFreeShipping" />
                </div>
              </div>

              <div class="flex items-center justify-between pt-4 border-t border-ink-50">
                <NButton size="large" @click="prevStep">
                  <NIcon><ArrowLeft /></NIcon>
                  上一步
                </NButton>
                <NButton type="primary" size="large" :disabled="!canNextStep2" @click="nextStep">
                  下一步
                  <NIcon><ArrowRight /></NIcon>
                </NButton>
              </div>
            </div>

            <div v-else-if="currentStep === 3" class="space-y-6 animate-fade-in">
              <div class="p-5 rounded-2xl bg-gradient-to-br from-mint-50 to-primary-50 border border-mint-100">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-2xl">✨</span>
                  <span class="text-heading-3 text-ink-900">即将发布，最后确认</span>
                </div>
                <p class="text-body text-ink-500">预计获得 <span class="text-primary-600 font-bold">500+</span> 次曝光，24小时内可能成交～</p>
              </div>

              <div class="card border border-ink-100 overflow-hidden">
                <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] p-4 gap-4">
                  <div class="aspect-square rounded-xl overflow-hidden bg-ink-50 flex items-center justify-center">
                    <img v-if="images[0]" :src="images[0]" class="w-full h-full object-cover" />
                    <span v-else class="text-5xl">{{ categoryOptions.find(c => c.value === category)?.emoji || '🎁' }}</span>
                  </div>
                  <div class="space-y-2">
                    <div class="flex items-center gap-2">
                      <span class="condition-new" v-if="condition === 'new'">全新</span>
                      <span class="condition-like-new" v-else-if="condition === 'like_new'">99新</span>
                      <span class="condition-light" v-else-if="condition === 'good'">轻微使用</span>
                      <span class="condition-heavy" v-else-if="condition === 'fair'">明显使用</span>
                      <span class="chip-primary">{{ categoryOptions.find(c => c.value === category)?.label }}</span>
                    </div>
                    <h3 class="text-heading-4 text-ink-900 line-clamp-1">{{ title }}</h3>
                    <p class="text-caption text-ink-500 line-clamp-2">{{ description }}</p>
                    <div class="flex items-end gap-2 pt-1">
                      <span class="price-tag text-2xl">¥{{ finalPrice }}</span>
                      <span class="price-origin mb-0.5">¥{{ originalPrice }}</span>
                    </div>
                  </div>
                </div>
                <div class="px-4 py-3 bg-ink-50 border-t border-ink-100 flex flex-wrap gap-2">
                  <span v-if="tradeMethods.includes('local')" class="chip-mint">📍 同城面交 · {{ city }}</span>
                  <span v-if="tradeMethods.includes('local') && meetupPlace" class="chip-gray">🏪 {{ meetupPlace }}</span>
                  <span v-if="tradeMethods.includes('express')" class="chip-lavender">📦 {{ isFreeShipping ? '包邮' : '快递到付' }}</span>
                  <span class="chip-gray ml-auto">共 {{ images.length }} 张图片</span>
                </div>
              </div>

              <div class="flex items-center justify-between pt-4 border-t border-ink-50">
                <NButton size="large" @click="prevStep">
                  <NIcon><ArrowLeft /></NIcon>
                  上一步
                </NButton>
                <NButton type="primary" size="large" :loading="submitting" @click="submitProduct">
                  <NIcon><Check /></NIcon>
                  确认发布
                </NButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
