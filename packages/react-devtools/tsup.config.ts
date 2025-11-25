import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/scan.ts'],
  format: ['esm', 'cjs'],
  target: 'node14',
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
  noExternal: [
    '@react-devtools/scan',
  ],
  skipNodeModulesBundle: true,
})
