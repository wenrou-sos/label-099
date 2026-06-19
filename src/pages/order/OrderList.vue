<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  NTabs,
  NTabPane,
  NSkeleton,
  NButton,
  NAvatar,
  NIcon,
  NTag,
  NBadge,
  useMessage,
  NEmpty,
  NPagination,
  useDialog,
} from 'naive-ui'
import {
  ShoppingBag,
  Banknote,
  Send,
  Package,
  StarHalf,
  CheckCircle2,
  AlertCircle,
  Home,
  ChevronRight,
  RotateCcw,
  Trash2,
  XCircle,
  Undo2,
} from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { getOrderList, getOrderStats, deleteOrder, cancelOrder, payOrder, receiveOrder } from '@/api/order'
import type { Order, OrderStatus, ProductCondition, OrderStats } from '../../../shared/types'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const dialog = useDialog()
const userStore = useUserStore()

const loading = ref(true)
const orders = ref<Order[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const activeTab = ref('all')
const actionLoading = ref<Record<number, boolean>>({})
const stats = ref<OrderStats | null>(null)

const tabConfig = [
  { value: 'all', label: '全部', icon: ShoppingBag, badge: null as null | number },
  { value: 'pending_payment', label: '待付款', icon: Banknote, badge: null as null | number },
  { value: 'paid', label: '待发货', icon: Send, badge: null as null | number },
  { value: 'shipped', label: '待收货', icon: Package, badge: null as null | number },
  { value: 'delivered', label: '待评价', icon: StarHalf, badge: null as null | number },
  { value: 'completed', label: '已完成', icon: CheckCircle2, badge: null as null | number },
  { value: 'cancelled', label: '已取消', icon: XCircle, badge: null as null | number },
  { value: 'refunded', label: '已退款', icon: Undo2, badge: null as null | number },
]

function getBadgeCount(tabValue: string): number | null {
  if (!stats.value) return null
  if (tabValue === 'all') return stats.value.total
  return (stats.value as any)[tabValue] ?? null
}

const statusInfo: Record<OrderStatus, { label: string; class: string; icon: string }> = {
  pending_payment: { label: '待付款', class: 'bg-orange-100 text-orange-600', icon: '💰' },
  paid: { label: '待发货', class: 'bg-blue-100 text-blue-600', icon: '📦' },
  shipped: { label: '待收货', class: 'bg-purple-100 text-purple-600', icon: '🚚' },
  delivered: { label: '待评价', class: 'bg-pink-100 text-pink-600', icon: '⭐️' },
  completed: { label: '已完成', class: 'bg-mint-100 text-mint-700', icon: '✅' },
  cancelled: { label: '已取消', class: 'bg-ink-100 text-ink-500', icon: '❌' },
  refunded: { label: '已退款', class: 'bg-gray-100 text-gray-500', icon: '↩️' },
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

async function fetchOrders() {
  loading.value = true
  try {
    const params: any = { page: page.value, pageSize }
    if (activeTab.value !== 'all') {
      params.status = activeTab.value
    }
    const res = await getOrderList(params)
    orders.value = res.list || []
    total.value = res.total || 0
  } catch {
    orders.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  try {
    stats.value = await getOrderStats()
  } catch {
    stats.value = null
  }
}

function refreshAll() {
  fetchOrders()
  fetchStats()
}

function handlePageChange(p: number) {
  page.value = p
  fetchOrders()
}

watch(activeTab, () => {
  page.value = 1
  fetchOrders()
})

onMounted(refreshAll)

function isBuyer(order: Order) {
  return userStore.userInfo?.id === order.buyerId
}

async function handlePay(order: Order) {
  actionLoading.value[order.id] = true
  try {
    await payOrder(order.id)
    message.success('🎉 支付成功！')
    fetchOrders()
  } catch (e: any) {
    message.error(e?.message || '支付失败')
  } finally {
    actionLoading.value[order.id] = false
  }
}

function handleCancel(order: Order) {
  dialog.warning({
    title: '确认取消订单？',
    content: '取消后订单将无法恢复，是否继续？',
    positiveText: '确认取消',
    negativeText: '再想想',
    onPositiveClick: async () => {
      actionLoading.value[order.id] = true
      try {
        await cancelOrder(order.id)
        message.success('订单已取消')
        refreshAll()
      } catch (e: any) {
        message.error(e?.message || '取消失败')
      } finally {
        actionLoading.value[order.id] = false
      }
    },
  })
}

function handleRemindShip(order: Order) {
  message.info('已提醒卖家发货')
}

function handleReceive(order: Order) {
  dialog.warning({
    title: '确认已收到商品？',
    content: '确认收货后将完成交易，请确保已检查商品无误。',
    positiveText: '确认收货',
    negativeText: '再等等',
    onPositiveClick: async () => {
      actionLoading.value[order.id] = true
      try {
        await receiveOrder(order.id)
        message.success('确认收货成功，请去评价～')
        refreshAll()
      } catch (e: any) {
        message.error(e?.message || '操作失败')
      } finally {
        actionLoading.value[order.id] = false
      }
    },
  })
}

function handleReview(order: Order) {
  router.push(`/orders/${order.id}?action=review`)
}

function handleRebuy(order: Order) {
  if (order.productId) {
    router.push(`/market/${order.productId}`)
  }
}

function handleDelete(order: Order) {
  dialog.warning({
    title: '确认删除订单？',
    content: '删除后订单记录将无法恢复，是否继续？',
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      actionLoading.value[order.id] = true
      try {
        await deleteOrder(order.id)
        message.success('已删除')
        refreshAll()
      } catch (e: any) {
        message.error(e?.message || '删除失败')
      } finally {
        actionLoading.value[order.id] = false
      }
    },
  })
}

function goDetail(order: Order) {
  router.push(`/orders/${order.id}`)
}
</script>

<template>
  <div class="min-h-screen bg-cream-50 py-6 px-4 md:px-6 lg:px-8">
    <div class="max-w-[1000px] mx-auto">
      <nav class="flex items-center gap-2 text-caption text-ink-500 mb-6">
        <NIcon><Home /></NIcon>
        <span class="cursor-pointer hover:text-primary-500" @click="router.push('/')">首页</span>
        <NIcon :size="14"><ChevronRight /></NIcon>
        <span class="text-ink-900 font-medium">我的订单</span>
      </nav>

      <div class="mb-6">
        <h1 class="text-heading-1 text-ink-900 mb-2">我的订单 🛍️</h1>
        <p class="text-body text-ink-500">共 {{ total }} 笔订单</p>
      </div>

      <div class="card overflow-hidden">
        <NTabs
          v-model:value="activeTab"
          size="large"
          type="line"
          class="px-4 md:px-6"
          :pane-style="{ padding: '24px 0' }"
        >
          <NTabPane
            v-for="tab in tabConfig"
            :key="tab.value"
            :name="tab.value"
          >
            <template #tab>
              <div class="flex items-center gap-2 py-2">
                <NIcon :size="16"><component :is="tab.icon" /></NIcon>
                <span>{{ tab.label }}</span>
                <span
                  v-if="getBadgeCount(tab.value) !== null && getBadgeCount(tab.value)! > 0"
                  class="text-xs text-ink-500 font-medium"
                >
                  ({{ getBadgeCount(tab.value) }})
                </span>
              </div>
            </template>
          </NTabPane>
        </NTabs>

        <div class="px-4 md:px-6 pb-6 -mt-6">
          <div v-if="loading" class="space-y-4 stagger">
            <div v-for="i in 3" :key="i" class="card p-5">
              <div class="flex items-center justify-between mb-4">
                <NSkeleton animated width="200px" height="16px" round />
                <NSkeleton animated width="80px" height="24px" round />
              </div>
              <div class="grid grid-cols-[100px_1fr_auto] gap-4">
                <NSkeleton animated width="100px" height="100px" class="!rounded-xl" />
                <div class="space-y-2 py-1">
                  <NSkeleton animated text round :repeat="2" />
                </div>
                <div class="space-y-2 py-1 text-right">
                  <NSkeleton animated width="100px" height="20px" round />
                  <NSkeleton animated width="60px" height="14px" round />
                </div>
              </div>
              <div class="mt-4 flex justify-end gap-2 pt-4 border-t border-ink-50">
                <NSkeleton animated width="100px" height="36px" class="!rounded-xl" />
                <NSkeleton animated width="100px" height="36px" class="!rounded-xl" />
              </div>
            </div>
          </div>

          <div v-else-if="orders.length === 0" class="py-20">
            <NEmpty description="暂无订单，去逛逛闲置市场吧～">
              <template #extra>
                <NButton type="primary" size="large" @click="router.push('/market')">
                  去逛逛
                </NButton>
              </template>
            </NEmpty>
          </div>

          <div v-else class="space-y-4 stagger">
            <div
              v-for="order in orders"
              :key="order.id"
              class="card-hover overflow-hidden cursor-pointer"
              @click="goDetail(order)"
            >
              <div class="p-4 md:p-5">
                <div class="flex flex-wrap items-center justify-between gap-2 mb-4 pb-4 border-b border-ink-50">
                  <div class="flex flex-wrap items-center gap-3">
                    <span class="text-caption text-ink-400">订单号：{{ order.orderNo }}</span>
                    <span class="text-caption text-ink-400">
                      {{ new Date(order.createdAt).toLocaleString() }}
                    </span>
                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold"
                      :class="isBuyer(order) ? 'bg-lavender-100 text-lavender-700' : 'bg-mint-100 text-mint-700'"
                    >
                      {{ isBuyer(order) ? '🛍️ 我是买家' : '👩‍💼 我是卖家' }}
                    </span>
                  </div>
                  <span
                    class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-caption font-bold"
                    :class="statusInfo[order.status].class"
                  >
                    <span>{{ statusInfo[order.status].icon }}</span>
                    {{ statusInfo[order.status].label }}
                  </span>
                </div>

                <div class="grid grid-cols-[80px_1fr_auto] md:grid-cols-[100px_1fr_auto] gap-4 items-start">
                  <div
                    class="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-xl overflow-hidden bg-ink-50 flex items-center justify-center flex-shrink-0"
                  >
                    <img
                      v-if="order.product?.images?.[0]"
                      :src="order.product.images[0]"
                      class="w-full h-full object-cover"
                    />
                    <span v-else class="text-4xl">🎁</span>
                  </div>

                  <div class="min-w-0 py-1">
                    <h3 class="text-heading-4 text-ink-900 line-clamp-2 mb-2">
                      {{ order.product?.title || '商品已下架' }}
                    </h3>
                    <div v-if="order.product" class="flex items-center gap-2">
                      <span :class="conditionClassMap[order.product.condition]">
                        {{ conditionTextMap[order.product.condition] }}
                      </span>
                    </div>
                  </div>

                  <div class="text-right py-1 flex-shrink-0">
                    <div class="price-tag text-xl mb-1">¥{{ order.price }}</div>
                    <div class="text-caption text-ink-400">x1</div>
                  </div>
                </div>

                <div
                  class="mt-4 pt-4 border-t border-ink-50 flex flex-wrap justify-end gap-2"
                  @click.stop
                >
                  <template v-if="order.status === 'pending_payment'">
                    <NButton size="small" @click="handleCancel(order)">
                      取消订单
                    </NButton>
                    <NButton
                      type="primary"
                      size="small"
                      :loading="actionLoading[order.id]"
                      @click="handlePay(order)"
                    >
                      立即付款
                    </NButton>
                  </template>

                  <template v-else-if="order.status === 'paid'">
                    <template v-if="isBuyer(order)">
                      <NButton size="small" @click="handleCancel(order)">
                        取消订单
                      </NButton>
                      <NButton size="small" secondary @click="handleRemindShip(order)">
                        <NIcon :size="14"><AlertCircle /></NIcon>
                        提醒发货
                      </NButton>
                    </template>
                    <template v-else>
                      <NButton type="primary" size="small" @click="message.info('发货功能开发中')">
                        <NIcon :size="14"><Send /></NIcon>
                        去发货
                      </NButton>
                    </template>
                  </template>

                  <template v-else-if="order.status === 'shipped'">
                    <NButton size="small" secondary @click="goDetail(order)">
                      查看物流
                    </NButton>
                    <template v-if="isBuyer(order)">
                      <NButton type="primary" size="small" @click="handleReceive(order)">
                        <NIcon :size="14"><CheckCircle2 /></NIcon>
                        确认收货
                      </NButton>
                    </template>
                  </template>

                  <template v-else-if="order.status === 'delivered'">
                    <template v-if="isBuyer(order)">
                      <NButton type="primary" size="small" @click="handleReview(order)">
                        <NIcon :size="14"><StarHalf /></NIcon>
                        去评价
                      </NButton>
                    </template>
                  </template>

                  <template v-else-if="order.status === 'completed'">
                    <NButton size="small" secondary @click="handleRebuy(order)">
                      <NIcon :size="14"><RotateCcw /></NIcon>
                      再次购买
                    </NButton>
                    <NButton size="small" @click="handleDelete(order)">
                      <NIcon :size="14"><Trash2 /></NIcon>
                      删除
                    </NButton>
                  </template>

                  <template v-else-if="order.status === 'cancelled' || order.status === 'refunded'">
                    <NButton size="small" secondary @click="goDetail(order)">
                      查看详情
                    </NButton>
                    <NButton size="small" @click="handleDelete(order)">
                      <NIcon :size="14"><Trash2 /></NIcon>
                      删除
                    </NButton>
                  </template>

                  <template v-else>
                    <NButton size="small" secondary @click="goDetail(order)">
                      查看详情
                    </NButton>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!loading && total > pageSize" class="mt-8 flex justify-center">
            <NPagination
              :page="page"
              :page-size="pageSize"
              :item-count="total"
              :page-slot="5"
              @update:page="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
