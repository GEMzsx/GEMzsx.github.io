<script setup>
import { defineAsyncComponent, onMounted, ref } from 'vue'
import SiteHeader from './components/SiteHeader.vue'
import HeroProfile from './components/HeroProfile.vue'
import StatsSection from './components/StatsSection.vue'
import AboutSection from './components/AboutSection.vue'
import RepoSection from './components/RepoSection.vue'
import SiteFooter from './components/SiteFooter.vue'
import ErrorState from './components/ErrorState.vue'
import AppIcon from './components/AppIcon.vue'
import LazyMount from './components/LazyMount.vue'
import { useGithubData } from './composables/useGithubData'

// 图表组件体积大（ECharts），拆成独立 chunk，配合 LazyMount 等滚到附近再加载
const LanguageChart = defineAsyncComponent(() => import('./components/LanguageChart.vue'))
const ContributionHeatmap = defineAsyncComponent(
  () => import('./components/ContributionHeatmap.vue'),
)

const { user, loading, error, warning, load } = useGithubData()

const showTop = ref(false)

onMounted(() => {
  load()
  window.addEventListener(
    'scroll',
    () => {
      showTop.value = window.scrollY > 700
    },
    { passive: true },
  )
})

function retry() {
  load({ force: true })
}
</script>

<template>
  <div id="top" class="min-h-screen">
    <SiteHeader />

    <main class="mx-auto max-w-6xl space-y-14 px-4 py-8 sm:px-6 sm:py-10">
      <!-- 整体失败：只展示错误态，不显示空壳区块 -->
      <ErrorState v-if="error && !user" :error="error" :loading="loading" @retry="retry" />

      <template v-else>
        <HeroProfile />

        <!-- 非致命提示（如贡献数据源异常） -->
        <p
          v-if="warning"
          class="flex items-start gap-2 rounded-xl border border-amber-500/22 bg-amber-500/8 px-4 py-3 text-sm text-amber-200"
        >
          <AppIcon name="alert" :size="17" class="mt-0.5 shrink-0" />
          <span>{{ warning }}</span>
        </p>

        <StatsSection />
        <AboutSection />

        <section id="activity" class="scroll-mt-20 space-y-6">
          <h2 class="section-title">数据可视化</h2>
          <div class="grid gap-5 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]">
            <LazyMount>
              <LanguageChart />
              <template #placeholder>
                <div class="card h-96 animate-pulse bg-white/3" aria-hidden="true" />
              </template>
            </LazyMount>
            <LazyMount>
              <ContributionHeatmap />
              <template #placeholder>
                <div class="card h-96 animate-pulse bg-white/3" aria-hidden="true" />
              </template>
            </LazyMount>
          </div>
        </section>

        <RepoSection />
      </template>
    </main>

    <SiteFooter />

    <!-- 回到顶部 -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 translate-y-2"
    >
      <a
        v-show="showTop"
        href="#top"
        class="fixed bottom-6 right-6 z-40 grid size-11 place-items-center rounded-full border border-white/12 bg-ink-800/90 text-slate-300 shadow-lg backdrop-blur transition-colors hover:bg-brand-500 hover:text-white"
        aria-label="回到顶部"
      >
        <AppIcon name="arrowUp" :size="18" />
      </a>
    </transition>
  </div>
</template>
