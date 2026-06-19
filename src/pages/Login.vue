<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMessage } from 'naive-ui'
import { Eye, EyeOff, Phone, Lock, User, Sparkles, ShieldCheck, Heart, ShoppingBag, RefreshCw } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import { sendSms } from '@/api/auth'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const userStore = useUserStore()

const mode = ref<'login' | 'register'>('login')
const loginType = ref<'sms' | 'password'>('sms')
const submitting = ref(false)

const phone = ref('')
const smsCode = ref('')
const password = ref('')
const confirmPassword = ref('')
const nickname = ref('')
const babyAge = ref<number | null>(null)
const agreeTerms = ref(false)
const showPassword = ref(false)
const showConfirmPwd = ref(false)
const smsCountdown = ref(0)

const babyAges = [
  { value: 0, label: '备孕期' },
  { value: 1, label: '0-6个月' },
  { value: 2, label: '6-12个月' },
  { value: 3, label: '1-2岁' },
  { value: 4, label: '2-3岁' },
  { value: 5, label: '3岁以上' },
]

const features = [
  { icon: ShoppingBag, title: '闲置快转', desc: '宝宝用品一键转卖' },
  { icon: Heart, title: '育儿经验', desc: '百万宝妈真诚分享' },
  { icon: Sparkles, title: '专家咨询', desc: '三甲医生在线答疑' },
  { icon: ShieldCheck, title: '安心交易', desc: '平台担保安全无忧' },
]

const phoneValid = computed(() => {
  const v = phone.value.trim()
  if (!v) return false
  if (/^1[3-9]\d{9}$/.test(v)) return true
  return v.length >= 3 && v.length <= 20
})
const canGetSms = computed(() => phoneValid.value && smsCountdown.value === 0)
const canLogin = computed(() => {
  if (!phoneValid.value) return false
  if (!agreeTerms.value) return false
  if (loginType.value === 'sms') return smsCode.value.length === 6
  return password.value.length >= 6
})
const canRegister = computed(() => {
  return phoneValid.value &&
    smsCode.value.length === 6 &&
    password.value.length >= 6 &&
    confirmPassword.value === password.value &&
    nickname.value.trim().length >= 2 &&
    agreeTerms.value
})

const autoNickname = () => {
  const words = ['幸福', '开心', '可爱', '阳光', '暖心', '甜甜', '快乐', '温馨']
  const suffix = ['小宝妈', '的妈妈', '麻麻', '妈妈', '妈咪']
  const w = words[Math.floor(Math.random() * words.length)]
  const s = suffix[Math.floor(Math.random() * suffix.length)]
  nickname.value = `${w}${s}${Math.floor(Math.random() * 1000)}`
}

const startCountdown = () => {
  smsCountdown.value = 60
  const timer = setInterval(() => {
    smsCountdown.value--
    if (smsCountdown.value <= 0) clearInterval(timer)
  }, 1000)
}

const getCode = async () => {
  if (!canGetSms.value) return
  try {
    await sendSms(phone.value)
    startCountdown()
    message.success('验证码已发送')
  } catch {
    startCountdown()
    message.success('演示模式：验证码 123456')
  }
}

const handleLogin = async () => {
  if (!canLogin.value || submitting.value) return
  submitting.value = true
  try {
    const params: any = { phone: phone.value }
    if (loginType.value === 'sms') params.smsCode = smsCode.value
    else params.password = password.value
    await userStore.login(params)
    message.success('登录成功！')
    const redirect = (route.query.redirect as string) || '/'
    setTimeout(() => router.push(redirect), 500)
  } catch (err: any) {
    message.error(err?.message || '登录失败，请检查账号密码')
  } finally {
    submitting.value = false
  }
}

