/**
 * v-reveal —— 元素进入视口时淡入上移
 * 用法：<div v-reveal>…</div> 或 <div v-reveal="120">（延迟 120ms）
 *
 * 用 IntersectionObserver 而非 scroll 事件，避免滚动时持续触发重排。
 * 若浏览器不支持或用户开启了「减少动态效果」，直接展示不做动画。
 */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

let observer = null

function getObserver() {
  if (observer) return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const el = entry.target
        const delay = Number(el.dataset.revealDelay || 0)
        window.setTimeout(() => el.classList.add('is-revealed'), delay)
        observer.unobserve(el)
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
  )
  return observer
}

export const reveal = {
  mounted(el, binding) {
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      el.classList.add('reveal', 'is-revealed')
      return
    }
    el.classList.add('reveal')
    el.dataset.revealDelay = String(binding.value ?? 0)
    getObserver().observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
