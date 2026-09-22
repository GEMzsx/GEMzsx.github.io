<script setup>
/** 骨架屏占位块，加载期间替代真实内容，避免布局跳动 */
defineProps({
  height: { type: String, default: '1rem' },
  width: { type: String, default: '100%' },
  rounded: { type: String, default: '0.5rem' },
})
</script>

<template>
  <div
    class="shimmer bg-white/5"
    :style="{ height, width, borderRadius: rounded }"
    aria-hidden="true"
  />
</template>
