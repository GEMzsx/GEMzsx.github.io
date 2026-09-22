<script setup>
import AppIcon from './AppIcon.vue'
import { siteConfig } from '../config'

/** 学习经历 + 研究方向，内容来自 config.js 的自定义补充 */
</script>

<template>
  <section id="about" class="scroll-mt-20">
    <div class="grid gap-5 lg:grid-cols-2">
      <!-- 学习经历 -->
      <div v-if="siteConfig.education?.length" v-reveal class="card p-6 sm:p-7">
        <h2 class="flex items-center gap-2.5 text-lg font-bold text-white">
          <span class="grid size-8 place-items-center rounded-lg bg-brand-500/12 text-brand-400">
            <AppIcon name="book" :size="17" />
          </span>
          学习经历
        </h2>

        <ol class="mt-5 space-y-5 border-l border-white/10 pl-5">
          <li v-for="item in siteConfig.education" :key="item.title" class="relative">
            <span
              class="absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full bg-brand-500 ring-4 ring-brand-500/15"
            />
            <p class="text-xs font-medium text-brand-400">{{ item.period }}</p>
            <h3 class="mt-1 font-semibold text-white">{{ item.title }}</h3>
            <p class="mt-1 text-sm leading-relaxed text-slate-400">{{ item.desc }}</p>
          </li>
        </ol>
      </div>

      <!-- 研究方向 -->
      <div v-if="siteConfig.research?.length" v-reveal="80" class="card p-6 sm:p-7">
        <h2 class="flex items-center gap-2.5 text-lg font-bold text-white">
          <span class="grid size-8 place-items-center rounded-lg bg-aqua-400/12 text-aqua-400">
            <AppIcon name="sparkles" :size="17" />
          </span>
          研究方向
        </h2>

        <ul class="mt-5 space-y-4">
          <li
            v-for="item in siteConfig.research"
            :key="item.title"
            class="rounded-xl border border-white/8 bg-white/3 p-4 transition-colors hover:border-brand-500/35 hover:bg-white/6"
          >
            <h3 class="font-semibold text-white">{{ item.title }}</h3>
            <p class="mt-1 text-sm leading-relaxed text-slate-400">{{ item.desc }}</p>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
