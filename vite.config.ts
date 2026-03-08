import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心库单独打包
          'react-vendor': ['react', 'react-dom'],
          // Framer Motion 动画库单独打包
          'animation': ['framer-motion'],
          // Lucide 图标库单独打包
          'icons': ['lucide-react'],
          // PDF导出相关库单独打包
          'export': ['html2canvas', 'jspdf'],
        },
      },
    },
    // 提高 chunk 大小警告阈值
    chunkSizeWarningLimit: 1000,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 启用源码映射用于生产环境调试
    sourcemap: false,
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        // 生产环境移除 console
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // 开发服务器优化
  server: {
    // 启用 gzip 压缩
    host: true,
    port: 5173,
  },
  // 预构建优化
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
  },
})
