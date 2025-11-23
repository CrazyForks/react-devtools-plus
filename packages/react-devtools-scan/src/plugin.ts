/**
 * React Scan Plugin for React DevTools
 *
 * This plugin integrates React Scan into the React DevTools plugin system,
 * providing performance monitoring and analysis capabilities.
 */

import type { ReactDevtoolsScanOptions, ScanInstance } from './types'
import { scan } from 'react-scan'
import { getScanInstance, resetScanInstance } from './adapter'

/**
 * React Scan plugin configuration
 */
export interface ScanPluginConfig extends ReactDevtoolsScanOptions {
  /**
   * Whether to auto-start scan on plugin load
   * @default true
   */
  autoStart?: boolean
}

/**
 * Create React Scan plugin
 *
 * @param config - Plugin configuration
 * @returns DevTools plugin instance
 *
 * @example
 * ```typescript
 * import { createScanPlugin } from '@react-devtools/scan/plugin';
 *
 * const scanPlugin = createScanPlugin({
 *   enabled: true,
 *   showToolbar: true,
 *   autoStart: true,
 * });
 * ```
 */
export function createScanPlugin(config: ScanPluginConfig = {}): any {
  let scanInstance: ScanInstance | null = null
  let context: any = null

  const {
    autoStart = true,
    ...scanOptions
  } = config

  return {
    id: 'react-scan',
    name: 'React Scan',
    description: 'Performance monitoring and analysis for React applications',
    version: '1.0.0',

    /**
     * Plugin setup
     */
    async setup(ctx: any) {
      context = ctx
      console.log('[React Scan Plugin] Setting up...')

      // Initialize scan if autoStart is enabled
      if (autoStart) {
        scan({
          enabled: true,
          showToolbar: true,
          ...scanOptions,
        })
        scanInstance = getScanInstance({
          enabled: true,
          showToolbar: true,
          ...scanOptions,
        })
        console.log('[React Scan Plugin] Scan instance initialized and started')
      }

      // Listen for component tree changes if context supports it
      if (ctx.on) {
        ctx.on('component-tree-changed', (event: any) => {
          console.log('[React Scan Plugin] Component tree changed:', event)
        })
      }

      // Register RPC functions if context supports it
      if (ctx.registerRPC) {
        ctx.registerRPC('getScanOptions', () => {
          try {
            const scan = getScanInstance()
            return scan?.getOptions() || null
          }
          catch {
            return null
          }
        })

        ctx.registerRPC('setScanOptions', (options: Partial<ReactDevtoolsScanOptions>) => {
          try {
            const scan = getScanInstance()
            if (scan) {
              scan.setOptions(options)
              return true
            }
            return false
          }
          catch {
            return false
          }
        })

        ctx.registerRPC('startScan', () => {
          try {
            const scan = getScanInstance()
            if (scan) {
              scan.start()
              return true
            }
            return false
          }
          catch {
            return false
          }
        })

        ctx.registerRPC('stopScan', () => {
          try {
            const scan = getScanInstance()
            if (scan) {
              scan.stop()
              return true
            }
            return false
          }
          catch {
            return false
          }
        })

        ctx.registerRPC('isScanActive', () => {
          try {
            const scan = getScanInstance()
            return scan?.isActive() || false
          }
          catch {
            return false
          }
        })
      }

      console.log('[React Scan Plugin] Setup complete')
    },

    /**
     * Plugin teardown
     */
    async teardown() {
      console.log('[React Scan Plugin] Tearing down...')

      if (scanInstance) {
        scanInstance.stop()
        scanInstance = null
      }

      resetScanInstance()
      context = null
      console.log('[React Scan Plugin] Teardown complete')
    },

    /**
     * RPC methods exposed to other plugins
     */
    rpc: {
      /**
       * Get current scan options
       */
      getOptions: () => {
        try {
          const scan = getScanInstance()
          return scan?.getOptions() || null
        }
        catch {
          return null
        }
      },

      /**
       * Set scan options
       */
      setOptions: (options: Partial<ReactDevtoolsScanOptions>) => {
        try {
          const scan = getScanInstance()
          if (scan) {
            scan.setOptions(options)
            return true
          }
          return false
        }
        catch {
          return false
        }
      },

      /**
       * Start scan
       */
      start: () => {
        try {
          const scanInst = getScanInstance()
          if (scanInst) {
            scanInst.start()
            return true
          }
          // Auto-initialize if not started
          if (!scanInstance) {
            scan(config)
            scanInstance = getScanInstance(config)
            return true
          }
          return false
        }
        catch {
          return false
        }
      },

      /**
       * Stop scan
       */
      stop: () => {
        try {
          const scan = getScanInstance()
          if (scan) {
            scan.stop()
            return true
          }
          return false
        }
        catch {
          return false
        }
      },

      /**
       * Check if scan is active
       */
      isActive: () => {
        try {
          const scan = getScanInstance()
          return scan?.isActive() || false
        }
        catch {
          return false
        }
      },
    },

    /**
     * Event handlers
     */
    on: {
      'component-mounted': (event: any) => {
        // React Scan will automatically track component mounts
        // This is just for additional logging if needed
        if (process.env.NODE_ENV === 'development') {
          console.log('[React Scan Plugin] Component mounted:', event.componentId)
        }
      },

      'component-updated': (event: any) => {
        // React Scan will automatically track component updates
        // This is just for additional logging if needed
        if (process.env.NODE_ENV === 'development') {
          console.log('[React Scan Plugin] Component updated:', event.componentId)
        }
      },
    },
  }
}

/**
 * Default React Scan plugin instance
 */
export const scanPlugin = createScanPlugin()
