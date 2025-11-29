import { resolve } from 'node:path'

/**
 * Directory constants
 * __dirname is provided by:
 * - CJS: Node.js built-in
 * - ESM: tsup banner polyfill (see tsup.config.ts)
 */
export const DIR_DIST = __dirname

// The overlay is in src/overlay relative to package root
// DIR_DIST points to dist/, so we need to go up one level and into src/overlay
export const DIR_OVERLAY = resolve(DIR_DIST, '../src/overlay')
