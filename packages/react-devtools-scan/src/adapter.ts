/**
 * React Scan adapter for React DevTools integration
 */

import type { ReactDevtoolsScanOptions, ScanInstance } from './types'
import { getOptions as getScanOptions, scan, setOptions as setScanOptions } from 'react-scan'

let scanInstance: ScanInstance | null = null
let currentOptions: ReactDevtoolsScanOptions = {}

/**
 * Create a scan instance with DevTools integration
 */
function createScanInstance(options: ReactDevtoolsScanOptions): ScanInstance {
  currentOptions = options

  return {
    getOptions: () => currentOptions,

    setOptions: (newOptions: Partial<ReactDevtoolsScanOptions>) => {
      currentOptions = { ...currentOptions, ...newOptions }
      setScanOptions(currentOptions)
    },

    start: () => {
      if (currentOptions.enabled !== false) {
        scan(currentOptions)
      }
    },

    stop: () => {
      setScanOptions({ enabled: false })
    },

    isActive: () => {
      const opts = getScanOptions()
      return opts?.enabled === true
    },
  }
}

/**
 * Get or create the scan instance
 */
export function getScanInstance(options?: ReactDevtoolsScanOptions): ScanInstance {
  if (!scanInstance && options) {
    scanInstance = createScanInstance(options)
  }

  if (!scanInstance) {
    throw new Error('Scan instance not initialized. Call initScan first.')
  }

  return scanInstance
}

/**
 * Reset the scan instance
 */
export function resetScanInstance(): void {
  scanInstance = null
  currentOptions = {}
}
