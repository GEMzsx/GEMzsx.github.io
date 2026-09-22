/**
 * GitHub 公开数据访问层
 * ------------------------------------------------------------------
 * 全部使用免鉴权公开接口，不需要任何 Token 或后端服务：
 *  - api.github.com              用户资料 / 仓库列表（匿名限流 60 次/小时/IP）
 *  - github-contributions-api    贡献活跃度（第三方免鉴权 JSON 服务）
 *
 * 为了尽量少消耗限流额度，所有响应都会写入 sessionStorage 做 TTL 缓存。
 */
import { siteConfig } from '../config'

const GITHUB_API = 'https://api.github.com'

/** 带业务语义的错误，便于 UI 区分展示 */
export class GithubError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'GithubError'
    this.code = code
  }
}

/* ------------------------------------------------------------------ */
/* 缓存                                                                */
/* ------------------------------------------------------------------ */

const cacheKey = (key) => `fantasy-portfolio:${key}`

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(cacheKey(key))
    if (!raw) return null
    const { t, v } = JSON.parse(raw)
    if (Date.now() - t > siteConfig.cacheTTL) {
      sessionStorage.removeItem(cacheKey(key))
      return null
    }
    return v
  } catch {
    // sessionStorage 不可用（隐私模式等）时静默降级为不缓存
    return null
  }
}

function writeCache(key, value) {
  try {
    sessionStorage.setItem(cacheKey(key), JSON.stringify({ t: Date.now(), v: value }))
  } catch {
    /* 配额满或被禁用，忽略 */
  }
}

/** 带缓存的取数包装 */
async function cached(key, loader) {
  const hit = readCache(key)
  if (hit) return hit
  const value = await loader()
  writeCache(key, value)
  return value
}

/** 只清理本站写入的缓存键，不动同源下其它应用的数据 */
export function clearCache() {
  try {
    const prefix = cacheKey('')
    const keys = []
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i)
      if (key?.startsWith(prefix)) keys.push(key)
    }
    keys.forEach((key) => sessionStorage.removeItem(key))
  } catch {
    /* 忽略 */
  }
}

/* ------------------------------------------------------------------ */
/* 通用请求                                                            */
/* ------------------------------------------------------------------ */

async function request(path) {
  let res
  try {
    res = await fetch(`${GITHUB_API}${path}`, {
      headers: { Accept: 'application/vnd.github+json' },
    })
  } catch {
    throw new GithubError('NETWORK', '网络请求失败，请检查网络连接后重试')
  }

  if (res.status === 404) {
    throw new GithubError('NOT_FOUND', 'GitHub 用户不存在或已被删除')
  }
  // 403/429：匿名调用超出配额，GitHub 会在响应头给出重置时间
  if (res.status === 403 || res.status === 429) {
    const reset = Number(res.headers.get('x-ratelimit-reset') || 0) * 1000
    const minutes = reset ? Math.max(1, Math.ceil((reset - Date.now()) / 60000)) : null
    throw new GithubError(
      'RATE_LIMIT',
      minutes
        ? `GitHub 接口访问次数已达上限，约 ${minutes} 分钟后自动恢复`
        : 'GitHub 接口访问次数已达上限，请稍后重试',
    )
  }
  if (!res.ok) {
    throw new GithubError('HTTP', `GitHub 接口返回异常（${res.status}）`)
  }
  return res.json()
}

/* ------------------------------------------------------------------ */
/* 用户资料                                                            */
/* ------------------------------------------------------------------ */

export function fetchUser(username) {
  return cached(`user:${username}`, async () => {
    const u = await request(`/users/${encodeURIComponent(username)}`)
    return {
      login: u.login,
      name: u.name || u.login,
      avatarUrl: u.avatar_url,
      bio: u.bio || '',
      location: u.location || '',
      blog: normalizeUrl(u.blog),
      htmlUrl: u.html_url,
      publicRepos: u.public_repos ?? 0,
      followers: u.followers ?? 0,
      following: u.following ?? 0,
      createdAt: u.created_at,
    }
  })
}

/** GitHub 的 blog 字段常缺协议头，补全后才能安全跳转 */
function normalizeUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `https://${url}`
}

/* ------------------------------------------------------------------ */
/* 仓库列表                                                            */
/* ------------------------------------------------------------------ */

export function fetchRepos(username) {
  return cached(`repos:${username}`, async () => {
    const collected = []
    // 最多翻 3 页（300 个仓库），对个人作品集足够且能兜住接口异常
    for (let page = 1; page <= 3; page += 1) {
      const batch = await request(
        `/users/${encodeURIComponent(username)}/repos` +
          `?per_page=100&type=owner&sort=updated&direction=desc&page=${page}`,
      )
      collected.push(...batch)
      if (batch.length < 100) break
    }

    return collected
      .filter((r) => !r.fork || r.stargazers_count > 0)
      .map((r) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        description: r.description || '',
        htmlUrl: r.html_url,
        homepage: normalizeUrl(r.homepage),
        stars: r.stargazers_count ?? 0,
        forks: r.forks_count ?? 0,
        watchers: r.watchers_count ?? 0,
        issues: r.open_issues_count ?? 0,
        language: r.language || '',
        topics: r.topics || [],
        isFork: Boolean(r.fork),
        isArchived: Boolean(r.archived),
        license: r.license?.spdx_id || '',
        size: r.size ?? 0,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        pushedAt: r.pushed_at,
      }))
      .sort((a, b) => new Date(b.pushedAt || b.updatedAt) - new Date(a.pushedAt || a.updatedAt))
  })
}

/* ------------------------------------------------------------------ */
/* 贡献活跃度（第三方免鉴权服务）                                       */
/* ------------------------------------------------------------------ */

export function fetchContributions(username) {
  return cached(`contrib:${username}`, async () => {
    const url = `${siteConfig.contributionApi}/${encodeURIComponent(username)}?y=all`
    let res
    try {
      res = await fetch(url)
    } catch {
      throw new GithubError('NETWORK', '贡献数据服务请求失败')
    }
    if (!res.ok) {
      throw new GithubError('HTTP', `贡献数据服务返回异常（${res.status}）`)
    }
    const data = await res.json()
    const contributions = Array.isArray(data.contributions) ? data.contributions : []
    return {
      total: Object.values(data.total || {}).reduce((sum, n) => sum + (Number(n) || 0), 0),
      activeDays: contributions.filter((d) => d.count > 0).length,
      contributions,
    }
  })
}

/* ------------------------------------------------------------------ */
/* 派生统计                                                            */
/* ------------------------------------------------------------------ */

/** 从仓库列表汇总出首屏统计卡片所需的数字 */
export function summarize(repos) {
  const totalStars = repos.reduce((sum, r) => sum + r.stars, 0)
  const totalForks = repos.reduce((sum, r) => sum + r.forks, 0)
  const languages = new Map()

  for (const repo of repos) {
    const key = repo.language || 'Other'
    languages.set(key, (languages.get(key) || 0) + 1)
  }

  const languageStats = [...languages.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  return { totalStars, totalForks, languageStats }
}
