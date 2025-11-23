import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    resolve: true,
  },
  outDir: 'dist',
  shims: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  external: [
    'vite',
    'webpack',
    'react',
    'react-dom',
  ],
  skipNodeModulesBundle: true,
})
