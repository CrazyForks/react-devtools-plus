/**
 * React Scan adapter for React DevTools integration
 * Provides a clean interface to control React Scan from the DevTools UI
 */

import type { ComponentPerformanceData, PerformanceSummary, ReactDevtoolsScanOptions, ScanInstance } from './types'
import { getDisplayName } from 'bippy'
import { getOptions as getScanOptions, ReactScanInternals, scan, setOptions as setScanOptions } from 'react-scan'

// Helper to get shared internals from global window
function getGlobalObject(key: string) {
  if (typeof window === 'undefined')
    return undefined

  // Check parent window (Host App) first
  try {
    if (window.parent && window.parent !== window && (window.parent as any)[key]) {
      return (window.parent as any)[key]
    }
  }
  catch (e) {
    // Accessing parent might fail cross-origin
  }

  // Fallback to current window
  if ((window as any)[key]) {
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

/**
 * Update toolbar visibility in the shadow DOM
 */
function updateToolbarVisibility(visible: boolean) {
  if (typeof document === 'undefined')
    return

  try {
    const update = () => {
      const root = document.getElementById('react-scan-root')
      if (!root || !root.shadowRoot)
        return

      let style = root.shadowRoot.getElementById('react-scan-devtools-style')
      if (!style) {
        style = document.createElement('style')
        style.id = 'react-scan-devtools-style'
        root.shadowRoot.appendChild(style)
      }

      style.textContent = visible ? '' : '#react-scan-toolbar { display: none !important; }'
    }

    // Try immediately
    update()

    // And retry in next frame to ensure DOM is ready if just initialized
    requestAnimationFrame(update)
    // And one more time for good measure given React Scan's async nature
    setTimeout(update, 100)
  }
  catch (e) {
    // Ignore errors
  }
}

let scanInstance: ScanInstance | null = null
let currentOptions: ReactDevtoolsScanOptions = {}

// Internal FPS counter
let fps = 60
let frameCount = 0
let lastTime = typeof performance !== 'undefined' ? performance.now() : Date.now()

const updateFPS = () => {
  if (typeof performance === 'undefined' || typeof requestAnimationFrame === 'undefined')
    return

  frameCount++
  const now = performance.now()
  if (now - lastTime >= 1000) {
    fps = frameCount
    frameCount = 0
    lastTime = now
  }
  requestAnimationFrame(updateFPS)
}

// Start FPS tracking
if (typeof requestAnimationFrame !== 'undefined') {
  requestAnimationFrame(updateFPS)
}

/**
 * Extract performance data from React Scan internals
 */
function extractPerformanceData(): ComponentPerformanceData[] {
  const performanceData: ComponentPerformanceData[] = []

  try {
    const { Store } = getInternals()

    if (!Store || !Store.reportData) {
      return performanceData
    }

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

    performanceData.sort((a, b) => b.totalTime - a.totalTime)
  }
  catch (error) {
    console.error('[React Scan] Failed to extract performance data:', error)
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
  const slowestComponents = data.slice(0, 10)

  return {
    totalRenders,
    totalComponents,
    unnecessaryRenders,
    averageRenderTime,
    slowestComponents,
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

      // We need to force showToolbar to true in the actual options passed to react-scan
      // so that the container/inspector is initialized. We'll handle visibility via CSS.
      const effectiveOptions = { ...currentOptions }
      if (effectiveOptions.enabled) {
        effectiveOptions.showToolbar = true
      }

      if (currentOptions.enabled) {
        const scanFn = getScan()
        if (scanFn) {
          scanFn(effectiveOptions)
        }
        else {
          getSetOptions()(effectiveOptions)
        }

        // Apply visibility override
        updateToolbarVisibility(!!currentOptions.showToolbar)
      }
      else {
        getSetOptions()(effectiveOptions)
      }
    },

    start: () => {
      const internals = getInternals()
      const { instrumentation } = internals || {}

      if (instrumentation && instrumentation.isPaused) {
        instrumentation.isPaused.value = false
      }

      const options = { ...currentOptions, enabled: true }
      // Force showToolbar to true
      const effectiveOptions = { ...options, showToolbar: true }

      const scanFn = getScan()
      const isInstrumented = internals?.instrumentation && !internals.instrumentation.isPaused.value

      // Only reinitialize if not already instrumented
      if (scanFn) {
        // Always call scanFn to ensure options are applied and it's active
        // Even if instrumented, we need to ensure it's using our options
        scanFn(effectiveOptions)
      }
      else {
        // Fallback to setOptions if scanFn not available
        const current = getGetOptions()()?.value || {}
        const hasChanges = Object.keys(effectiveOptions).some((key) => {
          return effectiveOptions[key as keyof ReactDevtoolsScanOptions] !== current[key as keyof typeof current]
        })

        if (hasChanges || !isInstrumented) {
          getSetOptions()(effectiveOptions)
        }
      }

      currentOptions = options
      // Apply visibility override
      updateToolbarVisibility(!!currentOptions.showToolbar)
    },

    stop: () => {
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
      currentOptions.showToolbar = false
      updateToolbarVisibility(false)
    },

    showToolbar: () => {
      currentOptions.showToolbar = true
      updateToolbarVisibility(true)
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
        console.error('[React Scan] Failed to clear performance data:', error)
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
        console.error('[React Scan] Failed to start inspecting:', error)
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
        console.error('[React Scan] Failed to stop inspecting:', error)
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
        console.error('[React Scan] Failed to focus component:', error)
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
        console.error('[React Scan] Failed to get focused component:', error)
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
        console.error('[React Scan] Failed to subscribe to inspect state:', error)
        return () => {}
      }
    },

    getFPS: () => fps,
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
