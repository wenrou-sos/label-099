<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Star, MessageCircle, Eye, Check, SlidersHorizontal } from 'lucide-vue-next'
import { getExpertList } from '@/api/qa'
import type { Expert, ListResponse } from '@shared/types'

const loading = ref(true)
const experts = ref<Expert[]>([])
const keyword = ref('')
const activeCategory = ref('全部')
const activeSort = ref('rating')

const categories = ['全部', '儿科', '妇产科', '早教', '营养', '心理']
const sortOptions = [
  { label: '评分', value: 'rating' },
  { label: '回答数', value: 'answers' },
  { label: '价格', value: 'price' },
]

const mockExperts: Expert[] = [
  {
    id: 1,
    username: 'dr_zhang',
    phone: '13800000001',
    nickname: '张医生',
    avatar: '',
    specialty: '儿科',
    licenseNumber: '110110199001010001',
    experienceYears: 12,
    verifiedAt: '2024-01-15',
    rating: 4.9,
    reviewCount: 156,
    creditScore: 980,
    isExpert: true,
    isTrusted: true,
    bio: '北京儿童医院儿科主治医师，擅长新生儿护理、婴儿喂养及常见儿科疾病诊治。从业12年，累计服务家庭超过5000户。',
    createdAt: '2024-01-01',
    updatedAt: '2024-06-01',
  } as any,
  {
    id: 2,
    username: 'dr_li',
    phone: '13800000002',
    nickname: '李主任',
    avatar: '',
    specialty: '妇产科',
    licenseNumber: '110110198505050002',
    experienceYears: 18,
    verifiedAt: '2023-08-20',
    rating: 4.8,
    reviewCount: 289,
    creditScore: 990,
    isExpert: true,
    isTrusted: true,
    bio: '三甲医院妇产科主任医师，专注产后康复、母婴护理及孕期营养指导。帮助数千位妈妈顺利度过孕产期。',
    createdAt: '2023-06-15',
    updatedAt: '2024-05-20',
  } as any,
  {
    id: 3,
    username: 'dr_wang',
    phone: '13800000003',
    nickname: '王老师',
    avatar: '',
    specialty: '早教',
    licenseNumber: '110110199203030003',
    experienceYears: 8,
    verifiedAt: '2024-03-10',
    rating: 4.9,
    reviewCount: 98,
    creditScore: 970,
    isExpert: true,
    isTrusted: true,
    bio: '国际认证早教专家，专注0-6岁儿童早期教育发展，擅长亲子互动游戏设计和发育评估。',
    createdAt: '2024-02-01',
    updatedAt: '2024-06-10',
  } as any,
  {
    id: 4,
    username: 'dr_chen',
    phone: '13800000004',
    nickname: '陈营养师',
    avatar: '',
    specialty: '营养',
    licenseNumber: '110110198808080004',
    experienceYears: 10,
    verifiedAt: '2023-11-05',
    rating: 4.7,
    reviewCount: 176,
    creditScore: 960,
    isExpert: true,
    isTrusted: true,
    bio: '注册营养师，专注婴幼儿辅食添加、孕期营养管理、挑食偏食调理，科学喂养倡导者。',
    createdAt: '2023-09-01',
    updatedAt: '2024-04-15',
  } as any,
  {
    id: 5,
    username: 'dr_zhao',
    phone: '13800000005',
    nickname: '赵心理师',
    avatar: '',
    specialty: '心理',
    licenseNumber: '110110199111110005',
    experienceYears: 9,
    verifiedAt: '2024-02-28',
    rating: 4.9,
    reviewCount: 134,
    creditScore: 975,
    isExpert: true,
    isTrusted: true,
    bio: '临床心理咨询师，专注产后抑郁干预、亲子关系沟通、家庭关系调解，温暖陪伴每一位妈妈。',
    createdAt: '2024-01-20',
    updatedAt: '2024-06-05',
  } as any,
  {
    id: 6,
    username: 'dr_sun',
    phone: '13800000006',
    nickname: '孙医生',
    avatar: '',
    specialty: '儿科',
    licenseNumber: '110110198707070006',
    experienceYears: 15,
    verifiedAt: '2023-07-12',
    rating: 4.8,
    reviewCount: 245,
    creditScore: 985,
    isExpert: true,
    isTrusted: true,
    bio: '儿科副主任医师，专注儿童呼吸系统疾病、过敏性疾病、生长发育评估，经验丰富。',
    createdAt: '2023-05-01',
    updatedAt: '2024-05-30',
  } as any,
]

const tagsMap: Record<string, string[]> = {
  '张医生': ['新生儿护理', '婴儿喂养', '发烧护理'],
  '李主任': ['产后康复', '孕期营养', '母乳喂养'],
  '王老师': ['早教启蒙', '亲子互动', '发育评估'],
  '陈营养师': ['辅食添加', '营养搭配', '挑食调理'],
  '赵心理师': ['产后心理', '亲子沟通', '情绪疏导'],
  '孙医生': ['感冒咳嗽', '过敏护理', '生长发育'],
}

const priceMap: Record<string, number> = {
  '张医生': 39,
  '李主任': 59,
  '王老师': 29,
  '陈营养师': 39,
  '赵心理师': 49,
  '孙医生': 49,
}

const avatarColors = [
  'from-pink-400 to-rose-500',
  'from-purple-400 to-indigo-500',
  'from-blue-400 to-cyan-500',
  'from-green-400 to-emerald-500',
  'from-amber-400 to-orange-500',
  'from-fuchsia-400 to-pink-500',
]

