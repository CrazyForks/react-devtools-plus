import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm', 'cjs'],
  target: 'node14',
  dts: {
    resolve: true,
  },
  outDir: 'dist',
  clean: true,
  shims: true,
  splitting: false,
  sourcemap: true,
  external: ['react', 'react-dom'],
  noExternal: ['react-scan'],
  skipNodeModulesBundle: false,
})
