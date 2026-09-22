<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import { siteConfig } from '../config'

const props = defineProps({
  error: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['retry'])

const isRateLimit = computed(() => props.error?.code === 'RATE_LIMIT')
const isNotFound = computed(() => props.error?.code === 'NOT_FOUND')

const title = computed(() => {
  if (isRateLimit.value) return 'GitHub 接口访问受限'
  if (isNotFound.value) return '找不到该 GitHub 用户'
  return '数据加载失败'
})
</script>

<template>
  <div class="card p-8 text-center sm:p-12">
    <span class="mx-auto grid size-14 place-items-center rounded-2xl bg-red-500/12 text-red-400">
      <AppIcon name="alert" :size="28" />
    </span>

    <h2 class="mt-4 text-xl font-bold text-white">{{ title }}</h2>
    <p class="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-400">
      {{ error.message }}
    </p>

    <p v-if="isRateLimit" class="mx-auto mt-3 max-w-lg text-xs leading-relaxed text-slate-500">
      GitHub 对未登录的接口调用限制为每小时 60 次。稍后重试即可，或直接前往 GitHub 主页查看完整内容。
    </p>

    <div class="mt-6 flex flex-wrap justify-center gap-3">
      <button type="button" class="btn-primary" :disabled="loading" @click="$emit('retry')">
        <AppIcon name="refresh" :size="16" :class="loading ? 'animate-spin' : ''" />
        {{ loading ? '重试中…' : '重新加载' }}
      </button>
      <a
        :href="`https://github.com/${siteConfig.githubUsername}`"
        target="_blank"
        rel="noopener noreferrer"
        class="btn-ghost"
      >
        <AppIcon name="github" :size="16" />
        前往 GitHub 主页
      </a>
    </div>
  </div>
</template>
