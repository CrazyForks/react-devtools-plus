/**
 * Type definitions for React DevTools Scan integration
 */

import type { Options as ReactScanOptions } from 'react-scan'

/**
 * Integration modes for React Scan
 */
export type IntegrationMode = 'overlay' | 'panel' | 'both'

/**
 * Extended options for React DevTools Scan integration
 */
export interface ReactDevtoolsScanOptions extends ReactScanOptions {
  /**
   * Integration mode - how scan should be displayed
   * - 'overlay': Show as overlay on the page (default react-scan behavior)
   * - 'panel': Integrate into DevTools panel
   * - 'both': Show both overlay and panel integration
   *
   * @default 'overlay'
   */
  integrationMode?: IntegrationMode

  /**
   * Whether to sync state with DevTools panel
   *
   * @default true
   */
  syncWithDevtools?: boolean
}

/**
 * Scan instance interface
 */
export interface ScanInstance {
  /**
   * Get current scan options
   */
  getOptions: () => ReactDevtoolsScanOptions

  /**
   * Update scan options at runtime
   */
  setOptions: (options: Partial<ReactDevtoolsScanOptions>) => void

  /**
   * Start scanning
   */
  start: () => void

  /**
   * Stop scanning
   */
  stop: () => void

  /**
   * Check if scanning is active
   */
  isActive: () => boolean
}