const filteredExperts = computed(() => {
  let result = [...experts.value]
  if (activeCategory.value !== '全部') {
    result = result.filter(e => e.specialty === activeCategory.value)
  }
  if (keyword.value.trim()) {
    const kw = keyword.value.toLowerCase()
    result = result.filter(e =>
      (e.nickname || '').toLowerCase().includes(kw) ||
      e.specialty.toLowerCase().includes(kw)
    )
  }
  if (activeSort.value === 'rating') {
    result.sort((a, b) => b.rating - a.rating)
  } else if (activeSort.value === 'answers') {
    result.sort((a, b) => b.reviewCount - a.reviewCount)
  } else if (activeSort.value === 'price') {
    result.sort((a, b) => (priceMap[a.nickname || ''] || 0) - (priceMap[b.nickname || ''] || 0))
  }
  return result
})

const fetchExperts = async () => {
  loading.value = true
  try {
    const params = {
      page: 1,
      pageSize: 20,
      keyword: keyword.value || undefined,
      specialty: activeCategory.value !== '全部' ? activeCategory.value : undefined,
    }
    const res = await getExpertList(params)
    experts.value = res.list.length > 0 ? res.list : mockExperts
  } catch {
    experts.value = mockExperts
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchExperts()
})
</script>

<template>
  <div class="min-h-screen bg-cream-50 py-8">
    <div class="container">
      <div class="mb-8 text-center animate-fade-in-up">
        <h1 class="text-heading-1 text-ink-900 mb-3">在线育儿专家</h1>
        <p class="text-body text-ink-500 max-w-2xl mx-auto">
          汇聚三甲医院认证医师、营养师、早教专家，为您提供专业的一对一育儿咨询服务
        </p>
      </div>

      <div class="card p-5 mb-6 animate-fade-in-up">
        <div class="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          <div class="relative flex-1">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-300" />
            <input
              v-model="keyword"
              type="text"
              placeholder="搜索专家姓名 / 医院 / 擅长领域"
              class="input-base pl-12"
              @keyup.enter="fetchExperts"
            />
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="cat in categories"
              :key="cat"
              @click="activeCategory = cat"
              :class="[
                'h-10 px-4 rounded-xl font-medium transition-all duration-200',
                activeCategory === cat
                  ? 'bg-gradient-lavender text-white shadow-md'
                  : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
              ]"
            >
              {{ cat }}
            </button>
          </div>
          <div class="flex items-center gap-2">
            <SlidersHorizontal class="w-4 h-4 text-ink-500" />
            <n-select
              v-model:value="activeSort"
              :options="sortOptions"
              size="large"
              style="width: 130px"
            />
          </div>
        </div>
      </div>

      <n-skeleton v-if="loading" :rows="8" />

      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 stagger">
        <div
          v-for="(expert, idx) in filteredExperts"
          :key="expert.id"
          class="card-hover p-6 relative overflow-hidden"
        >
          <div class="flex gap-5">
            <div class="relative flex-shrink-0">
              <div
                :class="[
                  'w-[120px] h-[120px] rounded-full flex items-center justify-center text-white text-3xl font-bold bg-gradient-to-br',
                  avatarColors[idx % avatarColors.length]
                ]"
              >
                {{ expert.nickname?.charAt(0) }}
              </div>
              <div class="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-lavender flex items-center justify-center shadow-lg border-2 border-white">
                <Check class="w-4 h-4 text-white" />
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="mb-2">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="text-heading-4 text-ink-900 font-bold">{{ expert.nickname }}</h3>
                  <span class="trusted-badge">认证</span>
                </div>
                <div class="text-caption text-ink-500 mb-1">
                  {{ expert.specialty }} · 从业{{ expert.experienceYears }}年
                </div>
                <div class="text-caption text-ink-400 truncate">
                  北京三甲医院 · 主治医师
                </div>
              </div>

              <div class="flex flex-wrap gap-1.5 mb-3">
                <span
                  v-for="tag in (tagsMap[expert.nickname || ''] || []).slice(0, 3)"
                  :key="tag"
                  class="chip-lavender"
                >
                  {{ tag }}
                </span>
              </div>

              <p class="text-caption text-ink-500 line-clamp-2 mb-4">
                {{ expert.bio }}
              </p>
            </div>
          </div>

          <div class="flex items-center justify-between py-3 border-t border-ink-50 mb-4">
            <div class="flex items-center gap-1">
              <Star class="w-4 h-4 text-amber-400 fill-amber-400" />
              <span class="font-bold text-ink-900">{{ expert.rating }}</span>
            </div>
            <div class="flex items-center gap-1 text-ink-500 text-caption">
              <MessageCircle class="w-3.5 h-3.5" />
              <span>回答 {{ expert.reviewCount }}</span>
            </div>
            <div class="flex items-center gap-1 text-ink-500 text-caption">
              <Eye class="w-3.5 h-3.5" />
              <span>围观 {{ (expert.reviewCount * 80) }}k</span>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <span class="text-caption text-ink-400">咨询费</span>
              <span class="text-primary-500 font-bold text-xl ml-2">¥{{ priceMap[expert.nickname || ''] || 39 }}</span>
              <span class="text-caption text-ink-400">/次</span>
              <span class="text-caption text-lavender-700 ml-3">围观 ¥2.9/人</span>
            </div>
            <button class="btn-primary h-10 px-5 text-sm">
              立即咨询
            </button>
          </div>
        </div>
      </div>

      <n-empty v-if="!loading && filteredExperts.length === 0" description="暂无符合条件的专家" />
    </div>
  </div>
</template>
