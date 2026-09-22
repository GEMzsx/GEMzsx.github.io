<script setup>
import AppIcon from './AppIcon.vue'
import StatCard from './StatCard.vue'
import { useGithubData } from '../composables/useGithubData'
import { computed } from 'vue'

const { user, repos, totalStars, totalForks, activeDays, totalContributions, loading } =
  useGithubData()

/** 四张核心指标卡；数值为 null 时组件内部自动显示骨架屏 */
const cards = computed(() => [
  {
    label: '公开仓库',
    value: loading.value && !user.value ? null : (user.value?.publicRepos ?? repos.value.length),
    icon: 'repo',
    hint: 'GitHub 公开可访问的仓库总数',
  },
  {
    label: 'Star 总数',
    value: loading.value && !user.value ? null : totalStars.value,
    icon: 'star',
    hint: `累计被 Fork ${totalForks.value} 次`,
  },
  {
    label: '累计提交天数',
    value: activeDays.value,
    icon: 'calendar',
    hint:
      totalContributions.value === null
        ? '贡献数据源暂不可用'
        : `累计 ${totalContributions.value} 次贡献`,
  },
  {
    label: '粉丝关注',
    value: loading.value && !user.value ? null : (user.value?.followers ?? 0),
    icon: 'users',
    hint: `正在关注 ${user.value?.following ?? 0} 人`,
  },
])
</script>

<template>
  <section id="stats" class="scroll-mt-20">
    <h2 class="sr-only">GitHub 核心数据</h2>
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        v-for="(card, i) in cards"
        :key="card.label"
        v-reveal="i * 70"
        :label="card.label"
        :value="card.value"
        :icon="card.icon"
        :hint="card.hint"
      />
    </div>

    <p
      v-if="user"
      class="mt-4 flex items-center gap-1.5 text-xs text-slate-500"
    >
      <AppIcon name="clock" :size="13" />
      数据实时拉取自 GitHub 公开接口，刷新页面即可同步最新动态
    </p>
  </section>
</template>
