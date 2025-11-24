/**
 * React Scan adapter for React DevTools integration
 */

import type { ComponentPerformanceData, PerformanceSummary, ReactDevtoolsScanOptions, ScanInstance } from './types'
import { getDisplayName } from 'bippy'
import { getOptions as getScanOptions, ReactScanInternals, scan, setOptions as setScanOptions } from 'react-scan'

// Helper to get the shared internals, preferring window global if available
// This ensures that the overlay and the host app share the same React Scan instance
function getGlobalObject(key: string) {
  if (typeof window === 'undefined')
    return undefined

  // Priority 1: Check parent window (Host App)
  // We want to control the Host's react-scan instance from the Overlay
  try {
    if (window.parent && window.parent !== window && (window.parent as any)[key]) {
      console.log(`[Scan Adapter] Found ${key} in parent window (Host)`)
      return (window.parent as any)[key]
    }
  }
  catch (e) {
    // Accessing parent might fail cross-origin
    console.warn(`[Scan Adapter] Failed to access parent window for ${key}`, e)
  }

  // Priority 2: Check current window (Fallback / Local)
  if ((window as any)[key]) {
    console.log(`[Scan Adapter] Found ${key} in current window (Local)`)
    return (window as any)[key]
  }

  return undefined
}

function getInternals() {
  return getGlobalObject('__REACT_SCAN_INTERNALS__') || ReactScanInternals
}

function getSetOptions() {
  return getGlobalObject('__REACT_SCAN_SET_OPTIONS__') || setScanOptions
}

function getGetOptions() {
  return getGlobalObject('__REACT_SCAN_GET_OPTIONS__') || getScanOptions
}

function getScan() {
  return getGlobalObject('__REACT_SCAN_SCAN__') || scan
}

let scanInstance: ScanInstance | null = null
let currentOptions: ReactDevtoolsScanOptions = {}

/**
 * Extract performance data from React Scan internals
 */
function extractPerformanceData(): ComponentPerformanceData[] {
  const performanceData: ComponentPerformanceData[] = []

  try {
    // Access React Scan's internal store
    const { Store } = getInternals()

    if (!Store || !Store.reportData) {
      return performanceData
    }

    // Aggregate data from reportData Map
    const componentStats = new Map<string, {
      renderCount: number
      totalTime: number
      unnecessaryRenders: number
      lastRenderTime: number | null
    }>()

    Store.reportData.forEach((renderData) => {
      const componentName = renderData.componentName || 'Unknown'

      const existing = componentStats.get(componentName) || {
        renderCount: 0,
        totalTime: 0,
        unnecessaryRenders: 0,
        lastRenderTime: null,
      }

      existing.renderCount += renderData.count || 0
      existing.totalTime += renderData.time || 0

      if (renderData.unnecessary) {
        existing.unnecessaryRenders++
      }

      if (renderData.time !== null && renderData.time !== undefined) {
        existing.lastRenderTime = renderData.time
      }

      componentStats.set(componentName, existing)
    })

    // Convert to array format
    componentStats.forEach((stats, componentName) => {
      performanceData.push({
        componentName,
        renderCount: stats.renderCount,
        totalTime: stats.totalTime,
        averageTime: stats.renderCount > 0 ? stats.totalTime / stats.renderCount : 0,
        unnecessaryRenders: stats.unnecessaryRenders,
        lastRenderTime: stats.lastRenderTime,
      })
    })

    // Sort by total time (slowest first)
    performanceData.sort((a, b) => b.totalTime - a.totalTime)
  }
  catch (error) {
    console.error('[Scan Adapter] Failed to extract performance data:', error)
  }

  return performanceData
}

/**
 * Calculate performance summary
 */
