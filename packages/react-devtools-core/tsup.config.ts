import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'rpc/index': 'src/rpc/index.ts',
    'client/index': 'src/client/index.ts',
    'plugin/index': 'src/plugin/index.ts',
  },
  format: ['esm', 'cjs'],
  // Use es2017 for maximum compatibility with Webpack 4
  target: 'es2017',
  dts: {
    resolve: true,
  },
  outDir: 'dist',
  shims: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  // Bundle these dependencies to avoid pnpm resolution issues in Webpack 4
  noExternal: ['superjson', 'birpc', 'copy-anything', 'is-what'],
  skipNodeModulesBundle: false,
})
