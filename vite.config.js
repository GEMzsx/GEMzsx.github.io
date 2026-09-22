import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // 相对路径产物，部署在任意路径下都能正常加载
  // （用户主页 GEMzsx.github.io 是根路径，项目页是 /<repo>/ 子路径，两者通用）
  base: './',
  plugins: [vue(), tailwindcss()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          echarts: ['echarts/core', 'echarts/charts', 'echarts/components', 'echarts/renderers'],
        },
      },
    },
  },
})
