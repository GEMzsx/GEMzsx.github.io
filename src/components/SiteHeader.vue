<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from './AppIcon.vue'
import { siteConfig } from '../config'
import { useGithubData } from '../composables/useGithubData'

const { loading, lastUpdated, load } = useGithubData()

const scrolled = ref(false)
const menuOpen = ref(false)

const NAV = [
  { href: '#profile', label: '关于' },
  { href: '#stats', label: '数据' },
  { href: '#activity', label: '活跃度' },
  { href: '#repos', label: '项目' },
]

// 滚动超过一屏的 1/8 时给导航栏加背景，避免首屏遮挡头像
function onScroll() {
  scrolled.value = window.scrollY > 40
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

function refresh() {
  load({ force: true })
}

const updatedText = () =>
  lastUpdated.value
    ? `更新于 ${lastUpdated.value.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      })}`
    : ''
</script>

<template>
  <header
    class="sticky top-0 z-50 transition-colors duration-300"
    :class="scrolled ? 'border-b border-white/8 bg-ink-900/80 backdrop-blur-lg' : 'bg-transparent'"
  >
    <div class="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
      <!-- Logo -->
      <a href="#top" class="flex items-center gap-2.5 font-bold text-white">
        <span
          class="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-aqua-400 text-sm text-white"
        >
          G
        </span>
        <span class="hidden text-base sm:inline">{{ siteConfig.siteName }}</span>
      </a>

      <!-- 桌面导航 -->
      <nav class="ml-4 hidden items-center gap-1 md:flex">
        <a
          v-for="item in NAV"
          :key="item.href"
          :href="item.href"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/6 hover:text-white"
        >
          {{ item.label }}
        </a>
      </nav>

      <div class="ml-auto flex items-center gap-2">
        <span v-if="lastUpdated" class="hidden text-xs text-slate-500 lg:inline">
          {{ updatedText() }}
        </span>

        <button
          type="button"
          class="grid size-9 place-items-center rounded-lg border border-white/12 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          :disabled="loading"
          :title="`重新拉取 GitHub 数据（${updatedText() || '尚未加载'}）`"
          @click="refresh"
        >
          <AppIcon name="refresh" :size="17" :class="loading ? 'animate-spin' : ''" />
        </button>

        <a
          :href="`https://github.com/${siteConfig.githubUsername}`"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-ghost hidden !px-3 !py-2 sm:inline-flex"
        >
          <AppIcon name="github" :size="16" />
          <span>GitHub</span>
        </a>

        <!-- 移动端菜单按钮 -->
        <button
          type="button"
          class="grid size-9 place-items-center rounded-lg border border-white/12 bg-white/5 text-slate-300 md:hidden"
          :aria-expanded="menuOpen"
          aria-label="切换导航菜单"
          @click="menuOpen = !menuOpen"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <path v-if="!menuOpen" d="M4 7h16M4 12h16M4 17h16" />
            <path v-else d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 移动端下拉导航 -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <nav
        v-if="menuOpen"
        class="border-t border-white/8 bg-ink-900/95 px-4 py-2 backdrop-blur-lg md:hidden"
      >
        <a
          v-for="item in NAV"
          :key="item.href"
          :href="item.href"
          class="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/6 hover:text-white"
          @click="menuOpen = false"
        >
          {{ item.label }}
        </a>
      </nav>
    </transition>
  </header>
</template>
