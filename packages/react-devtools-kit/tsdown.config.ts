import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  clean: true,
  format: ['esm', 'cjs'],
  // Use es2017 for maximum compatibility with Webpack 4
  target: 'es2017',
  dts: true,
  shims: true,
  // Bundle these dependencies to avoid pnpm resolution issues in Webpack 4
  noExternal: ['superjson', 'birpc', 'copy-anything', 'is-what'],
})
