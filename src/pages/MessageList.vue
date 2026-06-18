<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import {
  Bell, ShoppingCart, ClipboardList, MessageCircle,
  Heart, Lightbulb, Handshake, ChevronRight, CheckCheck,
  Trash2, Package, Eye, Star, HelpCircle
} from 'lucide-vue-next'
import {
  getNotificationList, markNotificationRead,
  readAllNotifications, getUnreadCount
} from '@/api/notification'
import type { Notification, NotificationType } from '@shared/types'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const message = useMessage()
const appStore = useAppStore()

const loading = ref(true)
const notifications = ref<Notification[]>([])
const activeCategory = ref('all')
const expandedId = ref<number | null>(null)

const categories: { key: string | NotificationType; label: string; icon: any; color: string }[] = [
  { key: 'all', label: '全部消息', icon: Bell, color: 'text-primary-500' },
  { key: 'system', label: '系统通知', icon: Bell, color: 'text-blue-500' },
  { key: 'order', label: '交易消息', icon: ShoppingCart, color: 'text-primary-500' },
  { key: 'trade', label: '订单消息', icon: ClipboardList, color: 'text-lavender-700' },
  { key: 'comment', label: '评论消息', icon: MessageCircle, color: 'text-cyan-500' },
  { key: 'like', label: '点赞收藏', icon: Heart, color: 'text-rose-500' },
  { key: 'answer', label: '问答消息', icon: Lightbulb, color: 'text-amber-500' },
  { key: 'chat', label: '聊天消息', icon: Handshake, color: 'text-emerald-500' },
]

const mockNotifications: (Notification & { summary?: string; extra?: any })[] = [
  {
    id: 1, userId: 1, type: 'system',
    title: '平台升级公告',
    content: '亲爱的宝妈们，平台将于今晚 23:00-24:00 进行系统升级维护，期间可能无法正常访问，给您带来不便敬请谅解！升级后将支持更多新功能，敬请期待~',
    summary: '今晚23:00-24:00系统升级维护',
    isRead: false, createdAt: '2024-06-16T08:00:00Z',
  },
  {
    id: 2, userId: 1, type: 'order',
    title: '买家已下单',
    content: '您发布的商品「9成新婴儿推车 高景观可坐可躺」已被「开心小宝妈」拍下，请及时处理订单。订单金额：¥399.00',
    summary: '「9成新婴儿推车」已被拍下 ¥399',
    extra: { orderId: 'DD20240616001', productId: 1, type: 'seller' },
    isRead: false, createdAt: '2024-06-16T10:30:00Z',
  },
  {
    id: 3, userId: 1, type: 'trade',
    title: '订单已发货',
    content: '您购买的商品「全新宝宝满月礼盒 8件套」卖家已发货，快递公司：顺丰速运，运单号：SF1234567890，预计1-2天送达。',
    summary: '顺丰 SF1234567890 已发货，预计1-2天送达',
    extra: { orderId: 'DD20240614008', type: 'buyer' },
    isRead: false, createdAt: '2024-06-16T09:15:00Z',
  },
  {
    id: 4, userId: 1, type: 'comment',
    title: '收到新评论',
    content: '「爱心妈妈」在您的帖子《分享我的顺产日记——从宫缩到分娩的12小时全记录》中评论："太有用了！我马上也到预产期了，收藏学习！请问无痛真的有用吗？"',
    summary: '「爱心妈妈」评论了您的帖子',
    extra: { postId: 1, commentId: 101 },
    isRead: true, createdAt: '2024-06-15T22:10:00Z',
  },
  {
    id: 5, userId: 1, type: 'like',
    title: '获得新点赞',
    content: '您的帖子《6个月宝宝辅食添加攻略，详细食谱每周更新！》获得了 28 个赞和 15 次收藏，继续加油分享优质内容哦~',
    summary: '您的帖子获得了28个赞+15次收藏',
    extra: { postId: 2 },
    isRead: true, createdAt: '2024-06-15T18:00:00Z',
  },
  {
    id: 6, userId: 1, type: 'answer',
    title: '专家已回答',
    content: '您向「张医生」咨询的问题《宝宝3个月突然不肯喝奶瓶了怎么办？》专家已给出详细回答，点击查看完整解答。已有 156 位宝妈付费围观学习。',
    summary: '「张医生」已回答您的问题，156人围观',
    extra: { questionId: 1 },
    isRead: false, createdAt: '2024-06-15T11:45:00Z',
  },
  {
    id: 7, userId: 1, type: 'chat',
    title: '新消息',
    content: '「豆豆妈」给您发送了消息："请问那个推车还能再便宜一点吗？我自提的话~"',
    summary: '「豆豆妈」：请问那个推车还能再便宜一点吗？',
    extra: { chatUserId: 6, productId: 1 },
    isRead: false, createdAt: '2024-06-15T16:20:00Z',
  },
  {
    id: 8, userId: 1, type: 'review',
    title: '收到新评价',
    content: '恭喜！「汤圆麻麻」给您的交易给出了5星好评："人超级好，商品也和描述一致，下次还会来！"',
    summary: '「汤圆麻麻」给了你5星好评',
    extra: { orderId: 'DD20240610005' },
    isRead: true, createdAt: '2024-06-12T14:00:00Z',
  },
  {
    id: 9, userId: 1, type: 'system',
    title: '升级提醒',
    content: '恭喜您的信用等级提升至 Lv.5！解锁特权：商品优先推荐、搜索排名靠前、交易免佣金。继续保持优质交易~',
    summary: '🎉 信用等级提升至 Lv.5，解锁新特权',
    isRead: true, createdAt: '2024-06-10T09:00:00Z',
  },
  {
    id: 10, userId: 1, type: 'answer',
    title: '收到新围观',
    content: '您的问题又有 12 位宝妈付费围观，累计围观收入 ¥17.40 已存入您的钱包，可随时提现。',
    summary: '+12人围观，累计收入¥17.40',
    extra: { questionId: 1, income: 17.40 },
    isRead: true, createdAt: '2024-06-16T07:00:00Z',
  },
]

