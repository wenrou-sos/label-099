<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  NSteps,
  NStep,
  NSkeleton,
  NButton,
  NAvatar,
  NIcon,
  NRate,
  NTimeline,
  NTimelineItem,
  NInput,
  NTag,
  useMessage,
  NCheckbox,
} from 'naive-ui'
import {
  CheckCircle2,
  Banknote,
  Send,
  Package,
  StarHalf,
  Home,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Clock,
  Copy,
  ShoppingBag,
  CheckCheck,
  AlertCircle,
} from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { getOrder, payOrder, receiveOrder } from '@/api/order'
import { createReview } from '@/api/review'
import type { Order, OrderStatus, ProductCondition } from '../../../shared/types'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

const loading = ref(true)
const order = ref<Order | null>(null)
const actionLoading = ref(false)

const reviewRating = ref(5)
const reviewContent = ref('')
const reviewTags = ref<string[]>([])
const reviewSubmitting = ref(false)

const quickTags = [
  '商品很新', '描述一致', '卖家靠谱', '物流很快', '包装完整',
  '性价比高', '沟通顺畅', '值得信赖', '再次回购',
]

const statusBannerMap: Record<OrderStatus, { gradient: string; icon: string; title: string; tip: string }> = {
  pending_payment: {
    gradient: 'from-orange-400 via-orange-500 to-amber-500',
    icon: '💰',
    title: '等待付款',
    tip: '请在30分钟内完成支付，超时订单将自动取消',
  },
  paid: {
    gradient: 'from-blue-400 via-blue-500 to-indigo-500',
    icon: '📦',
    title: '等待卖家发货',
    tip: '卖家正在准备商品，通常24小时内发货',
  },
  shipped: {
    gradient: 'from-purple-400 via-purple-500 to-violet-500',
    icon: '🚚',
    title: '商品运输中',
    tip: '商品正在快马加鞭赶来，请保持电话畅通',
  },
  delivered: {
    gradient: 'from-pink-400 via-pink-500 to-rose-500',
    icon: '⭐️',
    title: '等待评价',
    tip: '确认商品满意后，给卖家一个评价吧',
  },
  completed: {
    gradient: 'from-mint-400 via-mint-500 to-emerald-500',
    icon: '✅',
    title: '交易已完成',
    tip: '感谢您的信任，期待下次光临',
  },
  cancelled: {
    gradient: 'from-gray-400 via-gray-500 to-slate-500',
    icon: '❌',
    title: '订单已取消',
    tip: '如有疑问，请联系平台客服',
  },
  refunded: {
    gradient: 'from-slate-400 via-slate-500 to-gray-500',
    icon: '↩️',
    title: '已退款',
    tip: '退款已原路返回，请注意查收',
  },
}

const conditionClassMap: Record<ProductCondition, string> = {
  new: 'condition-new',
  like_new: 'condition-like-new',
  good: 'condition-light',
  fair: 'condition-heavy',
}

const conditionTextMap: Record<ProductCondition, string> = {
  new: '全新',
  like_new: '99新',
  good: '轻微使用',
  fair: '明显使用',
}

const bannerInfo = computed(() => {
  if (!order.value) return statusBannerMap['pending_payment']
  return statusBannerMap[order.value.status]
})

const currentStep = computed(() => {
  if (!order.value) return 0
  const map: Record<OrderStatus, number> = {
    pending_payment: 0,
    paid: 1,
    shipped: 2,
    delivered: 3,
    completed: 5,
    cancelled: -1,
    refunded: -1,
  }
  return map[order.value.status]
})

const isBuyer = computed(() => userStore.userInfo?.id === order.value?.buyerId)

const shippingFee = computed(() => 0)
const discountAmount = computed(() => {
  if (!order.value?.product) return 0
  return order.value.product.originalPrice - order.value.price
})