function calculatePerformanceSummary(data: ComponentPerformanceData[]): PerformanceSummary {
  const totalRenders = data.reduce((sum, item) => sum + item.renderCount, 0)
  const totalComponents = data.length
  const unnecessaryRenders = data.reduce((sum, item) => sum + item.unnecessaryRenders, 0)
  const totalTime = data.reduce((sum, item) => sum + item.totalTime, 0)
  const averageRenderTime = totalRenders > 0 ? totalTime / totalRenders : 0

  // Get top 10 slowest components
  const slowestComponents = data.slice(0, 10)

  return {
    totalRenders,
    totalComponents,
    unnecessaryRenders,
    averageRenderTime,
    slowestComponents,
  }
}

// Helper to fix canvas styles
function fixCanvasStyle() {
  try {
    // Get the container
    const container = document.querySelector('div[data-react-scan="true"]')
      || (window.parent && window.parent.document.querySelector('div[data-react-scan="true"]'))

    if (container && container instanceof HTMLElement) {
      // Fix container position
      container.style.position = 'fixed'
      container.style.top = '0'
      container.style.left = '0'
      container.style.width = '100vw'
      container.style.height = '100vh'
      container.style.zIndex = '2147483647'
      container.style.pointerEvents = 'none'

      // Also try to access shadow root if possible (though open shadow roots are accessible via property)
      if (container.shadowRoot) {
        const canvas = container.shadowRoot.querySelector('canvas')
        if (canvas) {
          canvas.style.width = '100%'
          canvas.style.height = '100%'
          canvas.style.position = 'absolute'
          canvas.style.top = '0'
          canvas.style.left = '0'
          canvas.style.pointerEvents = 'none'
        }
      }
      console.log('[Scan Adapter] Fixed container/canvas styles')
    }

    // Remove rogue canvases that might be interfering (older instances)
    const rogueCanvases = document.querySelectorAll('canvas[data-react-scan="true"], body > canvas')
    rogueCanvases.forEach((el) => {
      if (el.parentElement !== container && el.parentElement !== container?.shadowRoot && !el.closest('div[data-react-scan="true"]')) {
        // Careful not to remove app canvases, check z-index or style
        const style = window.getComputedStyle(el)
        if (style.position === 'fixed' && style.zIndex && Number.parseInt(style.zIndex) > 2147483000) {
          console.log('[Scan Adapter] Removing duplicate/rogue canvas')
          el.remove()
        }
      }
    })
  }
  catch (e) {
    console.warn('[Scan Adapter] Failed to fix canvas styles:', e)
  }
}

/**
 * Create a scan instance with DevTools integration
 */
