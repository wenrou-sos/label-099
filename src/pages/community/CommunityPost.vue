<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  NRadioGroup,
  NRadio,
  NButton,
  NInput,
  useMessage,
  NUpload,
  NUploadDragger,
  NImage,
} from 'naive-ui'
import type { UploadFileInfo, UploadCustomRequestOptions } from 'naive-ui'
import {
  ChevronLeft,
  ImagePlus,
  X,
  Send,
  Hash,
} from 'lucide-vue-next'
import { createPost } from '@/api/post'
import type { CreatePostParams } from '../../../shared/types'

const router = useRouter()
const message = useMessage()

const categories = [
  { key: '经验分享', label: '经验分享', emoji: '💬', desc: '育儿路上的心得体会' },
  { key: '辅食制作', label: '辅食制作', emoji: '🥣', desc: '美味辅食做法分享' },
  { key: '睡眠训练', label: '睡眠训练', emoji: '🌙', desc: '宝宝睡眠方法交流' },
  { key: '产后恢复', label: '产后恢复', emoji: '💪', desc: '妈妈身心恢复经验' },
  { key: '其他', label: '其他话题', emoji: '💡', desc: '其他育儿相关话题' },
]

const category = ref('经验分享')
const title = ref('')
const content = ref('')
const tagInput = ref('')
const tags = ref<string[]>([])
const imageList = ref<UploadFileInfo[]>([])
const submitting = ref(false)

const titleCount = computed(() => title.value.length)
const contentCount = computed(() => content.value.length)
const canSubmit = computed(() =>
  title.value.trim().length > 0 &&
  content.value.trim().length > 0 &&
  category.value
)

function handleCategorySelect(key: string) {
  category.value = key
}

function addTag() {
  const tag = tagInput.value.trim().replace(/^#/, '')
  if (!tag) return
  if (tags.value.includes(tag)) {
    message.warning('标签已存在')
    return
  }
  if (tags.value.length >= 5) {
    message.warning('最多添加5个标签')
    return
  }
  tags.value.push(tag)
  tagInput.value = ''
}

function removeTag(tag: string) {
  tags.value = tags.value.filter((t) => t !== tag)
}

function handleTagKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === '，' || e.key === ',') {
    e.preventDefault()
    addTag()
  }
}

function handleImageUpload({ file, onFinish, onError }: UploadCustomRequestOptions) {
  setTimeout(() => {
    onFinish()
    message.success('图片上传成功')
  }, 800)
}

function handleRemoveImage(file: UploadFileInfo) {
  imageList.value = imageList.value.filter((f) => f.id !== file.id)
}

function handleUploadFinish(data: any) {
  imageList.value.push(data.file as UploadFileInfo)
}

