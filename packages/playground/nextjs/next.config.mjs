/**
 * Next.js Playground Configuration
 * 
 * This demonstrates the simplified React DevTools integration.
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { withReactDevTools } from '@react-devtools/nextjs'
import { webpack as ReactDevToolsPlugin } from 'react-devtools/webpack'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Define your custom plugins
const devToolsPlugins = [
  {
    name: 'my-plugin-nextjs',
    view: {
      title: 'My Plugin (Next.js)',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>',
      src: path.resolve(__dirname, './src/plugins/MyPlugin.jsx'),
    },
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile workspace packages to ensure they work with Next.js
  transpilePackages: [
    '@react-devtools/overlay',
    '@react-devtools/core',
    '@react-devtools/kit',
    '@react-devtools/scan',
    '@react-devtools/shared',
    '@react-devtools/nextjs',
    '@react-devtools/ui',
  ],
  // Add webpack plugin manually (required for Next.js ESM config)
  webpack: (config, { isServer, dev }) => {
    if (dev && !isServer) {
      config.plugins.push(
        ReactDevToolsPlugin({
          enabledEnvironments: ['development'],
          plugins: devToolsPlugins,
        })
      )
    }
    return config
  },
}

// Wrap with React DevTools for additional setup
export default withReactDevTools(nextConfig, {
  plugins: devToolsPlugins,
})
