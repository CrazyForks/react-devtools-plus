import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const DIR_DIST = typeof __dirname !== 'undefined'
  ? __dirname
  : dirname(fileURLToPath(import.meta.url))

export const DIR_OVERLAY = resolve(DIR_DIST, '../../react-devtools-overlay/src')
