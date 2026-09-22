<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import SkeletonBlock from './SkeletonBlock.vue'
import { siteConfig } from '../config'
import { useGithubData } from '../composables/useGithubData'

const { user, loading, totalStars } = useGithubData()

const joinYear = computed(() => {
  if (!user.value?.createdAt) return ''
  return new Date(user.value.createdAt).getFullYear()
})

const intro = computed(
  () => siteConfig.tagline || user.value?.bio || '这个人很低调，还没有填写个人简介。',
)

const metaItems = computed(() => {
  const u = user.value
  if (!u) return []
  const items = []
  if (u.location) items.push({ icon: 'location', text: u.location })
  if (joinYear.value) items.push({ icon: 'calendar', text: `${joinYear.value} 年加入 GitHub` })
  if (u.blog) items.push({ icon: 'external', text: u.blog.replace(/^https?:\/\//, ''), href: u.blog })
  return items
})
</script>

<template>
  <section id="profile" class="scroll-mt-20">
    <div class="card overflow-hidden">
      <!-- 顶部渐变条 -->
      <div class="h-24 bg-gradient-to-r from-brand-600/70 via-brand-500/40 to-aqua-400/40 sm:h-32" />

      <div class="px-5 pb-7 sm:px-8 sm:pb-9">
        <div class="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:gap-6">
          <!-- 头像 -->
          <div
            class="size-24 shrink-0 overflow-hidden rounded-2xl border-4 border-ink-900 bg-ink-800 shadow-xl sm:size-28"
          >
            <img
              v-if="user"
              :src="user.avatarUrl"
              :alt="`${user.login} 的 GitHub 头像`"
              width="112"
              height="112"
              class="size-full object-cover"
              loading="eager"
            />
            <div v-else class="shimmer size-full" />
          </div>

          <div class="flex-1 sm:pb-1">
            <SkeletonBlock v-if="!user" height="1.75rem" width="12rem" />
            <h1 v-else class="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {{ user.name }}
            </h1>

            <p v-if="user" class="mt-1 text-sm text-slate-400">
              @{{ user.login }}
            </p>
          </div>

          <div class="flex flex-wrap gap-2 sm:pb-1">
            <a
              :href="`https://github.com/${siteConfig.githubUsername}`"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-primary"
            >
              <AppIcon name="github" :size="17" />
              <span>访问主页</span>
            </a>
            <a
              v-if="user?.blog"
              :href="user.blog"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-ghost"
            >
              <AppIcon name="external" :size="16" />
              <span>博客</span>
            </a>
          </div>
        </div>

        <!-- 简介 -->
        <p class="mt-6 max-w-3xl text-[15px] leading-relaxed text-slate-300">
          {{ intro }}
        </p>
        <p
          v-if="user?.bio && siteConfig.tagline && user.bio !== siteConfig.tagline"
          class="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500"
        >
          {{ user.bio }}
        </p>

        <!-- 元信息 -->
        <ul v-if="metaItems.length" class="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
          <li v-for="item in metaItems" :key="item.text" class="flex items-center gap-1.5 text-sm text-slate-400">
            <AppIcon :name="item.icon" :size="15" />
            <a
              v-if="item.href"
              :href="item.href"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-brand-400"
            >{{ item.text }}</a>
            <span v-else>{{ item.text }}</span>
          </li>
          <li
            v-if="user"
            class="flex items-center gap-1.5 text-sm text-slate-400"
            :title="`累计获得 ${totalStars} 个 Star`"
          >
            <AppIcon name="users" :size="15" />
            <span>{{ user.followers }} 位关注者</span>
          </li>
        </ul>

        <!-- 技术标签 -->
        <div v-if="siteConfig.techStack?.length" class="mt-6">
          <h2 class="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
            <AppIcon name="code" :size="14" />
            技术栈
          </h2>
          <ul class="flex flex-wrap gap-2">
            <li v-for="tag in siteConfig.techStack" :key="tag" class="chip">
              {{ tag }}
            </li>
          </ul>
        </div>

        <!-- 加载中的提示 -->
        <p v-if="loading && !user" class="mt-6 text-sm text-slate-500">正在同步 GitHub 数据…</p>
      </div>
    </div>
  </section>
</template>
