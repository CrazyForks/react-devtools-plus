import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs'],
      fileName: format => format === 'es' ? 'index.mjs' : 'index.cjs',
    },
    rollupOptions: {
      // React 和 DevTools API 外部化
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@react-devtools-plus/api',
      ],
    },
    // 输出到 dist 目录
    outDir: 'dist',
    emptyOutDir: true,
  },
})