async function submitPost() {
  if (!canSubmit.value) {
    if (!title.value.trim()) message.warning('请输入标题')
    else if (!content.value.trim()) message.warning('请输入内容')
    else if (!category.value) message.warning('请选择分类')
    return
  }

  submitting.value = true
  try {
    const params: CreatePostParams = {
      title: title.value.trim(),
      content: content.value.trim(),
      category: category.value,
      tags: tags.value.length > 0 ? tags.value : undefined,
      images: imageList.value.length > 0
        ? imageList.value.map((f) => f.url || `placeholder-${f.id}`)
        : undefined,
    }

    const res = await createPost(params)
    message.success('发布成功！')
    setTimeout(() => {
      router.push(`/community/${res.id}`)
    }, 500)
  } catch (e: any) {
    message.error(e?.message || '发布失败，请重试')
  } finally {
    submitting.value = false
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="container mx-auto px-4 py-6 md:py-8 max-w-3xl">
    <!-- 顶部导航 -->
    <div class="flex items-center gap-4 mb-6 stagger">
      <button
        class="w-10 h-10 rounded-xl flex items-center justify-center
               bg-white card text-ink-600 hover:text-primary-500
               hover:bg-primary-50 transition-all"
        @click="goBack"
      >
        <ChevronLeft class="w-5 h-5" />
      </button>
      <h1 class="text-heading-2 font-bold text-ink-900">发布新帖</h1>
      <div class="flex-1" />
      <button
        class="text-caption text-ink-400 hover:text-ink-600 transition-colors"
        @click="goBack"
      >
        取消
      </button>
    </div>

    <div class="space-y-6 stagger">
      <!-- 分类选择 -->
      <div class="card p-5 md:p-6">
        <h2 class="text-heading-4 font-semibold text-ink-900 mb-4">
          选择分类
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
          <button
            v-for="cat in categories"
            :key="cat.key"
            :class="[
              'p-4 rounded-2xl text-left transition-all border-2',
              category === cat.key
                ? 'border-primary-400 bg-primary-50 shadow-card-hover -translate-y-0.5'
                : 'border-transparent bg-ink-50 hover:border-primary-200 hover:bg-white',
            ]"
            @click="handleCategorySelect(cat.key)"
          >
            <div class="text-3xl mb-2">{{ cat.emoji }}</div>
            <div
              :class="[
                'text-body font-semibold mb-1',
                category === cat.key ? 'text-primary-600' : 'text-ink-900',
              ]"
            >
              {{ cat.label }}
            </div>
            <div class="text-caption text-ink-400 line-clamp-1">
              {{ cat.desc }}
            </div>
          </button>
        </div>
      </div>

      <!-- 标题输入 -->
      <div class="card p-5 md:p-6">
        <h2 class="text-heading-4 font-semibold text-ink-900 mb-4">
          帖子标题
        </h2>
        <div class="relative">
          <input
            v-model="title"
            type="text"
            maxlength="50"
            class="input-base !text-lg !font-medium"
            placeholder="一个吸引人的标题，能让更多人看到你的帖子..."
          />
          <span
            :class="[
              'absolute right-4 top-1/2 -translate-y-1/2 text-caption',
              titleCount >= 45 ? 'text-primary-500' : 'text-ink-300',
            ]"
          >
            {{ titleCount }}/50
          </span>
        </div>
        <p class="text-caption text-ink-400 mt-2">
          💡 好的标题应该简洁明了，包含关键词（如：月龄、问题、经验等）
        </p>
      </div>

      <!-- 内容输入 -->
      <div class="card p-5 md:p-6">
        <h2 class="text-heading-4 font-semibold text-ink-900 mb-4">
          正文内容
        </h2>
        <textarea
          v-model="content"
          maxlength="2000"
          rows="10"
          class="textarea-base"
          placeholder="分享你的育儿经验、心得、困惑...&#10;&#10;小提示：&#10;• 尽量详细描述，方便他人理解&#10;• 可以分点叙述，条理清晰&#10;• 配上图片，内容更生动"
        />
        <div class="flex items-center justify-between mt-3">
          <p class="text-caption text-ink-400">
            支持换行，发布后会自动保留格式
          </p>
          <span
            :class="[
              'text-caption',
              contentCount >= 1800 ? 'text-primary-500' : 'text-ink-300',
            ]"
          >
            {{ contentCount }}/2000
          </span>
        </div>
      </div>

      <!-- 标签 -->
      <div class="card p-5 md:p-6">
        <h2 class="text-heading-4 font-semibold text-ink-900 mb-4">
          添加标签 <span class="text-caption text-ink-400 font-normal">（可选，最多5个）</span>
        </h2>
        <div class="flex flex-wrap gap-2 mb-3 min-h-[32px]">
          <span
            v-for="tag in tags"
            :key="tag"
            class="chip-primary flex items-center gap-1 !py-1.5 !px-3"
          >
            <Hash class="w-3 h-3" />
            {{ tag }}
            <button
              class="w-4 h-4 rounded-full bg-white/50 flex items-center justify-center
                     hover:bg-white transition-colors"
              @click="removeTag(tag)"
            >
              <X class="w-3 h-3 text-primary-600" />
            </button>
          </span>
        </div>
        <div class="relative">
          <input
            v-model="tagInput"
            type="text"
            maxlength="10"
            class="input-base"
            placeholder="输入标签后按回车添加"
            @keydown="handleTagKeydown"
          />
          <button
            v-if="tagInput.trim()"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-caption
                   text-primary-500 font-medium hover:text-primary-600 transition-colors"
            @click="addTag"
          >
            添加
          </button>
        </div>
        <div class="flex flex-wrap gap-2 mt-3">
          <span class="text-caption text-ink-400">推荐标签：</span>
          <button
            v-for="tag in ['新手妈妈', '6月龄', '辅食', '睡眠', '产后', '育儿心得']"
            :key="tag"
            :disabled="tags.includes(tag) || tags.length >= 5"
            :class="[
              'chip-gray !py-1 transition-all',
              tags.includes(tag) ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-primary-50 hover:!text-primary-600',
            ]"
            @click="!tags.includes(tag) && tags.length < 5 && tags.push(tag)"
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <!-- 图片上传 -->
      <div class="card p-5 md:p-6">
        <h2 class="text-heading-4 font-semibold text-ink-900 mb-4">
          上传图片 <span class="text-caption text-ink-400 font-normal">（可选，最多9张）</span>
        </h2>

        <div
          v-if="imageList.length > 0"
          class="grid grid-cols-3 gap-3 mb-4"
        >
          <div
            v-for="file in imageList"
            :key="file.id"
            class="relative aspect-square rounded-xl overflow-hidden bg-ink-50 group"
          >
            <NImage
              v-if="file.url"
              :src="file.url"
              object-fit="cover"
              class="!w-full !h-full"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-4xl
                     bg-gradient-to-br from-primary-100 to-lavender-100"
            >
              📷
            </div>
            <button
              class="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50
                     flex items-center justify-center text-white opacity-0
                     group-hover:opacity-100 transition-opacity
                     hover:bg-black/70"
              @click="handleRemoveImage(file)"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <NUpload
          v-if="imageList.length < 9"
          :max="9 - imageList.length"
          multiple
          accept="image/*"
          :custom-request="handleImageUpload"
          :on-finish="handleUploadFinish"
          :show-file-list="false"
        >
          <NUploadDragger
            class="!rounded-2xl !border-dashed-2 !border-2 !border-ink-100
                   hover:!border-primary-300 hover:!bg-primary-50/30
                   transition-all"
          >
            <div class="py-8 flex flex-col items-center gap-3">
              <div
                class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100
                       to-lavender-100 flex items-center justify-center"
              >
                <ImagePlus class="w-8 h-8 text-primary-500" />
              </div>
              <div class="text-body font-medium text-ink-700">
                点击或拖拽图片到此处上传
              </div>
              <div class="text-caption text-ink-400">
                支持 JPG、PNG、WEBP 格式，单张不超过 10MB
              </div>
              <div class="text-caption text-ink-300">
                还可上传 {{ 9 - imageList.length }} 张
              </div>
            </div>
          </NUploadDragger>
        </NUpload>
      </div>

      <!-- 底部操作栏 -->
      <div class="sticky bottom-0 -mx-4 px-4 py-4 bg-gradient-to-t from-cream-50 via-cream-50/95 to-transparent">
        <div class="card p-3 md:p-4 flex items-center gap-3 md:gap-4">
          <div class="flex-1 min-w-0 hidden md:block">
            <div class="flex items-center gap-2 text-caption">
              <span class="text-ink-500">
                选择分类：
                <span class="text-primary-600 font-semibold">{{ category }}</span>
              </span>
              <span v-if="tags.length > 0" class="text-ink-300">·</span>
              <span v-if="tags.length > 0" class="text-ink-500">
                {{ tags.length }} 个标签
              </span>
              <span v-if="imageList.length > 0" class="text-ink-300">·</span>
              <span v-if="imageList.length > 0" class="text-ink-500">
                {{ imageList.length }} 张图片
              </span>
            </div>
          </div>

          <button
            class="btn-secondary !h-11 !px-5 flex-1 md:flex-none"
            @click="goBack"
          >
            取消
          </button>
          <NButton
            type="primary"
            size="large"
            round
            :loading="submitting"
            :disabled="!canSubmit"
            class="!bg-gradient-primary !border-0 !h-11 !px-6 md:!px-8 flex-1 md:flex-none font-semibold"
            @click="submitPost"
          >
            <Send class="w-4 h-4 mr-1" />
            发布帖子
          </NButton>
        </div>
      </div>
    </div>
  </div>
</template>