const typeKeyMap: Record<string, string> = {
  order: 'order', system: 'system', trade: 'order', comment: 'comment',
  like: 'like', answer: 'answer', follow: 'chat', review: 'order',
}

const filteredNotifications = computed(() => {
  if (activeCategory.value === 'all') return notifications.value
  return notifications.value.filter(n => {
    const mappedType = typeKeyMap[n.type] || n.type
    return mappedType === activeCategory.value ||
      (activeCategory.value === 'trade' && ['order', 'review'].includes(n.type)) ||
      (activeCategory.value === 'chat' && ['follow', 'chat'].includes(n.type))
  })
})

const unreadCountByCategory = computed(() => {
  const counts: Record<string, number> = { all: 0 }
  for (const n of notifications.value) {
    if (n.isRead) continue
    counts.all++
    const type = typeKeyMap[n.type] || n.type
    counts[type] = (counts[type] || 0) + 1
    if (['order', 'review'].includes(n.type)) counts.trade = (counts.trade || 0) + 1
    if (['follow', 'chat'].includes(n.type)) counts.chat = (counts.chat || 0) + 1
  }
  return counts
})

const totalUnread = computed(() => notifications.value.filter(n => !n.isRead).length)

const catConfig = (type: string) => {
  const mappedType = typeKeyMap[type] || type
  return categories.find(c => c.key === mappedType) ||
    categories.find(c => c.key === (['order', 'review'].includes(type) ? 'trade' : 'chat')) ||
    categories[0]
}

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getNotificationList({ page: 1, pageSize: 50 })
    notifications.value = (res.list && res.list.length ? res.list : mockNotifications) as any
  } catch {
    notifications.value = mockNotifications as any
  } finally {
    loading.value = false
  }
}