function createScanInstance(options: ReactDevtoolsScanOptions): ScanInstance {
  currentOptions = options

  return {
    getOptions: () => currentOptions,

    setOptions: (newOptions: Partial<ReactDevtoolsScanOptions>) => {
      currentOptions = { ...currentOptions, ...newOptions }

      // If enabled, use scan() to ensure instrumentation is re-initialized (canvas restored)
      // setOptions() alone triggers cleanup via initToolbar but doesn't restore new-outlines canvas
      if (currentOptions.enabled) {
        const scanFn = getScan()
        if (scanFn) {
          console.log('[Scan Adapter] Calling scan() to update options and restore canvas')
          scanFn(currentOptions)
          setTimeout(fixCanvasStyle, 100)
        }
        else {
          getSetOptions()(currentOptions)
        }
      }
      else {
        getSetOptions()(currentOptions)
      }

      // Debug logging
      const internals = getInternals()
      console.log('[Scan Adapter] Options updated:', currentOptions)
      console.log('[Scan Adapter] Instrumentation status:', !!internals?.instrumentation)
    },

    start: () => {
      console.log('[Scan Adapter] Starting scan...')
      const internals = getInternals()
      const isGlobal = !!getGlobalObject('__REACT_SCAN_INTERNALS__')
      console.log('[Scan Adapter] Using global internals:', isGlobal)

      if (internals) {
        console.log('[Scan Adapter] Internals keys:', Object.keys(internals))
        console.log('[Scan Adapter] Internals.instrumentation:', internals.instrumentation)
      }
      else {
        console.log('[Scan Adapter] Internals is null/undefined')
      }

      // Check if global hook exists and is wrapped
      if (typeof window !== 'undefined' && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__
        console.log('[Scan Adapter] Global Hook found')
        console.log('[Scan Adapter] Hook keys:', Object.keys(hook))
        // Check if inject is native or wrapped
        if (hook.inject) {
          console.log('[Scan Adapter] Hook inject:', hook.inject.toString().slice(0, 100))
        }
      }
      else {
        console.log('[Scan Adapter] Global Hook NOT found')
      }

      // Use the shared internals to start scanning
      const { instrumentation } = internals || {}
      console.log('[Scan Adapter] Instrumentation available:', !!instrumentation)

      if (instrumentation && instrumentation.isPaused) {
        console.log('[Scan Adapter] Resuming instrumentation')
        instrumentation.isPaused.value = false
      }

      // Force enabled: true to ensure it starts even if previously stopped
      const options = { ...currentOptions, enabled: true }

      // Try to use scan() to re-initialize/start, falling back to setOptions if scan is not available (unlikely)
      // BUT: Only call scan() if we really need to re-init. If we just want to enable, setOptions might be safer
      // to avoid resetting the instrumentation hook if it's already working.
      const scanFn = getScan()

      // Check if we're already instrumented
      const isInstrumented = internals?.instrumentation && !internals.instrumentation.isPaused.value

      if (scanFn && !isInstrumented) {
        console.log('[Scan Adapter] Calling scan() to start/init...')
        scanFn(options)
      }
      else {
        console.log('[Scan Adapter] Already instrumented or scan() missing, using setOptions to enable')
        getSetOptions()(options)
      }

      // Verify instrumentation again after start
      setTimeout(() => {
        try {
          const updatedInternals = getInternals()
          console.log('[Scan Adapter] Instrumentation available after start:', !!updatedInternals?.instrumentation)

          if (updatedInternals?.instrumentation?.isPaused) {
            console.log('[Scan Adapter] Forcing instrumentation.isPaused to false')
            updatedInternals.instrumentation.isPaused.value = false
          }

          // Inspect global hook (Prefer Parent/Host)
          let hook: any = null
          let context = 'Unknown'

          if (typeof window !== 'undefined') {
            if (window.parent && window.parent !== window && (window.parent as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
              hook = (window.parent as any).__REACT_DEVTOOLS_GLOBAL_HOOK__
              context = 'Parent (Host)'
            }
            else if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
              hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__
              context = 'Current (Local)'
            }
          }

          // Check Canvas (in Parent/Host)
          let canvas: Element | null = null
          try {
            if (window.parent && window.parent.document) {
              canvas = window.parent.document.querySelector('div[data-react-scan="true"]')
            }
          }
          catch (e) {}

          if (!canvas) {
            canvas = document.querySelector('div[data-react-scan="true"]') // Fallback to local
          }

          console.log('[Scan Adapter] Canvas exists:', !!canvas)
          if (canvas) {
            const style = window.getComputedStyle(canvas) // Might be wrong if canvas is in parent, but gives hint
            // console.log('[Scan Adapter] Canvas z-index:', style.zIndex, 'visibility:', style.visibility, 'display:', style.display)
          }
        }
        catch (e) {
          console.error('[Scan Adapter] Error in start verify timeout:', e)
        }
      }, 100)

      // Hook into onRender to verify render events
      /* try {
        const internals = getInternals()
        if (internals) {
          const originalOnRender = internals.onRender
          // Only wrap if not already wrapped to avoid recursion/stack overflow if start is called multiple times
          if (!originalOnRender || !originalOnRender.toString().includes('[Scan Adapter Log]')) {
            internals.onRender = (fiber: any, render: any) => {
              // Log first few renders to avoid spam
              if (Math.random() < 0.05) {
                console.log('[Scan Adapter Log] onRender:', getDisplayName(fiber.type))
              }
              if (originalOnRender)
                originalOnRender(fiber, render)
            }
            console.log('[Scan Adapter] Wrapped onRender for logging')
          }
        }
      }
      catch (e) {
        console.error('[Scan Adapter] Failed to wrap onRender:', e)
      }

      } */

      // Update local options
      currentOptions = options
      console.log('[Scan Adapter] Scan started with options:', options)

      // Fix canvas styles after start
      setTimeout(fixCanvasStyle, 100)
    },

    stop: () => {
      console.log('[Scan Adapter] Stopping scan...')
      const options = { ...currentOptions, enabled: false }
      currentOptions = options
      getSetOptions()(options)
    },

    isActive: () => {
      const opts = getGetOptions()()
      if (opts && typeof opts === 'object' && 'value' in opts) {
        return opts.value.enabled === true
      }
      return opts?.enabled === true
    },

    hideToolbar: () => {
      getSetOptions()({ showToolbar: false })
    },

    showToolbar: () => {
      getSetOptions()({ showToolbar: true })
    },

    getToolbarVisibility: () => {
      const opts = getGetOptions()()
      if (opts && typeof opts === 'object' && 'value' in opts) {
        return opts.value.showToolbar !== false
      }
      return opts?.showToolbar !== false
    },

    getPerformanceData: () => {
      return extractPerformanceData()
    },

    getPerformanceSummary: () => {
      const data = extractPerformanceData()
      return calculatePerformanceSummary(data)
    },

    clearPerformanceData: () => {
      try {
        const { Store } = getInternals()
        if (Store?.reportData) {
          Store.reportData.clear()
        }
        if (Store?.legacyReportData) {
          Store.legacyReportData.clear()
        }
      }
      catch (error) {
        console.error('[Scan Adapter] Failed to clear performance data:', error)
      }
    },

    startInspecting: () => {
      try {
        const { Store } = getInternals()
        if (Store?.inspectState) {
          Store.inspectState.value = {
            kind: 'inspecting',
            hoveredDomElement: null,
          }
        }
      }
      catch (error) {
        console.error('[Scan Adapter] Failed to start inspecting:', error)
      }
    },

    stopInspecting: () => {
      try {
        const { Store } = getInternals()
        if (Store?.inspectState) {
          Store.inspectState.value = {
            kind: 'inspect-off',
          }
        }
      }
      catch (error) {
        console.error('[Scan Adapter] Failed to stop inspecting:', error)
      }
    },

    isInspecting: () => {
      try {
        const { Store } = getInternals()
        if (Store?.inspectState) {
          return Store.inspectState.value.kind === 'inspecting'
        }
        return false
      }
      catch {
        return false
      }
    },

    focusComponent: (fiber: any) => {
      try {
        const { Store } = getInternals()
        if (!fiber || !Store?.inspectState)
          return

        // Get the DOM element from the fiber
        let domElement: Element | null = null
        if (fiber.stateNode && fiber.stateNode instanceof Element) {
          domElement = fiber.stateNode
        }

        if (domElement) {
          Store.inspectState.value = {
            kind: 'focused',
            focusedDomElement: domElement,
            fiber,
          }
        }
      }
      catch (error) {
        console.error('[Scan Adapter] Failed to focus component:', error)
      }
    },

    getFocusedComponent: () => {
      try {
        const { Store } = getInternals()
        if (Store?.inspectState) {
          const state = Store.inspectState.value
          if (state.kind === 'focused') {
            return {
              componentName: getDisplayName(state.fiber.type) || 'Unknown',
              fiber: state.fiber,
              domElement: state.focusedDomElement,
            }
          }
        }
        return null
      }
      catch (error) {
        console.error('[Scan Adapter] Failed to get focused component:', error)
        return null
      }
    },

    onInspectStateChange: (callback: (state: any) => void) => {
      try {
        const { Store } = getInternals()
        if (Store?.inspectState) {
          return Store.inspectState.subscribe(callback)
        }
        return () => {}
      }
      catch (error) {
        console.error('[Scan Adapter] Failed to subscribe to inspect state:', error)
        return () => {}
      }
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
