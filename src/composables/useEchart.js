/**
 * ECharts 实例生命周期管理
 * ------------------------------------------------------------------
 * 负责初始化、随配置更新重绘、容器尺寸变化时 resize、卸载时销毁。
 *
 * 关键点：图表容器常被 v-if（加载中 / 无数据）包着，组件 onMounted 时
 * 容器还不存在，因此在 onMounted 里 init 会拿到 null 而永远不渲染。
 * 这里改为 watch 模板 ref，容器一出现就初始化；容器消失则销毁。
 */
import { onBeforeUnmount, ref, watch } from 'vue'
import echarts from '../lib/echarts'

export function useEchart(optionRef) {
  const container = ref(null)
  let chart = null
  let observer = null

  function render() {
    if (!chart || !optionRef.value) return
    // notMerge = true：切换年份时残留的旧数据点必须清掉
    chart.setOption(optionRef.value, true)
  }

  function dispose() {
    observer?.disconnect()
    observer = null
    chart?.dispose()
    chart = null
  }

  function init(el) {
    if (chart || !el) return
    // 容器尺寸为 0 时 init 会生成 0x0 画布且不再自适应，直接跳过等下次
    if (!el.clientWidth || !el.clientHeight) return

    chart = echarts.init(el, null, { renderer: 'canvas' })
    render()

    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => chart?.resize())
      observer.observe(el)
    }
  }

  watch(
    container,
    (el) => {
      if (el) init(el)
      else dispose()
    },
    { immediate: true, flush: 'post' },
  )

  // 数据后到的情况：图表已初始化但当时 option 还是 null
  watch(optionRef, () => {
    if (!chart && container.value) init(container.value)
    else render()
  })

  onBeforeUnmount(dispose)

  return container
}
