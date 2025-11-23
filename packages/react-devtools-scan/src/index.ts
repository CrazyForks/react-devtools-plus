/**
 * React DevTools Scan - Integration layer for react-scan
 *
 * @packageDocumentation
 */

import type { IntegrationMode, ReactDevtoolsScanOptions, ScanInstance } from './types'
import { scan } from 'react-scan'
import { getScanInstance, resetScanInstance } from './adapter'

/**
 * Initialize React Scan with DevTools integration
 *
 * @param options - Configuration options for React Scan
 * @returns Scan instance for further control
 *
 * @example
 * ```typescript
 * import { initScan } from '@react-devtools/scan';
 *
 * // Initialize with default options
 * const scanInstance = initScan();
 *
 * // Initialize with custom options
 * const scanInstance = initScan({
 *   enabled: true,
 *   showToolbar: true,
 *   animationSpeed: 'fast',
 *   trackUnnecessaryRenders: true,
 *   integrationMode: 'overlay'
 * });
 * ```
 */
export function initScan(options: ReactDevtoolsScanOptions = {}): ScanInstance {
  // Set default options
  const defaultOptions: ReactDevtoolsScanOptions = {
    enabled: process.env.NODE_ENV === 'development',
    showToolbar: true,
    integrationMode: 'overlay',
    syncWithDevtools: true,
    ...options,
  }

  // Initialize scan with the options
  scan(defaultOptions)

  // Return the scan instance for further control
  return getScanInstance(defaultOptions)
}

/**
 * Get the current scan instance
 *
 * @returns Current scan instance or null if not initialized
 *
 * @example
 * ```typescript
 * import { getScan } from '@react-devtools/scan';
 *
 * const scanInstance = getScan();
 * if (scanInstance) {
 *   console.log('Scan is active:', scanInstance.isActive());
 * }
 * ```
 */
export function getScan(): ScanInstance | null {
  try {
    return getScanInstance()
  }
  catch {
    return null
  }
}

/**
 * Reset the scan instance (useful for testing)
 *
 * @example
 * ```typescript
 * import { resetScan } from '@react-devtools/scan';
 *
 * // Reset for testing
 * resetScan();
 * ```
 */
export function resetScan(): void {
  resetScanInstance()
}

// Re-export types
export type { IntegrationMode, ReactDevtoolsScanOptions, ScanInstance }

// Re-export plugin
export { createScanPlugin, scanPlugin } from './plugin'
export type { ScanPluginConfig } from './plugin'

// Re-export react-scan exports for convenience
export {
  getOptions,
  onRender,
  scan,
  setOptions,
  useScan,
} from 'react-scan'

// Re-export react-scan types
export type { Options } from 'react-scan'
