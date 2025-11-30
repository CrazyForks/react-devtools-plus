/**
 * @react-devtools/nextjs
 * 
 * Seamless React DevTools integration for Next.js applications.
 * 
 * Usage in next.config.mjs:
 * ```js
 * import { withReactDevTools } from '@react-devtools/nextjs'
 * 
 * export default withReactDevTools({
 *   // your next config
 * }, {
 *   // optional devtools options
 *   plugins: [...],
 * })
 * ```
 */

import type { NextConfig } from 'next'
import type { ReactDevToolsPluginOptions } from 'react-devtools'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export interface NextjsDevToolsOptions extends ReactDevToolsPluginOptions {
  /**
   * Base path for DevTools API routes
   * @default '/api/devtools'
   */
  apiBasePath?: string
  /**
   * Project root for source path resolution
   * @default process.cwd()
   */
  projectRoot?: string
  /**
   * Whether to inject source path attributes
   * @default true
   */
  injectSource?: boolean
}

/**
 * Get the path to the source-attribute-loader
 */
function getLoaderPath(): string | null {
  // Try to find the loader in react-devtools package
  const possiblePaths = [
    // When installed as dependency
    path.resolve(__dirname, '../../react-devtools/dist/utils/source-attribute-loader.cjs'),
    // In monorepo development
    path.resolve(__dirname, '../../../react-devtools/dist/utils/source-attribute-loader.cjs'),
  ]

  for (const loaderPath of possiblePaths) {
    if (fs.existsSync(loaderPath)) {
      return loaderPath
    }
  }

  // Try to resolve from node_modules
  try {
    const reactDevToolsPath = require.resolve('react-devtools')
    const loaderPath = path.resolve(path.dirname(reactDevToolsPath), 'utils/source-attribute-loader.cjs')
    if (fs.existsSync(loaderPath)) {
      return loaderPath
    }
  }
  catch {
    // Ignore resolution errors
  }

  return null
}

/**
 * Wrap your Next.js config with React DevTools integration
 */
export function withReactDevTools(
  nextConfig: NextConfig = {},
  devToolsOptions: NextjsDevToolsOptions = {}
): NextConfig {
  const { 
    apiBasePath = '/api/devtools', 
    projectRoot = process.cwd(),
    injectSource = true,
    ...pluginOptions 
  } = devToolsOptions

  return {
    ...nextConfig,
    
    // Ensure required packages are transpiled
    transpilePackages: [
      ...(nextConfig.transpilePackages || []),
      '@react-devtools/overlay',
      '@react-devtools/core',
      '@react-devtools/kit',
      '@react-devtools/scan',
      '@react-devtools/nextjs',
    ],

    // Extend webpack config
    webpack: (config, context) => {
      const { isServer, dev } = context

      // Add source attribute loader for client-side dev builds
      if (dev && !isServer && injectSource) {
        const loaderPath = getLoaderPath()
        
        if (loaderPath) {
          console.log('[React DevTools] Adding source attribute loader to Next.js webpack config')
          console.log('[React DevTools] Loader path:', loaderPath)
          
          // Add as a pre-loader to process JSX/TSX files
          config.module.rules.unshift({
            test: /\.[jt]sx$/,
            exclude: /node_modules/,
            enforce: 'pre',
            use: [
              {
                loader: loaderPath,
                options: {
                  projectRoot,
                  sourcePathMode: 'relative',
                },
              },
            ],
          })
        }
        else {
          console.warn('[React DevTools] Source attribute loader not found. "Open in Editor" feature may not work.')
        }
      }

      // Apply user's webpack config
      if (typeof nextConfig.webpack === 'function') {
        config = nextConfig.webpack(config, context)
      }
      return config
    },

    // Store config for runtime access using NEXT_PUBLIC_ prefix
    env: {
      ...nextConfig.env,
      NEXT_PUBLIC_REACT_DEVTOOLS_API_BASE_PATH: apiBasePath,
      NEXT_PUBLIC_REACT_DEVTOOLS_OPTIONS: JSON.stringify(pluginOptions),
    },
  }
}

// Re-export types
export type { ReactDevToolsPluginOptions }

// Default export for convenience
export default withReactDevTools
