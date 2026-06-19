<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import {
  Home, ChevronRight, User as UserIcon, Phone, Mail, Lock,
  Shield, Bell, MapPin, LogOut, Save, Camera
} from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import type { User } from '@shared/types'

const router = useRouter()
const userStore = useUserStore()
const message = useMessage()

const saving = ref(false)
const user = ref<User | null>(null)

const nickname = ref('')
const bio = ref('')
const phone = ref('')
const email = ref('')
const location = ref('北京市')

const notifyLike = ref(true)
const notifyComment = ref(true)
const notifyOrder = ref(true)
const notifyAnswer = ref(true)
const notifySystem = ref(false)

onMounted(() => {
  user.value = userStore.userInfo
  if (user.value) {
    nickname.value = user.value.nickname || ''
    bio.value = user.value.bio || ''
    phone.value = user.value.phone || ''
    email.value = (user.value as any).email || ''
  }
})

const handleSave = async () => {
  saving.value = true
  try {
    await new Promise(r => setTimeout(r, 600))
    message.success('保存成功')
    if (user.value) {
      userStore.setUserInfo({
        ...user.value,
        nickname: nickname.value,
        bio: bio.value,
        phone: phone.value,
      })
    }
  } catch (err: any) {
    message.error(err?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const handleLogout = () => {
  userStore.logout()
  message.success('已退出登录')
  setTimeout(() => router.push('/login'), 300)
}
</script>

<template>
  <div class="min-h-screen bg-cream-50 py-8">
    <div class="container max-w-4xl">
      <nav class="flex items-center gap-2 text-caption text-ink-500 mb-6">
        <Home class="w-4 h-4" />
        <span>首页</span>
        <ChevronRight class="w-4 h-4" />
        <span @click="router.push('/profile')" class="cursor-pointer hover:text-primary-500">个人中心</span>
        <ChevronRight class="w-4 h-4" />
        <span class="text-ink-900 font-medium">账号设置</span>
      </nav>

      <h1 class="text-heading-2 text-ink-900 font-bold mb-8">账号设置</h1>

      <div class="space-y-6">
        <div class="card p-6">
          <h3 class="text-heading-4 text-ink-900 font-bold mb-5 flex items-center gap-2">
            <UserIcon class="w-5 h-5 text-primary-500" />
            基本信息
          </h3>
          <div class="flex items-start gap-6 mb-6">
            <div class="relative">
              <div class="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center text-white text-3xl font-bold">
                {{ user?.nickname?.charAt(0) || 'U' }}
              </div>
              <button class="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-ink-600 hover:text-primary-500 transition-colors">
                <Camera class="w-4 h-4" />
              </button>
            </div>
            <div class="text-caption text-ink-500">
              支持 JPG/PNG 格式，建议 200×200 像素
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-caption text-ink-600 mb-2 font-medium">昵称</label>
              <input v-model="nickname" type="text" class="input-base w-full" placeholder="请输入昵称" />
            </div>
            <div>
              <label class="block text-caption text-ink-600 mb-2 font-medium">
                <Phone class="w-3.5 h-3.5 inline mr-1" />手机号
              </label>
              <input v-model="phone" type="tel" class="input-base w-full" placeholder="请输入手机号" />
            </div>
            <div>
              <label class="block text-caption text-ink-600 mb-2 font-medium">
                <Mail class="w-3.5 h-3.5 inline mr-1" />邮箱
              </label>
              <input v-model="email" type="email" class="input-base w-full" placeholder="请输入邮箱" />
            </div>
            <div>
              <label class="block text-caption text-ink-600 mb-2 font-medium">
                <MapPin class="w-3.5 h-3.5 inline mr-1" />所在城市
              </label>
              <input v-model="location" type="text" class="input-base w-full" placeholder="请选择所在城市" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-caption text-ink-600 mb-2 font-medium">个人简介</label>
              <textarea v-model="bio" rows="3" class="input-base w-full resize-none" placeholder="介绍一下自己吧~"></textarea>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <h3 class="text-heading-4 text-ink-900 font-bold mb-5 flex items-center gap-2">
            <Bell class="w-5 h-5 text-lavender-500" />
            消息通知
          </h3>
          <div class="space-y-3">
            <label class="flex items-center justify-between p-3 rounded-xl hover:bg-cream-50 cursor-pointer">
              <span class="text-body text-ink-700">点赞通知</span>
              <input type="checkbox" v-model="notifyLike" class="w-5 h-5 accent-primary-500" />
            </label>
            <label class="flex items-center justify-between p-3 rounded-xl hover:bg-cream-50 cursor-pointer">
              <span class="text-body text-ink-700">评论通知</span>
              <input type="checkbox" v-model="notifyComment" class="w-5 h-5 accent-primary-500" />
            </label>
            <label class="flex items-center justify-between p-3 rounded-xl hover:bg-cream-50 cursor-pointer">
              <span class="text-body text-ink-700">订单状态通知</span>
              <input type="checkbox" v-model="notifyOrder" class="w-5 h-5 accent-primary-500" />
            </label>
            <label class="flex items-center justify-between p-3 rounded-xl hover:bg-cream-50 cursor-pointer">
              <span class="text-body text-ink-700">问答回复通知</span>
              <input type="checkbox" v-model="notifyAnswer" class="w-5 h-5 accent-primary-500" />
            </label>
            <label class="flex items-center justify-between p-3 rounded-xl hover:bg-cream-50 cursor-pointer">
              <span class="text-body text-ink-700">系统公告</span>
              <input type="checkbox" v-model="notifySystem" class="w-5 h-5 accent-primary-500" />
            </label>
          </div>
        </div>

        <div class="card p-6">
          <h3 class="text-heading-4 text-ink-900 font-bold mb-5 flex items-center gap-2">
            <Shield class="w-5 h-5 text-mint-500" />
            账号安全
          </h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 rounded-xl hover:bg-cream-50 cursor-pointer">
              <div class="flex items-center gap-3">
                <Lock class="w-5 h-5 text-ink-400" />
                <div>
                  <div class="text-body text-ink-700 font-medium">修改密码</div>
                  <div class="text-caption text-ink-500">定期更换密码，保护账号安全</div>
                </div>
              </div>
              <ChevronRight class="w-5 h-5 text-ink-300" />
            </div>
            <div class="flex items-center justify-between p-3 rounded-xl hover:bg-cream-50 cursor-pointer">
              <div class="flex items-center gap-3">
                <Phone class="w-5 h-5 text-ink-400" />
                <div>
                  <div class="text-body text-ink-700 font-medium">绑定手机</div>
                  <div class="text-caption text-ink-500">已绑定 {{ phone || '—' }}</div>
                </div>
              </div>
              <ChevronRight class="w-5 h-5 text-ink-300" />
            </div>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <button @click="handleSave" :disabled="saving" class="btn-primary px-8">
            <Save v-if="!saving" class="w-4 h-4 inline mr-1.5" />
            {{ saving ? '保存中...' : '保存修改' }}
          </button>
          <button @click="router.push('/profile')" class="px-8 py-2.5 rounded-xl text-body font-medium text-ink-600 hover:bg-ink-50 transition-colors">
            取消
          </button>
          <button @click="handleLogout" class="ml-auto px-5 py-2.5 rounded-xl text-body font-medium text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1.5">
            <LogOut class="w-4 h-4" />
            退出登录
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
