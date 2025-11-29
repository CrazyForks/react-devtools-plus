import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import fse from 'fs-extra'
import externalGlobals from 'rollup-plugin-external-globals'
import { defineConfig, Plugin } from 'vite'

/**
 * Banner to inject at the beginning of the bundle
 * Ensures React and ReactDOM are available from window globals
 */
const reactGlobalsBanner = `var React = (typeof window !== 'undefined' ? window.React : undefined) || (typeof global !== 'undefined' ? global.React : undefined);
var ReactDOM = (typeof window !== 'undefined' ? window.ReactDOM : undefined) || (typeof global !== 'undefined' ? global.ReactDOM : undefined);
`

/**
 * Plugin to inject React globals banner at the beginning of chunks
 */
function injectReactGlobals(): Plugin {
  return {
    name: 'inject-react-globals',
    apply: 'build',
    generateBundle(_options, bundle) {
      for (const fileName of Object.keys(bundle)) {
        const chunk = bundle[fileName]
        if (chunk.type === 'chunk' && (fileName.endsWith('.mjs') || fileName.endsWith('.js'))) {
          chunk.code = reactGlobalsBanner + chunk.code
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'vite-plugin-copy-react-devtools-overlay',
      apply: 'build',
      enforce: 'post',
      async closeBundle() {
        const overlayFile = resolve(__dirname, './dist')

        // Copy to vite plugin directory
        fse.copySync(
          overlayFile,
          resolve(__dirname, '../react-devtools/src/overlay'),
        )
      },
    },
  ],
  resolve: {
    alias: {
      '@react-devtools/kit': resolve(__dirname, '../react-devtools-kit/src/index.ts'),
    },
  },
  build: {
    emptyOutDir: false,
    // Target ES2017 for Webpack 4 compatibility (no optional chaining, nullish coalescing)
    target: 'es2017',
    lib: {
      entry: resolve(__dirname, 'src/main.tsx'),
      formats: ['es'],
      fileName: () => 'react-devtools-overlay.mjs',
    },
    rollupOptions: {
      // Mark react and react-dom as external - use host app's versions
      external: ['react', 'react-dom', 'react-dom/client'],
      output: {
        assetFileNames: 'react-devtools-overlay.[ext]',
        // Provide globals for external dependencies
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          'react-dom/client': 'ReactDOM',
        },
      },
      plugins: [
        // Inject React globals banner at the beginning of the bundle
        injectReactGlobals(),
        // Transform external imports to global variable access
        // This ensures compatibility with Webpack 4 + CDN-loaded React
        externalGlobals({
          'react': 'React',
          'react-dom': 'ReactDOM',
          'react-dom/client': 'ReactDOM',
        }),
      ],
    },
  },
})
