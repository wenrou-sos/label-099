import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HomePage.vue'),
    meta: { title: '首页', requireAuth: false },
  },
  {
    path: '/community',
    name: 'community',
    component: () => import('@/pages/community/CommunityList.vue'),
    meta: { title: '社区', requireAuth: false },
  },
  {
    path: '/community/:id',
    name: 'community-detail',
    component: () => import('@/pages/community/CommunityDetail.vue'),
    meta: { title: '帖子详情', requireAuth: false },
  },
  {
    path: '/community/post',
    name: 'community-post',
    component: () => import('@/pages/community/CommunityPost.vue'),
    meta: { title: '发布帖子', requireAuth: true },
  },
  {
    path: '/market',
    name: 'market',
    component: () => import('@/pages/market/MarketList.vue'),
    meta: { title: '闲置市场', requireAuth: false },
  },
  {
    path: '/market/:id',
    name: 'market-detail',
    component: () => import('@/pages/market/MarketDetail.vue'),
    meta: { title: '商品详情', requireAuth: false },
  },
  {
    path: '/market/publish',
    name: 'market-publish',
    component: () => import('@/pages/market/MarketPublish.vue'),
    meta: { title: '发布商品', requireAuth: true },
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('@/pages/order/OrderList.vue'),
    meta: { title: '我的订单', requireAuth: true },
  },
  {
    path: '/orders/:id',
    name: 'order-detail',
    component: () => import('@/pages/order/OrderDetail.vue'),
    meta: { title: '订单详情', requireAuth: true },
  },
  {
    path: '/qa',
    name: 'qa',
    component: () => import('@/pages/qa/QaList.vue'),
    meta: { title: '问答', requireAuth: false },
  },
  {
    path: '/qa/:id',
    name: 'qa-detail',
    component: () => import('@/pages/qa/QaDetail.vue'),
    meta: { title: '问题详情', requireAuth: false },
  },
  {
    path: '/qa/ask',
    name: 'qa-ask',
    component: () => import('@/pages/qa/QaAsk.vue'),
    meta: { title: '提问', requireAuth: true },
  },
  {
    path: '/experts',
    name: 'experts',
    component: () => import('@/pages/qa/ExpertList.vue'),
    meta: { title: '专家列表', requireAuth: false },
  },
  {
    path: '/messages',
    name: 'messages',
    component: () => import('@/pages/MessageList.vue'),
    meta: { title: '消息通知', requireAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/pages/profile/ProfileIndex.vue'),
    meta: { title: '个人中心', requireAuth: true },
  },
  {
    path: '/profile/posts',
    name: 'profile-posts',
    component: () => import('@/pages/profile/ProfilePosts.vue'),
    meta: { title: '我的帖子', requireAuth: true },
  },
  {
    path: '/profile/products',
    name: 'profile-products',
    component: () => import('@/pages/profile/ProfileProducts.vue'),
    meta: { title: '我的商品', requireAuth: true },
  },
  {
    path: '/profile/reviews',
    name: 'profile-reviews',
    component: () => import('@/pages/profile/ProfileReviews.vue'),
    meta: { title: '我的评价', requireAuth: true },
  },
  {
    path: '/profile/settings',
    name: 'profile-settings',
    component: () => import('@/pages/profile/ProfileSettings.vue'),
    meta: { title: '账号设置', requireAuth: true },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/Login.vue'),
    meta: { title: '登录', requireAuth: false },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  userStore.initFromStorage()

  document.title = `${to.meta.title || '母婴社区平台'} - 母婴社区`

  if (to.meta.requireAuth && !userStore.isLoggedIn) {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  } else {
    if ((to.path === '/login') && userStore.isLoggedIn) {
      next('/')
    } else {
      next()
    }
  }
})

export default router
