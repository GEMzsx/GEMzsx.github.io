<script setup>
import { computed, ref } from 'vue'
import AppIcon from './AppIcon.vue'
import RepoCard from './RepoCard.vue'
import SkeletonBlock from './SkeletonBlock.vue'
import { languageColor } from '../lib/languageColors'
import { useGithubData } from '../composables/useGithubData'

const { repos, loading, error } = useGithubData()

const keyword = ref('')
const activeLanguage = ref('')
const sortBy = ref('updated')
const layout = ref('grid')

const SORTS = [
  { value: 'updated', label: '最近更新' },
  { value: 'stars', label: 'Star 最多' },
  { value: 'name', label: '名称' },
]

/** 语言筛选项，带各自仓库数量 */
const languageOptions = computed(() => {
  const map = new Map()
  for (const repo of repos.value) {
    if (!repo.language) continue
    map.set(repo.language, (map.get(repo.language) || 0) + 1)
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
})

const filtered = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  let list = repos.value

  if (activeLanguage.value) {
    list = list.filter((r) => r.language === activeLanguage.value)
  }
  if (q) {
    list = list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.topics.some((t) => t.toLowerCase().includes(q)),
    )
  }

  const sorted = [...list]
  if (sortBy.value === 'stars') {
    sorted.sort((a, b) => b.stars - a.stars || a.name.localeCompare(b.name))
  } else if (sortBy.value === 'name') {
    sorted.sort((a, b) => a.name.localeCompare(b.name))
  } else {
    sorted.sort(
      (a, b) => new Date(b.pushedAt || b.updatedAt) - new Date(a.pushedAt || a.updatedAt),
    )
  }
  return sorted
})

const hasFilter = computed(() => Boolean(keyword.value.trim() || activeLanguage.value))

function resetFilters() {
  keyword.value = ''
  activeLanguage.value = ''
}

function toggleLanguage(name) {
  activeLanguage.value = activeLanguage.value === name ? '' : name
}
</script>

<template>
  <section id="repos" class="scroll-mt-20">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="section-title flex items-center gap-2.5">
          <span class="grid size-9 place-items-center rounded-xl bg-brand-500/12 text-brand-400">
            <AppIcon name="repo" :size="19" />
          </span>
          项目仓库
        </h2>
        <p class="mt-2 text-sm text-slate-400">
          自动同步自 GitHub 公开仓库，共
          <span class="font-semibold text-slate-200">{{ repos.length }}</span>
          个
          <template v-if="hasFilter">
            ，筛选出
            <span class="font-semibold text-brand-400">{{ filtered.length }}</span>
            个
          </template>
        </p>
      </div>

      <!-- 布局切换 -->
      <div class="hidden items-center gap-1 rounded-lg border border-white/10 bg-white/4 p-1 sm:flex">
        <button
          v-for="mode in ['grid', 'list']"
          :key="mode"
          type="button"
          class="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          :class="layout === mode ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'"
          :aria-pressed="layout === mode"
          @click="layout = mode"
        >
          {{ mode === 'grid' ? '网格' : '列表' }}
        </button>
      </div>
    </header>

    <!-- 筛选工具栏 -->
    <div v-if="repos.length" class="mt-6 space-y-3">
      <div class="flex flex-col gap-3 sm:flex-row">
        <label class="relative flex-1">
          <span class="sr-only">搜索项目</span>
          <AppIcon
            name="search"
            :size="16"
            class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            v-model="keyword"
            type="search"
            placeholder="搜索项目名称、描述或标签…"
            class="w-full rounded-xl border border-white/10 bg-white/4 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-brand-500/60 focus:bg-white/6 focus:outline-none"
          />
        </label>

        <label class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/4 px-3 py-2.5">
          <span class="text-xs text-slate-500">排序</span>
          <select
            v-model="sortBy"
            class="bg-transparent text-sm text-slate-200 focus:outline-none [&>option]:bg-ink-800"
          >
            <option v-for="s in SORTS" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </label>
      </div>

      <!-- 语言筛选 -->
      <div v-if="languageOptions.length > 1" class="flex flex-wrap gap-2">
        <button
          type="button"
          class="chip transition-colors"
          :class="activeLanguage === '' ? '!border-brand-500/60 !text-white !bg-brand-500/12' : 'hover:bg-white/10'"
          @click="activeLanguage = ''"
        >
          全部
          <span class="text-slate-500">{{ repos.length }}</span>
        </button>
        <button
          v-for="lang in languageOptions"
          :key="lang.name"
          type="button"
          class="chip transition-colors"
          :class="
            activeLanguage === lang.name
              ? '!border-brand-500/60 !text-white !bg-brand-500/12'
              : 'hover:bg-white/10'
          "
          @click="toggleLanguage(lang.name)"
        >
          <span class="size-2 rounded-full" :style="{ backgroundColor: languageColor(lang.name) }" />
          {{ lang.name }}
          <span class="text-slate-500">{{ lang.count }}</span>
        </button>
      </div>
    </div>

    <!-- 加载骨架 -->
    <div
      v-if="loading && !repos.length"
      class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div v-for="n in 6" :key="n" class="card overflow-hidden">
        <div class="h-1 bg-white/5" />
        <div class="space-y-3 p-5">
          <SkeletonBlock height="1.1rem" width="60%" />
          <SkeletonBlock height="0.85rem" />
          <SkeletonBlock height="0.85rem" width="80%" />
          <SkeletonBlock height="0.85rem" width="45%" />
        </div>
      </div>
    </div>

    <!-- 加载失败 -->
    <div
      v-else-if="error"
      class="mt-6 rounded-2xl border border-red-500/25 bg-red-500/8 p-6 text-center"
    >
      <AppIcon name="alert" :size="26" class="mx-auto text-red-400" />
      <p class="mt-3 font-medium text-red-200">{{ error.message }}</p>
      <p class="mt-1 text-sm text-red-300/70">
        仓库数据来自 GitHub 公开接口，请稍后刷新重试。
      </p>
    </div>

    <!-- 空结果 -->
    <div
      v-else-if="!filtered.length"
      class="mt-6 rounded-2xl border border-white/10 bg-white/3 p-10 text-center"
    >
      <AppIcon name="search" :size="26" class="mx-auto text-slate-600" />
      <p class="mt-3 font-medium text-slate-300">
        {{ repos.length ? '没有匹配的项目' : '这个账号还没有公开仓库' }}
      </p>
      <button v-if="hasFilter" type="button" class="btn-ghost mt-4" @click="resetFilters">
        清空筛选条件
      </button>
    </div>

    <!-- 仓库列表 -->
    <div
      v-else
      class="mt-6 grid gap-5"
      :class="layout === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'"
    >
      <RepoCard
        v-for="(repo, i) in filtered"
        :key="repo.id"
        v-reveal="Math.min(i, 8) * 60"
        :repo="repo"
      />
    </div>
  </section>
</template>
