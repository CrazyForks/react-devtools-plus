import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    middleware: 'src/middleware.ts',
    client: 'src/client.tsx',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom', 'next'],
  shims: true,
})

