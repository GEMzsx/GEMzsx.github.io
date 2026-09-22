<script setup>
import { computed, ref } from 'vue'
import AppIcon from './AppIcon.vue'
import { siteConfig } from '../config'
import { languageColor } from '../lib/languageColors'

const props = defineProps({
  repo: { type: Object, required: true },
})

/** GitHub 为每个仓库自动生成的社交预览图，失败时回退为纯色块 */
const coverFailed = ref(false)
const coverUrl = computed(() => `https://opengraph.githubassets.com/1/${props.repo.fullName}`)

const color = computed(() => languageColor(props.repo.language))

const updatedText = computed(() => {
  const iso = props.repo.pushedAt || props.repo.updatedAt
  if (!iso) return ''
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days <= 0) return '今天更新'
  if (days === 1) return '昨天更新'
  if (days < 30) return `${days} 天前更新`
  if (days < 365) return `${Math.floor(days / 30)} 个月前更新`
  return `${Math.floor(days / 365)} 年前更新`
})

/** 展示用标签：topics 优先，不足时用语言与许可证补齐 */
const tags = computed(() => {
  const list = [...(props.repo.topics || [])]
  if (props.repo.license && props.repo.license !== 'NOASSERTION') list.push(props.repo.license)
  return list.slice(0, 4)
})
</script>

<template>
  <article class="card card-hover group flex flex-col overflow-hidden">
    <!-- 封面图 -->
    <a
      v-if="siteConfig.showRepoCover"
      :href="repo.htmlUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="relative block h-32 overflow-hidden border-b border-white/8 bg-gradient-to-br from-ink-800 to-ink-700 sm:h-36"
      :aria-label="`打开 ${repo.name} 仓库`"
    >
      <img
        v-if="!coverFailed"
        :src="coverUrl"
        :alt="`${repo.name} 预览图`"
        class="size-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        decoding="async"
        @error="coverFailed = true"
      />
      <div
        v-else
        class="grid size-full place-items-center text-ink-600"
      >
        <AppIcon name="repo" :size="40" />
      </div>

      <span
        v-if="repo.isFork"
        class="absolute left-3 top-3 rounded-md bg-ink-950/80 px-2 py-1 text-[11px] font-medium text-slate-300 backdrop-blur"
      >
        Fork
      </span>
      <span
        v-if="repo.isArchived"
        class="absolute right-3 top-3 rounded-md bg-amber-500/85 px-2 py-1 text-[11px] font-medium text-ink-950"
      >
        已归档
      </span>
    </a>

    <!-- 未启用封面图时，改用一条语言色顶栏给卡片视觉标识 -->
    <div
      v-else
      class="h-1 w-full"
      :style="{ background: `linear-gradient(90deg, ${color}, transparent)` }"
      aria-hidden="true"
    />

    <div class="flex flex-1 flex-col p-5">
      <div class="flex items-start gap-2">
        <AppIcon name="repo" :size="17" class="mt-0.5 text-slate-500" />
        <h3 class="min-w-0 flex-1 text-base font-semibold leading-snug">
          <a
            :href="repo.htmlUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-white transition-colors hover:text-brand-400"
          >
            {{ repo.name }}
          </a>
        </h3>
      </div>

      <p class="mt-2 line-clamp-2 min-h-[2.6em] text-sm leading-relaxed text-slate-400">
        {{ repo.description || '暂无项目描述' }}
      </p>

      <!-- 标签 -->
      <ul v-if="tags.length" class="mt-3 flex flex-wrap gap-1.5">
        <li
          v-for="tag in tags"
          :key="tag"
          class="rounded-md bg-brand-500/12 px-2 py-0.5 text-[11px] font-medium text-brand-400"
        >
          {{ tag }}
        </li>
      </ul>

      <!-- 底部指标 -->
      <div class="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5 text-xs text-slate-400">
        <span v-if="repo.language" class="flex items-center gap-1.5">
          <span class="size-2.5 rounded-full" :style="{ backgroundColor: color }" />
          {{ repo.language }}
        </span>

        <span
          class="flex items-center gap-1"
          :class="repo.stars > 0 ? 'text-amber-300/90' : ''"
          :title="`${repo.stars} 个 Star`"
        >
          <AppIcon name="star" :size="14" />
          {{ repo.stars }}
        </span>

        <span class="flex items-center gap-1" :title="`${repo.forks} 个 Fork`">
          <AppIcon name="fork" :size="14" />
          {{ repo.forks }}
        </span>

        <span v-if="updatedText" class="ml-auto flex items-center gap-1 text-slate-500">
          <AppIcon name="clock" :size="13" />
          {{ updatedText }}
        </span>
      </div>

      <!-- 演示站入口 -->
      <a
        v-if="repo.homepage"
        :href="repo.homepage"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-aqua-400 hover:underline"
      >
        <AppIcon name="external" :size="13" />
        在线演示
      </a>
    </div>
  </article>
</template>