const toggleExpand = async (n: Notification) => {
  expandedId.value = expandedId.value === n.id ? null : n.id
  if (!n.isRead) {
    try {
      await markNotificationRead(n.id)
      n.isRead = true
      appStore.fetchUnreadCount()
    } catch {
      n.isRead = true
    }
  }
}

const handleAction = (n: any, e: Event) => {
  e.stopPropagation()
  const extra = n.extra || {}
  if (n.type === 'answer' || extra.questionId) {
    router.push(`/qa/${extra.questionId || 1}`)
  } else if (extra.postId) {
    router.push(`/community/${extra.postId}`)
  } else if (extra.productId) {
    router.push(`/market/${extra.productId}`)
  } else if (extra.orderId) {
    router.push('/orders')
  } else if (extra.chatUserId) {
    message.info('聊天功能开发中')
  } else {
    message.info('查看详情')
  }
}

const handleMarkAll = async () => {
  try {
    await readAllNotifications()
    notifications.value.forEach(n => n.isRead = true)
    appStore.fetchUnreadCount()
    message.success('已全部标记为已读')
  } catch {
    notifications.value.forEach(n => n.isRead = true)
    message.success('演示模式：已全部标记为已读')
  }
}

const handleClearRead = () => {
  notifications.value = notifications.value.filter(n => !n.isRead)
  message.success('已清空已读消息')
}

onMounted(fetchData)
</script>