const logisticsTrack = [
  { time: '2025-06-18 14:30', title: '【派送中】', desc: '快递员 张师傅 (138****8888) 正在为您派送，请保持电话畅通', type: 'success' },
  { time: '2025-06-18 09:15', title: '【到达】', desc: '包裹已到达【上海徐汇区配送站】', type: 'default' },
  { time: '2025-06-17 22:40', title: '【运输中】', desc: '包裹已从【上海转运中心】发出，下一站【上海徐汇区配送站】', type: 'default' },
  { time: '2025-06-17 18:20', title: '【已揽收】', desc: '快递公司已揽收，包裹已发往【上海转运中心】', type: 'default' },
  { time: '2025-06-17 16:00', title: '【等待揽收】', desc: '商家已通知快递揽收，请耐心等待', type: 'default' },
]

async function fetchOrder() {
  loading.value = true
  try {
    const id = Number(route.params.id)
    order.value = await getOrder(id)
  } catch (e: any) {
    message.error(e?.message || '加载订单失败')
  } finally {
    loading.value = false
  }
}

function formatTime(t?: string) {
  if (!t) return '—'
  return new Date(t).toLocaleString()
}

async function handlePay() {
  if (!order.value) return
  actionLoading.value = true
  try {
    await payOrder(order.value.id)
    message.success('🎉 支付成功！')
    fetchOrder()
  } catch (e: any) {
    message.error(e?.message || '支付失败')
  } finally {
    actionLoading.value = false
  }
}

function handleCancel() {
  if (window.confirm('确定要取消这个订单吗？')) {
    message.info('取消功能开发中')
  }
}

async function handleReceive() {
  if (!order.value) return
  if (!window.confirm('确认已收到商品且无质量问题？')) return
  actionLoading.value = true
  try {
    await receiveOrder(order.value.id)
    message.success('确认收货成功！')
    fetchOrder()
  } catch (e: any) {
    message.error(e?.message || '操作失败')
  } finally {
    actionLoading.value = false
  }
}

function toggleTag(tag: string) {
  const idx = reviewTags.value.indexOf(tag)
  if (idx >= 0) {
    reviewTags.value.splice(idx, 1)
  } else {
    reviewTags.value.push(tag)
  }
}

async function handleSubmitReview() {
  if (!order.value || reviewSubmitting.value) return
  if (!reviewContent.value.trim()) {
    message.warning('请输入评价内容')
    return
  }
  reviewSubmitting.value = true
  try {
    await createReview({
      orderId: order.value.id,
      rating: reviewRating.value,
      content: reviewContent.value,
    })
    message.success('评价提交成功！')
    order.value.status = 'completed'
  } catch (e: any) {
    message.error(e?.message || '提交失败')
  } finally {
    reviewSubmitting.value = false
  }
}

function copyOrderNo() {
  if (!order.value) return
  navigator.clipboard?.writeText(order.value.orderNo)
  message.success('订单号已复制')
}

function copyTrackingNo() {
  if (!order.value) return
  const trackingNo = order.value.trackingNo || 'SF1234567890123'
  navigator.clipboard?.writeText(trackingNo)
  message.success('运单号已复制')
}

function scrollToReview() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
}

onMounted(fetchOrder)
</script>

