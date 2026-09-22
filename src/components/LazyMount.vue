<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * 延迟挂载插槽内容，直到容器接近视口。
 * 用途：ECharts 打包体积较大（约 180KB gzip），放在首屏会拖慢加载。
 * 放在页面下方、等用户快滚到时再加载，首屏 JS 因此小了约 3/4。
 */
const props = defineProps({
  /** 提前多少像素开始加载，留出加载缓冲 */
  rootMargin: { type: String, default: '400px' },
})

const el = ref(null)
const visible = ref(false)
let observer = null

onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') {
    visible.value = true
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return
      visible.value = true
      observer.disconnect()
      observer = null
    },
    { rootMargin: props.rootMargin },
  )
  observer.observe(el.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div ref="el" class="min-w-0">
    <slot v-if="visible" />
    <slot v-else name="placeholder" />
  </div>
</template>
