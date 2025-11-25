import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  clean: true,
  format: ['esm', 'cjs'],
  target: 'node14',
  dts: true,
  shims: true,
})
