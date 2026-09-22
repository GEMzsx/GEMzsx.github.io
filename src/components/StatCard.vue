<script setup>
import AppIcon from './AppIcon.vue'
import SkeletonBlock from './SkeletonBlock.vue'

defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], default: null },
  icon: { type: String, default: 'sparkles' },
  hint: { type: String, default: '' },
})
</script>

<template>
  <div class="card card-hover p-4 sm:p-5">
    <div class="flex items-start justify-between gap-3">
      <p class="text-xs font-medium tracking-wide text-slate-400 sm:text-sm">{{ label }}</p>
      <span
        class="grid size-8 place-items-center rounded-lg bg-brand-500/12 text-brand-400 sm:size-9"
      >
        <AppIcon :name="icon" :size="17" />
      </span>
    </div>

    <div class="mt-3">
      <SkeletonBlock v-if="value === null" height="1.85rem" width="4.5rem" rounded="0.4rem" />
      <p v-else class="text-2xl font-bold tabular-nums text-white sm:text-3xl">
        {{ value }}
      </p>
    </div>

    <p v-if="hint" class="mt-1.5 text-[11px] text-slate-500">{{ hint }}</p>
  </div>
</template>