<template>
  <div class="min-h-screen bg-cream-50 py-8">
    <div class="container max-w-6xl">
      <div class="flex flex-col lg:flex-row gap-6">
        <div class="lg:w-64 flex-shrink-0">
          <div class="card p-4 sticky top-4">
            <div class="flex items-center justify-between mb-5 px-2">
              <h1 class="text-heading-3 text-ink-900 font-bold">消息中心</h1>
              <div v-if="totalUnread > 0" class="px-2 h-5 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center">
                {{ totalUnread }}
              </div>
            </div>

            <div class="space-y-1">
              <button
                v-for="cat in categories"
                :key="cat.key"
                @click="activeCategory = cat.key"
                :class="[
                  'w-full flex items-center gap-3 h-11 px-3 rounded-xl transition-all duration-200',
                  activeCategory === cat.key
                    ? 'bg-gradient-primary text-white shadow-sm'
                    : 'text-ink-600 hover:bg-ink-50'
                ]"
              >
                <div :class="[
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                  activeCategory === cat.key ? 'bg-white/20' : 'bg-ink-50'
                ]">
                  <component :is="cat.icon" :class="['w-4 h-4', activeCategory === cat.key ? 'text-white' : cat.color]" />
                </div>
                <span class="font-medium text-sm flex-1 text-left">{{ cat.label }}</span>
                <span v-if="unreadCountByCategory[cat.key] > 0" :class="[
                  'h-5 min-w-[20px] px-1.5 rounded-full text-xs font-bold flex items-center justify-center',
                  activeCategory === cat.key ? 'bg-white text-primary-500' : 'bg-primary-500 text-white'
                ]">
                  {{ unreadCountByCategory[cat.key] }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <div class="card p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-heading-4 text-ink-900 font-bold">
                {{ categories.find(c => c.key === activeCategory)?.label }}
              </h2>
              <p class="text-caption text-ink-400">
                共 {{ filteredNotifications.length }} 条消息，{{ filteredNotifications.filter(n => !n.isRead).length }} 条未读
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="handleMarkAll"
                class="btn-ghost h-9 px-4 text-sm"
                :disabled="totalUnread === 0"
              >
                <CheckCheck class="w-4 h-4" />
                全部已读
              </button>
              <button
                @click="handleClearRead"
                class="btn-ghost h-9 px-4 text-sm text-ink-500 hover:text-red-500"
              >
                <Trash2 class="w-4 h-4" />
                清空已读
              </button>
            </div>
          </div>

          <n-skeleton v-if="loading" :rows="8" />

          <div v-else class="space-y-3 stagger">
            <div
              v-for="n in filteredNotifications"
              :key="n.id"
              :class="[
                'card overflow-hidden transition-all duration-200 cursor-pointer',
                expandedId === n.id ? 'ring-2 ring-lavender-200' : 'hover:shadow-card-hover',
                !n.isRead && 'bg-primary-50/30'
              ]"
              @click="toggleExpand(n)"
            >
              <div class="p-5">
                <div class="flex items-start gap-4">
                  <div :class="[
                    'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
                    catConfig(n.type).key === 'all' ? 'bg-ink-50' : `${catConfig(n.type).color.replace('text-', 'bg-').replace('-500', '-50').replace('-700', '-50')}`
                  ]">
                    <component
                      :is="catConfig(n.type).icon"
                      :class="['w-5 h-5', catConfig(n.type).color]"
                    />
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-3 mb-1.5">
                      <div class="flex items-center gap-2 min-w-0">
                        <h3 :class="['text-heading-4 truncate', !n.isRead ? 'text-ink-900 font-bold' : 'text-ink-700 font-medium']">
                          {{ n.title }}
                        </h3>
                        <span
                          v-if="!n.isRead"
                          class="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 animate-pulse"
                        />
                      </div>
                      <div class="flex items-center gap-2 flex-shrink-0">
                        <span class="text-caption text-ink-400 whitespace-nowrap">{{ formatTime(n.createdAt) }}</span>
                        <ChevronRight :class="[
                          'w-4 h-4 text-ink-300 transition-transform duration-200 flex-shrink-0',
                          expandedId === n.id && 'rotate-90'
                        ]" />
                      </div>
                    </div>

                    <p class="text-body text-ink-500 line-clamp-1">
                      {{ (n as any).summary || n.content }}
                    </p>
                  </div>
                </div>

                <div v-if="expandedId === n.id" class="mt-4 pt-4 border-t border-ink-100 animate-fade-in">
                  <p class="text-body text-ink-700 leading-7 mb-4 whitespace-pre-line">{{ n.content }}</p>

                  <div v-if="n.extra" class="flex flex-wrap gap-2">
                    <template v-if="(n as any).extra?.questionId">
                      <button
                        class="btn-lavender h-9 px-4 text-sm"
                        @click="handleAction(n, $event)"
                      >
                        <Lightbulb class="w-4 h-4" /> 查看回答
                      </button>
                    </template>
                    <template v-else-if="(n as any).extra?.postId">
                      <button
                        class="btn-primary h-9 px-4 text-sm"
                        @click="handleAction(n, $event)"
                      >
                        <MessageCircle class="w-4 h-4" /> 查看帖子
                      </button>
                    </template>
                    <template v-else-if="(n as any).extra?.productId">
                      <button
                        class="btn-primary h-9 px-4 text-sm"
                        @click="handleAction(n, $event)"
                      >
                        <Package class="w-4 h-4" /> 查看商品
                      </button>
                    </template>
                    <template v-else-if="(n as any).extra?.orderId">
                      <button
                        class="btn-lavender h-9 px-4 text-sm"
                        @click="handleAction(n, $event)"
                      >
                        <ClipboardList class="w-4 h-4" /> 查看订单
                      </button>
                    </template>
                    <template v-else-if="(n as any).extra?.chatUserId">
                      <button
                        class="btn-mint h-9 px-4 text-sm"
                        @click="handleAction(n, $event)"
                      >
                        <Handshake class="w-4 h-4" /> 回复消息
                      </button>
                    </template>
                    <template v-else-if="n.type === 'system'">
                      <button
                        class="btn-secondary h-9 px-4 text-sm"
                        @click="handleAction(n, $event)"
                      >
                        <HelpCircle class="w-4 h-4" /> 查看详情
                      </button>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <n-empty
              v-if="!loading && filteredNotifications.length === 0"
              description="暂无消息"
              class="py-16"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
