<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import { useEchart } from '../composables/useEchart'
import { languageColor } from '../lib/languageColors'
import { useGithubData } from '../composables/useGithubData'

const { languageStats, repos, loading } = useGithubData()

/** 只展示前 8 种语言，其余合并为「其他」，避免图例过长 */
const TOP_N = 8

const displayData = computed(() => {
  const list = languageStats.value
  if (list.length <= TOP_N) return list
  const head = list.slice(0, TOP_N)
  const restCount = list.slice(TOP_N).reduce((sum, item) => sum + item.count, 0)
  return [...head, { name: '其他', count: restCount }]
})

const total = computed(() => displayData.value.reduce((sum, d) => sum + d.count, 0))

/**
 * GitHub 只对内容足够多的仓库标注主语言。若一个都没识别出来，
 * 画成单个「其他 100%」的环形图没有信息量，改为直接给文字说明。
 */
const hasRealLanguages = computed(() => languageStats.value.some((l) => l.name !== 'Other'))

const option = computed(() => {
  if (!displayData.value.length) return null

  const data = displayData.value.map((item) => {
    const color = item.name === '其他' ? '#64748b' : languageColor(item.name)
    return {
      name: item.name,
      value: item.count,
      itemStyle: { color, borderColor: '#0b0f19', borderWidth: 2 },
    }
  })

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15,20,32,0.95)',
      borderColor: 'rgba(255,255,255,0.12)',
      borderWidth: 1,
      textStyle: { color: '#e2e8f0', fontSize: 12 },
      formatter: (p) => `${p.marker} ${p.name}<br/><b>${p.value}</b> 个仓库 · ${p.percent}%`,
    },
    series: [
      {
        type: 'pie',
        radius: ['58%', '82%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        padAngle: 2,
        itemStyle: { borderRadius: 4 },
        label: { show: false },
        labelLine: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 6,
          itemStyle: { shadowBlur: 18, shadowColor: 'rgba(99,102,241,0.5)' },
        },
        data,
      },
    ],
  }
})

const container = useEchart(option)
</script>

<template>
  <div v-reveal class="card p-6 sm:p-7">
    <h2 class="flex items-center gap-2.5 text-lg font-bold text-white">
      <span class="grid size-8 place-items-center rounded-lg bg-aqua-400/12 text-aqua-400">
        <AppIcon name="code" :size="17" />
      </span>
      语言占比
    </h2>

    <div v-if="loading && !repos.length" class="mt-6 space-y-3">
      <div class="shimmer mx-auto size-40 rounded-full bg-white/5" />
      <div class="shimmer h-4 w-2/3 rounded bg-white/5" />
    </div>

    <div v-else-if="!hasRealLanguages" class="mt-6 rounded-xl border border-white/8 bg-white/3 p-5">
      <p class="text-sm font-medium text-slate-300">还没有识别出主要语言</p>
      <p class="mt-2 text-xs leading-relaxed text-slate-500">
        GitHub 只会给内容足够多的仓库标注主语言。当前 {{ repos.length }} 个仓库都还没有被识别，
        提交更多代码后这里会自动生成语言占比图。
      </p>
    </div>

    <div v-else class="mt-4">
      <!-- 环形图 + 中心总数 -->
      <div class="relative mx-auto h-48 max-w-[15rem]">
        <div ref="container" class="size-full" />
        <div class="pointer-events-none absolute inset-0 grid place-content-center text-center">
          <p class="text-2xl font-bold tabular-nums text-white">{{ total }}</p>
          <p class="text-[11px] text-slate-500">个仓库</p>
        </div>
      </div>

      <!-- 自定义图例，比 ECharts 内置图例更贴合整体排版 -->
      <ul class="mt-5 space-y-2.5">
        <li
          v-for="item in displayData"
          :key="item.name"
          class="flex items-center gap-2.5 text-sm"
        >
          <span
            class="size-2.5 shrink-0 rounded-full"
            :style="{ backgroundColor: item.name === '其他' ? '#64748b' : languageColor(item.name) }"
          />
          <span class="min-w-0 flex-1 truncate text-slate-300">{{ item.name }}</span>
          <span class="tabular-nums text-slate-500">
            {{ total ? Math.round((item.count / total) * 100) : 0 }}%
          </span>
          <span class="w-8 text-right tabular-nums text-slate-400">{{ item.count }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