<template>
  <div class="min-h-screen bg-cream-50 pb-32">
    <div class="max-w-[1100px] mx-auto px-4 md:px-6 lg:px-8 py-6">
      <nav class="flex items-center gap-2 text-caption text-ink-500 mb-6">
        <NIcon><Home /></NIcon>
        <span class="cursor-pointer hover:text-primary-500" @click="router.push('/')">首页</span>
        <NIcon size="14"><ChevronRight /></NIcon>
        <span class="cursor-pointer hover:text-primary-500" @click="router.push('/orders')">我的订单</span>
        <NIcon size="14"><ChevronRight /></NIcon>
        <span class="text-ink-900 font-medium">订单详情</span>
      </nav>
    </div>

    <div v-if="loading" class="max-w-[1100px] mx-auto px-4 md:px-6 lg:px-8 space-y-6">
      <NSkeleton animated height="180px" class="!rounded-2xl" />
      <NSkeleton animated height="100px" class="!rounded-2xl" />
      <div class="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        <NSkeleton animated height="400px" class="!rounded-2xl" />
        <NSkeleton animated height="400px" class="!rounded-2xl" />
      </div>
    </div>

    <template v-else-if="order">
      <div class="max-w-[1100px] mx-auto px-4 md:px-6 lg:px-8 space-y-6">
        <div
          class="rounded-3xl p-6 md:p-8 bg-gradient-to-br text-white overflow-hidden relative"
          :class="bannerInfo.gradient"
        >
          <div class="absolute -right-10 -top-10 text-[160px] opacity-20">
            {{ bannerInfo.icon }}
          </div>
          <div class="relative z-10 flex items-start gap-4 md:gap-6">
            <div class="text-5xl md:text-6xl flex-shrink-0">{{ bannerInfo.icon }}</div>
            <div class="flex-1 min-w-0">
              <h2 class="text-heading-2 md:text-heading-1 font-bold mb-2">{{ bannerInfo.title }}</h2>
              <p class="text-white/80 text-body md:text-base mb-4">{{ bannerInfo.tip }}</p>
              <div class="flex flex-wrap items-center gap-4 text-sm text-white/70">
                <span class="flex items-center gap-1.5">
                  <NIcon :size="14"><ShoppingBag /></NIcon>
                  订单号：{{ order.orderNo }}
                </span>
                <button
                  class="flex items-center gap-1.5 hover:text-white transition-colors"
                  @click="copyOrderNo"
                >
                  <NIcon :size="14"><Copy /></NIcon>
                  复制
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="card p-5 md:p-6">
          <NSteps
            v-if="currentStep >= 0"
            :current="currentStep"
            size="medium"
            :status="order.status === 'completed' ? 'finish' : 'process'"
          >
            <NStep title="下单成功" description="提交订单">
              <template #icon>
                <div class="w-10 h-10 rounded-full flex items-center justify-center bg-white border-2 border-primary-500 text-primary-500 font-bold text-sm">1</div>
              </template>
              <div class="text-caption text-ink-400 mt-1">{{ formatTime(order.createdAt) }}</div>
            </NStep>
            <NStep title="付款成功" description="完成支付">
              <template #icon>
                <div class="w-10 h-10 rounded-full flex items-center justify-center bg-white border-2 border-primary-500 text-primary-500 font-bold text-sm">2</div>
              </template>
              <div class="text-caption text-ink-400 mt-1">{{ formatTime(order.paidAt) }}</div>
            </NStep>
            <NStep title="卖家发货" description="商品已寄出">
              <template #icon>
                <div class="w-10 h-10 rounded-full flex items-center justify-center bg-white border-2 border-primary-500 text-primary-500 font-bold text-sm">3</div>
              </template>
              <div class="text-caption text-ink-400 mt-1">{{ formatTime(order.shippedAt) }}</div>
            </NStep>
            <NStep title="确认收货" description="商品已送达">
              <template #icon>
                <div class="w-10 h-10 rounded-full flex items-center justify-center bg-white border-2 border-primary-500 text-primary-500 font-bold text-sm">4</div>
              </template>
              <div class="text-caption text-ink-400 mt-1">{{ formatTime(order.deliveredAt) }}</div>
            </NStep>
            <NStep title="双方互评" description="评价成功">
              <template #icon>
                <div class="w-10 h-10 rounded-full flex items-center justify-center bg-white border-2 border-primary-500 text-primary-500 font-bold text-sm">5</div>
              </template>
            </NStep>
            <NStep title="交易完成" description="订单关闭">
              <template #icon>
                <div class="w-10 h-10 rounded-full flex items-center justify-center bg-white border-2 border-primary-500 text-primary-500 font-bold text-sm">
                  <NIcon :size="18"><CheckCircle2 /></NIcon>
                </div>
              </template>
              <div class="text-caption text-ink-400 mt-1">{{ formatTime(order.completedAt) }}</div>
            </NStep>
          </NSteps>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
          <div class="space-y-6">
            <div class="card p-5 md:p-6">
              <h3 class="text-heading-4 text-ink-900 mb-4 flex items-center gap-2">
                <span>🛍️</span>商品信息
              </h3>
              <div
                class="grid grid-cols-[100px_1fr_auto] md:grid-cols-[120px_1fr_auto] gap-4 items-start p-4 rounded-2xl bg-ink-50 cursor-pointer hover:bg-ink-100/70 transition-colors"
                @click="order.productId && router.push(`/market/${order.productId}`)"
              >
                <div
                  class="w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-xl overflow-hidden bg-white flex items-center justify-center flex-shrink-0"
                >
                  <img
                    v-if="order.product?.images?.[0]"
                    :src="order.product.images[0]"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-4xl">🎁</span>
                </div>
                <div class="min-w-0 py-1">
                  <h4 class="text-heading-4 text-ink-900 line-clamp-2 mb-2">
                    {{ order.product?.title || '商品已下架' }}
                  </h4>
                  <div class="flex flex-wrap items-center gap-2 mb-2">
                    <span v-if="order.product" :class="conditionClassMap[order.product.condition]">
                      {{ conditionTextMap[order.product.condition] }}
                    </span>
                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold"
                      :class="isBuyer ? 'bg-lavender-100 text-lavender-700' : 'bg-mint-100 text-mint-700'"
                    >
                      {{ isBuyer ? '🛍️ 我是买家' : '👩‍💼 我是卖家' }}
                    </span>
                  </div>
                  <div class="flex items-center gap-3 text-caption text-ink-400">
                    <NAvatar round :size="22" :src="isBuyer ? order.seller?.avatar : order.buyer?.avatar">
                      {{ (isBuyer ? order.seller?.nickname : order.buyer?.nickname)?.charAt(0) }}
                    </NAvatar>
                    <span>{{ isBuyer ? order.seller?.nickname || order.seller?.username : order.buyer?.nickname || order.buyer?.username }}</span>
                  </div>
                </div>
                <div class="text-right py-1 flex-shrink-0">
                  <div class="price-tag text-2xl mb-1">¥{{ order.price }}</div>
                  <div class="text-caption text-ink-400">x1</div>
                </div>
              </div>
            </div>

            <div v-if="order.trackingNo || order.status === 'shipped'" class="card p-5 md:p-6">
              <h3 class="text-heading-4 text-ink-900 mb-4 flex items-center gap-2">
                <span>🚚</span>物流信息
              </h3>
              <div class="p-4 rounded-2xl bg-blue-50 border border-blue-100 mb-5">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div class="text-caption text-ink-400 mb-1">快递公司</div>
                    <div class="text-body font-medium text-ink-900">顺丰速运</div>
                  </div>
                  <div>
                    <div class="text-caption text-ink-400 mb-1">运单号</div>
                    <div class="flex items-center gap-2">
                      <span class="text-body font-medium text-ink-900">{{ order.trackingNo || 'SF1234567890123' }}</span>
                      <button
                        class="text-primary-500 text-caption hover:text-primary-600"
                        @click="copyTrackingNo"
                      >
                        复制
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <NTimeline>
                <NTimelineItem
                  v-for="(item, idx) in logisticsTrack"
                  :key="idx"
                  :type="item.type as any"
                  :title="item.title"
                  :time="item.time"
                >
                  {{ item.desc }}
                </NTimelineItem>
              </NTimeline>
            </div>

            <div v-if="order.address" class="card p-5 md:p-6">
              <h3 class="text-heading-4 text-ink-900 mb-4 flex items-center gap-2">
                <span>📍</span>面交信息
              </h3>
              <div class="p-4 rounded-2xl bg-mint-50 border border-mint-100 space-y-3">
                <div class="flex items-start gap-3">
                  <NIcon :size="18" class="text-mint-700 mt-0.5"><MapPin /></NIcon>
                  <div>
                    <div class="text-caption text-ink-400 mb-0.5">约定地点</div>
                    <div class="text-body font-medium text-ink-900">{{ order.address }}</div>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <NIcon :size="18" class="text-mint-700 mt-0.5"><Clock /></NIcon>
                  <div>
                    <div class="text-caption text-ink-400 mb-0.5">建议时间</div>
                    <div class="text-body font-medium text-ink-900">工作日 10:00-18:00 或周末全天</div>
                  </div>
                </div>
                <div class="pt-2 mt-2 border-t border-mint-100 flex items-start gap-2">
                  <NIcon :size="16" class="text-amber-500 mt-0.5"><AlertCircle /></NIcon>
                  <p class="text-caption text-ink-500 leading-relaxed">
                    建议在公共场所面交，注意人身和财物安全。验清商品后再确认收货哦～
                  </p>
                </div>
              </div>
            </div>

            <div
              v-if="(order.status === 'delivered' || order.status === 'completed') && isBuyer"
              class="card p-5 md:p-6"
            >
              <h3 class="text-heading-4 text-ink-900 mb-4 flex items-center gap-2">
                <span>⭐️</span>
                {{ order.status === 'completed' ? '我的评价' : '评价卖家' }}
              </h3>

              <div v-if="order.status === 'completed'" class="p-4 rounded-2xl bg-ink-50">
                <div class="flex items-center gap-3 mb-3">
                  <NRate :value="5" readonly size="small" />
                  <span class="text-caption text-ink-400">2025-06-20 评价</span>
                </div>
                <p class="text-body text-ink-700 leading-relaxed">
                  商品很新，和描述完全一致！卖家人特别好，沟通很顺畅，同城面交也很顺利。孩子很喜欢这个玩具，价格也实惠，下次还会再来买！
                </p>
                <div class="flex flex-wrap gap-2 mt-3">
                  <span class="chip-primary">商品很新</span>
                  <span class="chip-primary">描述一致</span>
                  <span class="chip-primary">卖家靠谱</span>
                </div>
              </div>

              <div v-else class="space-y-4">
                <div>
                  <div class="text-caption text-ink-500 mb-2">评分</div>
                  <NRate v-model:value="reviewRating" size="large" />
                </div>
                <div>
                  <div class="text-caption text-ink-500 mb-2">快捷标签</div>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="tag in quickTags"
                      :key="tag"
                      class="px-3 py-1.5 rounded-full text-caption transition-all border-2"
                      :class="reviewTags.includes(tag)
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-white text-ink-600 border-ink-100 hover:border-primary-300'"
                      @click="toggleTag(tag)"
                    >
                      {{ tag }}
                    </button>
                  </div>
                </div>
                <div>
                  <div class="text-caption text-ink-500 mb-2">评价内容</div>
                  <NInput
                    v-model:value="reviewContent"
                    type="textarea"
                    placeholder="分享您的购物体验，帮助其他宝妈做出选择～"
                    :rows="4"
                    maxlength="500"
                    show-count
                  />
                </div>
                <div class="flex justify-end">
                  <NButton
                    type="primary"
                    size="large"
                    :loading="reviewSubmitting"
                    :disabled="!reviewContent.trim()"
                    @click="handleSubmitReview"
                  >
                    <NIcon :size="18"><StarHalf /></NIcon>
                    提交评价
                  </NButton>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <div class="card p-5 md:p-6">
              <h3 class="text-heading-4 text-ink-900 mb-4 flex items-center gap-2">
                <span>📋</span>订单信息
              </h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center py-2 border-b border-ink-50">
                  <span class="text-caption text-ink-500">订单编号</span>
                  <span class="text-body text-ink-900 font-mono text-sm">{{ order.orderNo }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-ink-50">
                  <span class="text-caption text-ink-500">下单时间</span>
                  <span class="text-body text-ink-700">{{ formatTime(order.createdAt) }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-ink-50">
                  <span class="text-caption text-ink-500">支付方式</span>
                  <span class="text-body text-ink-700 flex items-center gap-1">
                    <NIcon :size="14" class="text-green-500"><Banknote /></NIcon>
                    微信支付
                  </span>
                </div>
                <div class="flex justify-between items-center py-2">
                  <span class="text-caption text-ink-500">支付时间</span>
                  <span class="text-body text-ink-700">{{ formatTime(order.paidAt) }}</span>
                </div>
              </div>
            </div>

            <div class="card p-5 md:p-6">
              <h3 class="text-heading-4 text-ink-900 mb-4 flex items-center gap-2">
                <span>💰</span>价格明细
              </h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center py-2 border-b border-ink-50">
                  <span class="text-caption text-ink-500">商品金额</span>
                  <span class="text-body text-ink-700">¥{{ order.product?.originalPrice || order.price }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-ink-50">
                  <span class="text-caption text-ink-500">运费</span>
                  <span class="text-body text-mint-700 font-medium">
                    {{ shippingFee === 0 ? '包邮' : `¥${shippingFee}` }}
                  </span>
                </div>
                <div v-if="discountAmount > 0" class="flex justify-between items-center py-2 border-b border-ink-50">
                  <span class="text-caption text-ink-500">优惠</span>
                  <span class="text-body text-primary-600 font-medium">-¥{{ discountAmount }}</span>
                </div>
                <div class="flex justify-between items-center pt-3">
                  <span class="text-body text-ink-900 font-medium">实付金额</span>
                  <span class="price-tag text-2xl">¥{{ order.price }}</span>
                </div>
              </div>
            </div>

            <div class="card p-4 bg-gradient-to-br from-primary-50 to-mint-50 border border-primary-100">
              <div class="flex items-start gap-3">
                <NIcon :size="20" class="text-primary-500 mt-0.5"><ShieldCheck /></NIcon>
                <div>
                  <div class="text-body font-medium text-ink-900 mb-1">平台担保交易 🔒</div>
                  <div class="text-caption text-ink-500 leading-relaxed">
                    付款先到平台托管，确认收货后才打款给卖家。遇到问题可申请平台介入。
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-ink-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      >
        <div class="max-w-[1100px] mx-auto px-4 md:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-end gap-3">
          <template v-if="order.status === 'pending_payment'">
            <NButton size="large" @click="handleCancel">取消订单</NButton>
            <NButton
              type="primary"
              size="large"
              :loading="actionLoading"
              @click="handlePay"
            >
              <NIcon :size="18"><Banknote /></NIcon>
              立即付款 ¥{{ order.price }}
            </NButton>
          </template>

          <template v-else-if="order.status === 'paid'">
            <template v-if="isBuyer">
              <NButton size="large" @click="handleCancel">取消订单</NButton>
              <NButton size="large" secondary @click="message.info('已提醒卖家')">
                <NIcon :size="16"><AlertCircle /></NIcon>
                提醒发货
              </NButton>
            </template>
            <template v-else>
              <NButton type="primary" size="large" @click="message.info('发货功能开发中')">
                <NIcon :size="18"><Send /></NIcon>
                立即发货
              </NButton>
            </template>
          </template>

          <template v-else-if="order.status === 'shipped'">
            <NButton size="large" secondary @click="message.info('物流详情见上方')">
              <NIcon :size="16"><Package /></NIcon>
              查看物流
            </NButton>
            <template v-if="isBuyer">
              <NButton
                type="primary"
                size="large"
                :loading="actionLoading"
                @click="handleReceive"
              >
                <NIcon :size="18"><CheckCheck /></NIcon>
                确认收货
              </NButton>
            </template>
          </template>

          <template v-else-if="order.status === 'delivered' && isBuyer">
            <NButton
              type="primary"
              size="large"
              @click="scrollToReview"
            >
              <NIcon :size="18"><StarHalf /></NIcon>
              去评价
            </NButton>
          </template>

          <template v-else-if="order.status === 'completed'">
            <NButton
              size="large"
              secondary
              @click="order.productId && router.push(`/market/${order.productId}`)"
            >
              再次购买
            </NButton>
            <NButton size="large" @click="router.push('/orders')">
              返回订单列表
            </NButton>
          </template>

          <template v-else>
            <NButton size="large" @click="router.push('/orders')">
              返回订单列表
            </NButton>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>
