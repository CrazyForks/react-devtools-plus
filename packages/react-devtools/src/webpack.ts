/**
 * Webpack Plugin Entry
 *
 * @example
 * ```js
 * const { reactDevToolsPlus } = require('react-devtools-plus/webpack')
 *
 * module.exports = {
 *   plugins: [
 *     reactDevToolsPlus(),
 *   ],
 * }
 * ```
 */

import { webpack } from './unplugin.js'

export { webpack as reactDevToolsPlus }
export default webpack
export type { ReactDevToolsPluginOptions } from './unplugin.js'
