// Export unplugin-based implementation
export { default, vite, webpack } from './unplugin.js'
export type { ReactDevToolsPluginOptions } from './unplugin.js'

// Also export Vite plugin for backward compatibility
export { default as vitePlugin } from './vite.js'
export type { ReactDevToolsPluginOptions as VitePluginOptions } from './vite.js'
