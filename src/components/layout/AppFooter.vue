<script setup lang="ts">
import { Heart } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

const footerLinks = [
  {
    title: '探索',
    items: [
      { label: '首页', path: '/' },
      { label: '社区', path: '/community' },
      { label: '交易', path: '/market' },
      { label: '问答', path: '/qa' },
      { label: '专家', path: '/experts' },
    ],
  },
  {
    title: '关于',
    items: [
      { label: '关于我们', path: '#' },
      { label: '用户协议', path: '#' },
      { label: '隐私政策', path: '#' },
      { label: '联系客服', path: '#' },
    ],
  },
  {
    title: '帮助',
    items: [
      { label: '新手指南', path: '#' },
      { label: '交易须知', path: '#' },
      { label: '常见问题', path: '#' },
      { label: '意见反馈', path: '#' },
    ],
  },
]

function goLink(path: string) {
  if (path !== '#') {
    router.push(path)
  }
}
</script>

<template>
  <footer class="bg-cream-100 border-t border-cream-200 mt-auto">
    <div class="container mx-auto px-4 py-10">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <div
              class="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-primary"
            >
              <Heart class="w-5 h-5 text-white" fill="white" />
            </div>
            <span
              class="text-heading-3 font-bold bg-gradient-to-r from-primary-500 to-lavender-500 bg-clip-text text-transparent"
            >
              宝妈圈
            </span>
          </div>
          <p class="text-body text-ink-500 leading-relaxed">
            千万宝妈信赖的母婴社区平台<br />
            分享育儿经验，交易闲置好物，解答育儿困惑
          </p>
        </div>

        <div
          v-for="group in footerLinks"
          :key="group.title"
          class="space-y-3"
        >
          <h4 class="text-heading-4 text-ink-900 font-semibold">
            {{ group.title }}
          </h4>
          <ul class="space-y-2">
            <li v-for="item in group.items" :key="item.label">
              <button
                class="text-body text-ink-500 hover:text-primary-500 transition-colors text-left"
                @click="goLink(item.path)"
              >
                {{ item.label }}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div
        class="pt-6 border-t border-cream-200 flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <p class="text-caption text-ink-500">
          © 2024 宝妈圈 MamaCircle. All rights reserved.
        </p>
        <div class="flex items-center gap-4">
          <span class="text-caption text-ink-500">
            京ICP备00000000号-1
          </span>
          <span class="text-caption text-ink-500">
            京公网安备00000000000000号
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>
