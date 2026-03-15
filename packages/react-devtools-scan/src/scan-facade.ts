/**
 * Scan Facade — direct integration with the local scan engine.
 *
 * Replaces the old adapter.ts that bridged the DevTools to an external
 * react-scan package via window globals. All engine access is now through
 * direct ES-module imports.
 */

import {
  type AggregatedChanges,
  type ChangeInfo,
  type ComponentPerformanceData,
  type ComponentTreeNode,
  type FocusedComponentRenderInfo,
  type PerformanceSummary,
  type ReactDevtoolsScanOptions,
  type ScanInstance,
} from './types'
import { _fiberRoots, getDisplayName, getFiberId, isCompositeFiber } from 'bippy'
import {
  addOnRenderListener,
  getOptions as getScanOptions,
  getRenderCount,
  ReactScanInternals,
  scan,
  setOptions as setScanOptions,
  Store,
} from './core/index'

// ─── Serialisation ──────────────────────────────────────────────────────────

function serializeValue(value: unknown): unknown {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value === 'function') return `[Function: ${(value as Function).name || 'anonymous'}]`
  if (typeof value === 'symbol') return `[Symbol: ${(value as symbol).description || ''}]`
  if (value instanceof Element) return `[Element: ${value.tagName}]`
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      if (value.length > 10) return `[Array(${value.length})]`
      return value.map(serializeValue)
    }
    if ((value as any).$$typeof) return '[React Element]'
    try {
      const keys = Object.keys(value as object)
      if (keys.length > 20) return `[Object with ${keys.length} keys]`
      const out: Record<string, unknown> = {}
      for (const k of keys.slice(0, 20)) {
        out[k] = serializeValue((value as any)[k])
      }
      return out
    } catch {
      return '[Object]'
    }
  }
  return value
}

// ─── Component tree ─────────────────────────────────────────────────────────

function getFiberRenderCount(fiber: any): number {
  try {
    return getRenderCount(getFiberId(fiber))
  } catch {
    return 0
  }
}

function collectCompositeDescendants(
  fiber: any,
  depth: number,
  maxDepth: number,
  results: ComponentTreeNode[],
): void {
  if (!fiber || depth > maxDepth) return
  try {
    const name = getDisplayName(fiber.type)
    if (isCompositeFiber(fiber) && name) {
      const node = buildTreeNode(fiber, depth, maxDepth)
      if (node) results.push(node)
    } else {
      let child = fiber.child
      while (child) {
        collectCompositeDescendants(child, depth, maxDepth, results)
        child = child.sibling
      }
    }
  } catch {
    // ignore
  }
}

function buildTreeNode(fiber: any, depth = 0, maxDepth = 50): ComponentTreeNode | null {
  if (!fiber || depth > maxDepth) return null
  try {
    const name = getDisplayName(fiber.type)
    if (isCompositeFiber(fiber) && name) {
      const node: ComponentTreeNode = {
        id: String(getFiberId(fiber)),
        name,
        type: typeof fiber.type === 'function' ? 'function' : 'class',
        renderCount: getFiberRenderCount(fiber),
        lastRenderTime: 0,
        children: [],
      }
      let child = fiber.child
      while (child) {
        collectCompositeDescendants(child, depth + 1, maxDepth, node.children)
        child = child.sibling
      }
      return node
    }
    // Non-composite: collect composite descendants
    const compositeChildren: ComponentTreeNode[] = []
    let child = fiber.child
    while (child) {
      collectCompositeDescendants(child, depth, maxDepth, compositeChildren)
      child = child.sibling
    }
    return compositeChildren.length === 1 ? compositeChildren[0] : null
  } catch {
    return null
  }
}

function extractComponentTree(): ComponentTreeNode[] {
  const trees: ComponentTreeNode[] = []
  try {
    // _fiberRoots from bippy is actually a Set (iterable) at runtime
    const roots = _fiberRoots as unknown as Set<any>
    if (typeof (roots as any).forEach === 'function') {
      roots.forEach((root: any) => {
        const rootFiber = root.current || root
        if (!rootFiber) return
        let child = rootFiber.child
        while (child) {
          const node = buildTreeNode(child, 0)
          if (node) trees.push(node)
          child = child.sibling
        }
      })
    }
  } catch {
    // ignore
  }
  return trees
}

// ─── Performance data ────────────────────────────────────────────────────────