const handleRegister = async () => {
  if (!canRegister.value || submitting.value) return
  submitting.value = true
  try {
    await userStore.register({
      phone: phone.value,
      password: password.value,
      username: nickname.value || phone.value,
      nickname: nickname.value || phone.value,
      smsCode: smsCode.value,
      email: `${phone.value || nickname.value}@momcircle.example`,
    } as any)
    message.success('注册成功！欢迎加入~')
    setTimeout(() => router.push('/'), 500)
  } catch (err: any) {
    message.error(err?.message || '注册失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (mode.value === 'register' && !nickname.value) autoNickname()
})
</script>

<template>
  <div class="min-h-screen flex flex-col lg:flex-row">
    <div class="lg:w-2/5 relative overflow-hidden bg-gradient-hero p-8 lg:p-12 flex flex-col justify-between">
      <div class="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-white/10 animate-float" />
      <div class="absolute top-1/3 -right-20 w-60 h-60 rounded-full bg-white/5" />
      <div class="absolute -bottom-24 left-1/4 w-56 h-56 rounded-full bg-white/10" />

      <div class="relative z-10 text-white">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
            💕
          </div>
          <div>
            <div class="text-2xl font-bold">宝妈圈</div>
            <div class="text-white/70 text-sm">Mom's Circle</div>
          </div>
        </div>
      </div>

      <div class="relative z-10 text-white hidden lg:block">
        <h2 class="text-4xl font-bold mb-4 leading-tight">
          温暖的<br />宝妈互助圈
        </h2>
        <p class="text-white/80 text-lg mb-10">
          与百万宝妈一起，分享育儿路上的喜怒哀乐
        </p>

        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="feat in features"
            :key="feat.title"
            class="p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/10 hover:bg-white/15 transition-all duration-200"
          >
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <component :is="feat.icon" class="w-5 h-5" />
            </div>
            <h3 class="font-bold mb-1">{{ feat.title }}</h3>
            <p class="text-white/70 text-sm">{{ feat.desc }}</p>
          </div>
        </div>
      </div>

      <div class="relative z-10 text-white/60 text-sm hidden lg:flex items-center gap-2">
        <ShieldCheck class="w-4 h-4" />
        <span>您的数据已通过银行级加密保护</span>
      </div>
    </div>

    <div class="flex-1 bg-cream-50 flex items-center justify-center p-6 lg:p-12">
      <div class="w-full max-w-md">
        <div class="lg:hidden text-center mb-8">
          <div class="text-5xl mb-4">💕</div>
          <h2 class="text-3xl font-bold text-ink-900 mb-2">宝妈圈</h2>
          <p class="text-ink-500">温暖的宝妈互助圈</p>
        </div>

        <div class="card p-8 animate-fade-in-up">
          <div class="flex mb-8 p-1.5 bg-ink-50 rounded-xl">
            <button
              @click="mode = 'login'"
              :class="[
                'flex-1 h-10 rounded-lg font-medium transition-all',
                mode === 'login' ? 'bg-white shadow-sm text-primary-500' : 'text-ink-500'
              ]"
            >登录</button>
            <button
              @click="mode = 'register'; !nickname && autoNickname()"
              :class="[
                'flex-1 h-10 rounded-lg font-medium transition-all',
                mode === 'register' ? 'bg-white shadow-sm text-primary-500' : 'text-ink-500'
              ]"
            >注册</button>
          </div>

          <template v-if="mode === 'login'">
            <div v-if="loginType === 'password'" class="mb-4">
              <div class="text-center text-sm mb-2">
                <a class="text-lavender-700 font-medium hover:underline cursor-pointer" @click="router.push('/experts')">
                  我是专家，点击专家登录
                </a>
              </div>
            </div>

            <div class="relative mb-4">
              <Phone class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
              <div class="absolute left-12 top-1/2 -translate-y-1/2 text-ink-700 font-medium select-none">+86</div>
              <div class="absolute left-24 top-1/2 -translate-y-1/2 h-5 w-px bg-ink-200" />
              <input
                v-model="phone"
                type="tel"
                maxlength="11"
                placeholder="请输入手机号"
                class="input-base pl-28"
              />
            </div>

            <div class="flex gap-1 mb-6 p-1 bg-ink-50 rounded-xl">
              <button
                @click="loginType = 'sms'"
                :class="[
                  'flex-1 h-8 rounded-lg text-sm font-medium transition-all',
                  loginType === 'sms' ? 'bg-white shadow-sm text-primary-500' : 'text-ink-500'
                ]"
              >验证码登录</button>
              <button
                @click="loginType = 'password'"
                :class="[
                  'flex-1 h-8 rounded-lg text-sm font-medium transition-all',
                  loginType === 'password' ? 'bg-white shadow-sm text-primary-500' : 'text-ink-500'
                ]"
              >密码登录</button>
            </div>

            <template v-if="loginType === 'sms'">
              <div class="relative mb-4">
                <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                <input
                  v-model="smsCode"
                  type="text"
                  maxlength="6"
                  placeholder="请输入验证码"
                  class="input-base pl-12 pr-32"
                />
                <button
                  @click="getCode"
                  :disabled="!canGetSms"
                  :class="[
                    'absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4 rounded-lg text-sm font-medium transition-all',
                    canGetSms
                      ? 'bg-primary-50 text-primary-500 hover:bg-primary-100'
                      : 'bg-ink-50 text-ink-400 cursor-not-allowed'
                  ]"
                >
                  {{ smsCountdown > 0 ? `${smsCountdown}s 后重试` : '获取验证码' }}
                </button>
              </div>
            </template>

            <template v-else>
              <div class="relative mb-2">
                <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  maxlength="20"
                  placeholder="请输入登录密码"
                  class="input-base pl-12 pr-12"
                />
                <button
                  @click="showPassword = !showPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                >
                  <Eye v-if="!showPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
              <div class="text-right mb-6">
                <a class="text-caption text-primary-500 hover:underline cursor-pointer">忘记密码？</a>
              </div>
            </template>
          </template>

          <template v-else>
            <div class="relative mb-4">
              <Phone class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
              <div class="absolute left-12 top-1/2 -translate-y-1/2 text-ink-700 font-medium select-none">+86</div>
              <div class="absolute left-24 top-1/2 -translate-y-1/2 h-5 w-px bg-ink-200" />
              <input
                v-model="phone"
                type="tel"
                maxlength="11"
                placeholder="请输入手机号"
                class="input-base pl-28"
              />
            </div>

            <div class="relative mb-4">
              <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
              <input
                v-model="smsCode"
                type="text"
                maxlength="6"
                placeholder="请输入验证码"
                class="input-base pl-12 pr-32"
              />
              <button
                @click="getCode"
                :disabled="!canGetSms"
                :class="[
                  'absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4 rounded-lg text-sm font-medium transition-all',
                  canGetSms
                    ? 'bg-primary-50 text-primary-500 hover:bg-primary-100'
                    : 'bg-ink-50 text-ink-400 cursor-not-allowed'
                ]"
              >
                {{ smsCountdown > 0 ? `${smsCountdown}s 后重试` : '获取验证码' }}
              </button>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="relative">
                <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  maxlength="20"
                  placeholder="设置密码"
                  class="input-base pl-12 pr-12"
                />
                <button
                  @click="showPassword = !showPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                >
                  <Eye v-if="!showPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
              <div class="relative">
                <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                <input
                  v-model="confirmPassword"
                  :type="showConfirmPwd ? 'text' : 'password'"
                  maxlength="20"
                  placeholder="确认密码"
                  class="input-base pl-12 pr-12"
                />
                <button
                  @click="showConfirmPwd = !showConfirmPwd"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                >
                  <Eye v-if="!showConfirmPwd" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
            </div>

            <div class="relative mb-4">
              <User class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
              <input
                v-model="nickname"
                type="text"
                maxlength="20"
                placeholder="设置昵称"
                class="input-base pl-12 pr-28"
              />
              <button
                @click="autoNickname"
                class="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 rounded-lg text-xs font-medium bg-lavender-50 text-lavender-700 hover:bg-lavender-100 transition-all flex items-center gap-1"
              >
                <RefreshCw class="w-3.5 h-3.5" /> 推荐
              </button>
            </div>

            <div class="mb-6">
              <label class="block text-caption text-ink-500 mb-2">宝宝月龄（可选）</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="age in babyAges"
                  :key="age.value"
                  @click="babyAge = babyAge === age.value ? null : age.value"
                  :class="[
                    'h-9 px-4 rounded-xl text-sm font-medium transition-all',
                    babyAge === age.value
                      ? 'bg-gradient-primary text-white shadow-sm'
                      : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                  ]"
                >{{ age.label }}</button>
              </div>
            </div>
          </template>

          <div class="flex items-start gap-2 mb-6">
            <n-checkbox v-model:checked="agreeTerms" size="large" />
            <div class="text-caption text-ink-500 leading-5">
              我已阅读并同意
              <a class="text-primary-500 hover:underline cursor-pointer">《用户协议》</a>
              和
              <a class="text-primary-500 hover:underline cursor-pointer">《隐私政策》</a>
            </div>
          </div>

          <button
            v-if="mode === 'login'"
            @click="handleLogin"
            :disabled="!canLogin || submitting"
            class="btn-primary w-full h-12 text-base mb-6"
          >
            <n-spin v-if="submitting" size="small" class="mr-2" />
            登录
          </button>
          <button
            v-else
            @click="handleRegister"
            :disabled="!canRegister || submitting"
            class="btn-primary w-full h-12 text-base mb-6"
          >
            <n-spin v-if="submitting" size="small" class="mr-2" />
            注册并登录
          </button>

          <div class="relative flex items-center gap-4 mb-6">
            <div class="flex-1 h-px bg-ink-100" />
            <span class="text-caption text-ink-400">第三方登录</span>
            <div class="flex-1 h-px bg-ink-100" />
          </div>

          <div class="flex justify-center">
            <button
              class="w-14 h-14 rounded-2xl bg-green-50 hover:bg-green-100 transition-all flex items-center justify-center text-2xl shadow-sm hover:shadow-md"
              @click="message.success('微信登录开发中')"
            >💬</button>
          </div>
        </div>

        <div class="mt-6 text-center text-caption text-ink-400 flex items-center justify-center gap-1">
          <ShieldCheck class="w-3.5 h-3.5" />
          <span>平台已加密保护您的个人信息</span>
        </div>
      </div>
    </div>
  </div>
</template>
