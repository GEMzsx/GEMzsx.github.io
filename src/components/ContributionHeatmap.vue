<script setup>
import { computed, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useEchart } from '../composables/useEchart'
import { useGithubData } from '../composables/useGithubData'
import { siteConfig } from '../config'

const { contributionsByYear, contributions, loading, warning } = useGithubData()

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const DAYS = ['日', '一', '二', '三', '四', '五', '六']

const activeYear = ref('')

// 数据到达后默认选中最近一年
watch(
  contributionsByYear,
  (list) => {
    if (list.length && !list.some((y) => y.year === activeYear.value)) {
      activeYear.value = list[0].year
    }
  },
  { immediate: true },
)

const current = computed(
  () => contributionsByYear.value.find((y) => y.year === activeYear.value) || null,
)

const option = computed(() => {
  const year = current.value
  if (!year) return null

  const maxCount = Math.max(1, ...year.days.map((d) => d.count))

  return {
    tooltip: {
      backgroundColor: 'rgba(15,20,32,0.95)',
      borderColor: 'rgba(255,255,255,0.12)',
      borderWidth: 1,
      textStyle: { color: '#e2e8f0', fontSize: 12 },
      formatter: (p) =>
        `${p.data[0]}<br/><b>${p.data[1]}</b> 次贡献`,
    },
    visualMap: {
      show: false,
      type: 'piecewise',
      min: 0,
      max: maxCount,
      inRange: { color: ['#1a2233', '#3730a3', '#4f46e5', '#818cf8', '#22d3ee'] },
      pieces: [
        { min: 1, max: maxCount, color: '#4f46e5' },
        { min: 0, max: 0, color: '#161d2b' },
      ],
    },
    calendar: {
      top: 28,
      left: 40,
      right: 8,
      bottom: 6,
      cellSize: ['auto', 14],
      range: year.year,
      itemStyle: { color: 'transparent', borderWidth: 0 },
      splitLine: { show: false },
      yearLabel: { show: false },
      monthLabel: { color: '#94a3b8', fontSize: 11, margin: 8, nameMap: MONTHS },
      dayLabel: {
        color: '#94a3b8',
        fontSize: 11,
        margin: 6,
        firstDay: 0,
        nameMap: DAYS,
      },
    },
    series: [
      {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: year.days.map((d) => [d.date, d.count]),
        itemStyle: { borderRadius: 2.5, borderWidth: 2, borderColor: '#0b0f19' },
        emphasis: { itemStyle: { borderColor: '#818cf8', borderWidth: 2 } },
      },
    ],
  }
})

const container = useEchart(option)
</script>

<template>
  <div v-reveal="60" class="card p-6 sm:p-7">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 class="flex items-center gap-2.5 text-lg font-bold text-white">
          <span class="grid size-8 place-items-center rounded-lg bg-brand-500/12 text-brand-400">
            <AppIcon name="fire" :size="17" />
          </span>
          贡献活跃度
        </h2>
        <p class="mt-1.5 text-sm text-slate-400">
          数据来自第三方公开服务，与 GitHub 主页贡献图一致
        </p>
      </div>

      <!-- 年份切换 -->
      <div
        v-if="contributionsByYear.length > 1"
        class="flex flex-wrap gap-1 rounded-lg border border-white/10 bg-white/4 p-1"
      >
        <button
          v-for="y in contributionsByYear"
          :key="y.year"
          type="button"
          class="rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors"
          :class="
            activeYear === y.year ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
          "
          @click="activeYear = y.year"
        >
          {{ y.year }}
        </button>
      </div>
    </header>

    <!-- 加载中 -->
    <div v-if="loading && !contributions" class="mt-6 space-y-3">
      <div class="shimmer h-4 w-40 rounded bg-white/5" />
      <div class="shimmer h-32 rounded-xl bg-white/5" />
    </div>

    <!-- 数据源不可用 -->
    <div
      v-else-if="!contributions"
      class="mt-6 rounded-xl border border-amber-500/22 bg-amber-500/8 p-5 text-sm"
    >
      <p class="flex items-center gap-2 font-medium text-amber-200">
        <AppIcon name="alert" :size="17" />
        贡献数据暂时不可用
      </p>
      <p class="mt-2 text-amber-200/70">
        {{ warning || '第三方贡献数据服务响应异常，仓库与统计信息不受影响。' }}
      </p>
      <a
        :href="`https://github.com/${siteConfig.githubUsername}`"
        target="_blank"
        rel="noopener noreferrer"
        class="link mt-3 inline-flex items-center gap-1.5 text-sm"
      >
        前往 GitHub 查看完整贡献图
        <AppIcon name="external" :size="13" />
      </a>
    </div>

    <template v-else>
      <!-- 概要 -->
      <div class="mt-5 flex flex-wrap gap-x-8 gap-y-3">
        <div>
          <p class="text-2xl font-bold tabular-nums text-white">
            {{ current?.total ?? 0 }}
          </p>
          <p class="text-xs text-slate-500">{{ activeYear }} 年贡献次数</p>
        </div>
        <div>
          <p class="text-2xl font-bold tabular-nums text-white">
            {{ current?.days.filter((d) => d.count > 0).length ?? 0 }}
          </p>
          <p class="text-xs text-slate-500">活跃天数</p>
        </div>
        <div>
          <p class="text-2xl font-bold tabular-nums text-white">{{ contributions.total }}</p>
          <p class="text-xs text-slate-500">累计贡献次数</p>
        </div>
      </div>

      <!-- 热力图：窄屏横向滚动，避免 53 周的格子被压缩到看不清，也保证 12 个月份标签完整 -->
      <div class="mt-5 -mx-1 overflow-x-auto px-1 pb-1">
        <div class="h-40 min-w-[48rem]">
          <div ref="container" class="size-full" />
        </div>
      </div>

      <p v-if="contributions.total === 0" class="mt-3 text-xs text-slate-500">
        该账号暂无公开贡献记录，提交代码后这里会自动更新。
      </p>
    </template>
  </div>
</template>