function extractPerformanceData(): ComponentPerformanceData[] {
  const performanceData: ComponentPerformanceData[] = []
  try {
    if (!Store.reportData) return performanceData

    const componentStats = new Map<string, {
      renderCount: number
      totalTime: number
      unnecessaryRenders: number
      lastRenderTime: number | null
    }>()

    Store.reportData.forEach((renderData) => {
      const componentName = renderData.componentName || 'Unknown'
      const existing = componentStats.get(componentName) ?? {
        renderCount: 0,
        totalTime: 0,
        unnecessaryRenders: 0,
        lastRenderTime: null,
      }
      existing.renderCount += renderData.count || 0
      existing.totalTime += renderData.time || 0
      if (renderData.unnecessary) existing.unnecessaryRenders++
      if (renderData.time != null) existing.lastRenderTime = renderData.time
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
  } catch {
    // ignore
  }
  return performanceData
}

function calculatePerformanceSummary(data: ComponentPerformanceData[]): PerformanceSummary {
  const totalRenders = data.reduce((s, i) => s + i.renderCount, 0)
  const totalTime = data.reduce((s, i) => s + i.totalTime, 0)
  return {
    totalRenders,
    totalComponents: data.length,
    unnecessaryRenders: data.reduce((s, i) => s + i.unnecessaryRenders, 0),
    averageRenderTime: totalRenders > 0 ? totalTime / totalRenders : 0,
    slowestComponents: data.slice(0, 10),
  }
}

// ─── FPS counter ─────────────────────────────────────────────────────────────

let fps = 60
let frameCount = 0
let lastFpsTime = typeof performance !== 'undefined' ? performance.now() : Date.now()

const updateFPS = () => {
  if (typeof performance === 'undefined' || typeof requestAnimationFrame === 'undefined') return
  frameCount++
  const now = performance.now()
  if (now - lastFpsTime >= 1000) {
    fps = frameCount
    frameCount = 0
    lastFpsTime = now
  }
  requestAnimationFrame(updateFPS)
}
if (typeof requestAnimationFrame !== 'undefined') {
  requestAnimationFrame(updateFPS)
}

// ─── Focused component tracking ──────────────────────────────────────────────

interface FocusedComponentTracker {
  componentName: string
  renderCount: number
  changes: AggregatedChanges
  timestamp: number
}

let focusedComponentTracker: FocusedComponentTracker | null = null
const focusedComponentChangeCallbacks = new Set<(info: FocusedComponentRenderInfo) => void>()

function notifyFocusedComponentCallbacks(): void {
  if (!focusedComponentTracker) return
  const info: FocusedComponentRenderInfo = {
    componentName: focusedComponentTracker.componentName,
    renderCount: focusedComponentTracker.renderCount,
    changes: focusedComponentTracker.changes,
    timestamp: focusedComponentTracker.timestamp,
  }
  focusedComponentChangeCallbacks.forEach((cb) => {
    try { cb(info) } catch { /* ignore */ }
  })
}

// Single persistent render listener registered once
let renderListenerCleanup: (() => void) | null = null

function ensureRenderListener(): void {
  if (renderListenerCleanup) return
  renderListenerCleanup = addOnRenderListener((fiber, _renders) => {
    if (!focusedComponentTracker) return
    const fiberName = getDisplayName(fiber.type) || 'Unknown'
    if (fiberName !== focusedComponentTracker.componentName) return

    focusedComponentTracker.renderCount++
    focusedComponentTracker.timestamp = Date.now()

    // Extract changes from fiber
    try {
      const currentProps = fiber.memoizedProps || {}
      const prevProps = fiber.alternate?.memoizedProps || {}
      for (const key of Object.keys(currentProps)) {
        if (key === 'children') continue
        const prev = prevProps[key]
        const curr = currentProps[key]
        if (prev !== curr) {
          const existing = focusedComponentTracker.changes.propsChanges.find(c => c.name === key)
          if (existing) {
            existing.count++
            existing.previousValue = serializeValue(prev)
            existing.currentValue = serializeValue(curr)
          } else {
            focusedComponentTracker.changes.propsChanges.push({
              name: key,
              previousValue: serializeValue(prev),
              currentValue: serializeValue(curr),
              count: 1,
            })
          }
        }
      }

      let currentState = fiber.memoizedState
      let prevState = fiber.alternate?.memoizedState
      let hookIndex = 0
      while (currentState) {
        if (currentState.memoizedState !== undefined) {
          const curr = currentState.memoizedState
          const prev = prevState?.memoizedState
          if (prev !== curr && prevState) {
            const name = `Hook ${hookIndex + 1}`
            const existing = focusedComponentTracker.changes.stateChanges.find(c => c.name === name)
            if (existing) {
              existing.count++
              existing.previousValue = serializeValue(prev)
              existing.currentValue = serializeValue(curr)
            } else {
              focusedComponentTracker.changes.stateChanges.push({
                name,
                previousValue: serializeValue(prev),
                currentValue: serializeValue(curr),
                count: 1,
              })
            }
          }
        }
        currentState = currentState.next
        prevState = prevState?.next
        hookIndex++
      }
    } catch {
      // ignore extraction errors
    }

    notifyFocusedComponentCallbacks()
  })
}

// ─── ScanInstance ─────────────────────────────────────────────────────────────

let scanInstance: ScanInstance | null = null
let currentOptions: ReactDevtoolsScanOptions = {}

function createScanInstance(options: ReactDevtoolsScanOptions): ScanInstance {
  currentOptions = options

  return {
    getOptions: () => currentOptions,

    setOptions: (newOptions: Partial<ReactDevtoolsScanOptions>) => {
      currentOptions = { ...currentOptions, ...newOptions }
      setScanOptions(currentOptions)
    },

    start: () => {
      const options = { ...currentOptions, enabled: true }
      currentOptions = options

      if (ReactScanInternals.instrumentation?.isPaused) {
        ReactScanInternals.instrumentation.isPaused.value = false
      }

      scan(options)
      ensureRenderListener()
    },

    stop: () => {
      currentOptions = { ...currentOptions, enabled: false }
      setScanOptions(currentOptions)
    },

    isActive: () => {
      const opts = getScanOptions()
      return (opts.value ?? opts).enabled === true
    },

    hideToolbar: () => {
      currentOptions = { ...currentOptions, showToolbar: false }
      setScanOptions({ showToolbar: false })
    },

    showToolbar: () => {
      currentOptions = { ...currentOptions, showToolbar: true }
      setScanOptions({ showToolbar: true })
    },

    getToolbarVisibility: () => {
      const opts = getScanOptions()
      return (opts.value ?? opts).showToolbar !== false
    },

    getPerformanceData: () => extractPerformanceData(),

    getPerformanceSummary: () => calculatePerformanceSummary(extractPerformanceData()),

    clearPerformanceData: () => {
      Store.reportData?.clear()
      Store.legacyReportData?.clear()
    },

    startInspecting: () => {
      Store.inspectState.value = { kind: 'inspecting', hoveredDomElement: null }
    },

    stopInspecting: () => {
      Store.inspectState.value = { kind: 'inspect-off' }
    },

    isInspecting: () => Store.inspectState.value.kind === 'inspecting',

    focusComponent: (fiber: any) => {
      if (!fiber) return
      const domElement = fiber.stateNode instanceof Element ? fiber.stateNode : null
      if (domElement) {
        Store.inspectState.value = { kind: 'focused', focusedDomElement: domElement, fiber }
      }
    },

    getFocusedComponent: () => {
      const state = Store.inspectState.value
      if (state.kind !== 'focused') return null
      return {
        componentName: getDisplayName(state.fiber.type) || 'Unknown',
        componentId: String(getFiberId(state.fiber)),
        fiber: state.fiber,
        domElement: state.focusedDomElement,
      }
    },

    onInspectStateChange: (callback: (state: any) => void) => {
      ensureRenderListener()
      return Store.inspectState.subscribe((state: any) => {
        if (state.kind === 'focused') {
          const componentName = getDisplayName(state.fiber?.type) || 'Unknown'
          if (!focusedComponentTracker || focusedComponentTracker.componentName !== componentName) {
            focusedComponentTracker = {
              componentName,
              renderCount: 0,
              changes: { propsChanges: [], stateChanges: [], contextChanges: [] },
              timestamp: Date.now(),
            }
          }
        }
        callback(state)
      })
    },

    getFPS: () => fps,

    getFocusedComponentRenderInfo: () => {
      if (!focusedComponentTracker) return null
      return {
        componentName: focusedComponentTracker.componentName,
        renderCount: focusedComponentTracker.renderCount,
        changes: focusedComponentTracker.changes,
        timestamp: focusedComponentTracker.timestamp,
      }
    },

    onFocusedComponentChange: (callback: (info: FocusedComponentRenderInfo) => void) => {
      focusedComponentChangeCallbacks.add(callback)
      return () => focusedComponentChangeCallbacks.delete(callback)
    },

    clearFocusedComponentChanges: () => {
      if (focusedComponentTracker) {
        focusedComponentTracker.renderCount = 0
        focusedComponentTracker.changes = { propsChanges: [], stateChanges: [], contextChanges: [] }
        focusedComponentTracker.timestamp = Date.now()
      }
    },

    setFocusedComponentByName: (componentName: string) => {
      focusedComponentTracker = {
        componentName,
        renderCount: 0,
        changes: { propsChanges: [], stateChanges: [], contextChanges: [] },
        timestamp: Date.now(),
      }
      ensureRenderListener()
    },

    getComponentTree: () => extractComponentTree(),

    clearComponentTree: () => {
      // No separate map to clear — render counts come from Store.reportData
    },
  }
}

export function getScanInstance(options?: ReactDevtoolsScanOptions): ScanInstance {
  if (!scanInstance && options) {
    scanInstance = createScanInstance(options)
  }
  if (!scanInstance) {
    throw new Error('Scan instance not initialized. Call initScan first.')
  }
  return scanInstance
}

export function resetScanInstance(): void {
  scanInstance = null
  currentOptions = {}
  focusedComponentTracker = null
  focusedComponentChangeCallbacks.clear()
  if (renderListenerCleanup) {
    renderListenerCleanup()
    renderListenerCleanup = null
  }
}
