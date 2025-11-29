import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm', 'cjs'],
  // Use es2017 for maximum compatibility with Webpack 4
  // Node 14+ and modern browsers support ES2017
  target: 'es2017',
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
