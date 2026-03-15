import path from 'node:path'
import { defineConfig } from 'tsup'
import { workerPlugin } from './worker-plugin'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm', 'cjs'],
  // Use es2017 for maximum compatibility with Webpack 4
  // Node 14+ and modern browsers support ES2017
  target: 'es2017',
  dts: {
    resolve: false,
  },
  outDir: 'dist',
  clean: true,
  shims: true,
  splitting: false,
  sourcemap: true,
  external: ['react', 'react-dom'],
  skipNodeModulesBundle: false,
  loader: {
    '.css': 'text',
  },
  esbuildPlugins: [workerPlugin],
  esbuildOptions(options) {
    options.jsx = 'automatic'
    options.jsxImportSource = 'preact'
    options.alias = {
      '~web': path.resolve(__dirname, 'src/web'),
      '~core': path.resolve(__dirname, 'src/core'),
      '~web/assets/css/styles.css': path.resolve(__dirname, 'src/web/assets/css/styles.tailwind.css'),
      'src/core': path.resolve(__dirname, 'src/core'),
      'src/new-outlines': path.resolve(__dirname, 'src/new-outlines'),
    }
  },
})
