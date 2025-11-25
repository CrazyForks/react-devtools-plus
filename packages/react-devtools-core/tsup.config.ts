import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'rpc/index': 'src/rpc/index.ts',
    'client/index': 'src/client/index.ts',
    'plugin/index': 'src/plugin/index.ts',
  },
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
  skipNodeModulesBundle: true,
})
