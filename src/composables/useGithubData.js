/**
 * 全站数据仓库（模块级单例）
 * ------------------------------------------------------------------
 * 三个数据源共用一份状态，避免各组件重复请求触发限流。
 * 贡献数据属于第三方服务，失败时只降级该模块，不影响仓库展示。
 */
import { computed, ref } from 'vue'
import {
  clearCache,
  fetchContributions,
  fetchRepos,
  fetchUser,
  summarize,
} from '../api/github'
import { siteConfig } from '../config'

const user = ref(null)
const repos = ref([])
const contributions = ref(null)
const loading = ref(false)
const error = ref(null)
/** 非致命问题（如图表数据源不可用），单独提示 */
const warning = ref('')
const lastUpdated = ref(null)

let inflight = null

async function load({ force = false } = {}) {
  if (inflight && !force) return inflight
  if (force) clearCache()

  loading.value = true
  error.value = null
  warning.value = ''
  const username = siteConfig.githubUsername

  inflight = (async () => {
    // 用户与仓库是页面主体，任一失败都视为整体失败
    const [userResult, repoResult] = await Promise.allSettled([
      fetchUser(username),
      fetchRepos(username),
    ])

    if (userResult.status === 'rejected') {
      error.value = userResult.reason
      loading.value = false
      inflight = null
      return
    }
    if (repoResult.status === 'rejected') {
      error.value = repoResult.reason
      loading.value = false
      inflight = null
      return
    }

    user.value = userResult.value
    repos.value = repoResult.value
    lastUpdated.value = new Date()

    // 贡献数据可选，失败只降级
    const contribResult = await Promise.allSettled([fetchContributions(username)])
    if (contribResult[0].status === 'fulfilled') {
      contributions.value = contribResult[0].value
    } else {
      contributions.value = null
      warning.value = '贡献活跃度数据源暂时不可用，其余数据不受影响'
    }

    loading.value = false
    inflight = null
  })()

  return inflight
}

const stats = computed(() => summarize(repos.value || []))

const totalStars = computed(() => stats.value.totalStars)
const totalForks = computed(() => stats.value.totalForks)
const languageStats = computed(() => stats.value.languageStats)

/** 累计提交天数：有贡献记录的天数 */
const activeDays = computed(() => contributions.value?.activeDays ?? null)
/** 累计贡献次数 */
const totalContributions = computed(() => contributions.value?.total ?? null)

/** 有贡献数据时按年份倒序的列表，用于活跃度图 */
const contributionsByYear = computed(() => {
  const list = contributions.value?.contributions
  if (!list?.length) return []
  const map = new Map()
  for (const day of list) {
    const year = day.date.slice(0, 4)
    if (!map.has(year)) map.set(year, [])
    map.get(year).push(day)
  }
  return [...map.entries()]
    .map(([year, days]) => ({
      year,
      days,
      total: days.reduce((sum, d) => sum + d.count, 0),
    }))
    .sort((a, b) => Number(b.year) - Number(a.year))
})

export function useGithubData() {
  return {
    user,
    repos,
    contributions,
    contributionsByYear,
    loading,
    error,
    warning,
    lastUpdated,
    stats,
    totalStars,
    totalForks,
    languageStats,
    activeDays,
    totalContributions,
    load,
  }
}
