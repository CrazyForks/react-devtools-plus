import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/vite.ts',
    'src/webpack.ts',
    'src/rspack.ts',
    'src/transform.ts',
    'src/middleware.ts',
    'src/client/record.ts',
    'src/client/listeners.ts',
    'src/client/overlay.ts',
    'src/client/open-in-editor.ts',
  ],
  clean: true,
  format: ['esm', 'cjs'],
  target: 'es2017',
  dts: true,
  shims: true,
})
