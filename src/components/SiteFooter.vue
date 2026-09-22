<script setup>
import AppIcon from './AppIcon.vue'
import { siteConfig } from '../config'

const year = new Date().getFullYear()
const githubUrl = `https://github.com/${siteConfig.githubUsername}`
</script>

<template>
  <footer class="mt-20 border-t border-white/8">
    <div class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div class="flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div class="text-center sm:text-left">
          <p class="flex items-center justify-center gap-2 font-semibold text-white sm:justify-start">
            <span
              class="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-aqua-400 text-xs text-white"
            >
              F
            </span>
            {{ siteConfig.siteName }}
          </p>
          <p class="mt-2 text-xs text-slate-500">
            © {{ year }} · 纯前端静态站点，数据实时同步自 GitHub 公开接口
          </p>
        </div>

        <div class="flex items-center gap-2">
          <a
            :href="githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-ghost !px-3 !py-2"
            aria-label="GitHub 主页"
          >
            <AppIcon name="github" :size="16" />
          </a>
          <a href="#top" class="btn-ghost !px-3 !py-2" aria-label="回到顶部">
            <AppIcon name="arrowUp" :size="16" />
          </a>
        </div>
      </div>

      <p class="mt-8 text-center text-[11px] leading-relaxed text-slate-600">
        本页内容由 GitHub 公开数据自动生成，未使用任何后端服务或私有密钥。
      </p>
    </div>
  </footer>
</template>
