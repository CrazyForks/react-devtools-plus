import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  external: ['react-devtools-plus', 'react'],
  shims: true, // Inject shims for __dirname, import.meta.url, etc.
  onSuccess: async () => {
    // Copy plugin source files to dist so they can be loaded by the DevTools server
    const srcPlugins = resolve(__dirname, 'src/plugins')
    const distPlugins = resolve(__dirname, 'dist/plugins')

    if (!existsSync(distPlugins)) {
      mkdirSync(distPlugins, { recursive: true })
    }

    cpSync(srcPlugins, distPlugins, { recursive: true })
  },
})
