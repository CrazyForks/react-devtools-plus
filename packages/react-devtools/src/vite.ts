/**
 * Vite Plugin Entry
 *
 * @example
 * ```ts
 * import { reactDevToolsPlus } from 'react-devtools-plus/vite'
 *
 * export default defineConfig({
 *   plugins: [
 *     react(),
 *     reactDevToolsPlus(),
 *   ],
 * })
 * ```
 */

import { vite } from './unplugin.js'

export { vite as reactDevToolsPlus }
export default vite
export type { ReactDevToolsPluginOptions } from './unplugin.js'
