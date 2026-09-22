/**
 * ECharts 按需引入
 * ------------------------------------------------------------------
 * 只注册用到的图表与组件，相比 `import * as echarts from 'echarts'`
 * 可显著减小打包体积（首屏加载更快）。
 */
import * as echarts from 'echarts/core'
import { HeatmapChart, PieChart } from 'echarts/charts'
import {
  CalendarComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注意：图例与坐标网格由页面自行用 DOM 绘制，故不注册 Legend/Grid 组件，
// 可省下可观的体积。新增图表类型时记得在此补注册。
echarts.use([
  PieChart,
  HeatmapChart,
  TooltipComponent,
  CalendarComponent,
  VisualMapComponent,
  CanvasRenderer,
])

export default echarts
