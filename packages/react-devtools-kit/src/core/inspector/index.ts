import type { FiberNode } from '../../types'
import { hideHighlight, highlightNode } from '../fiber/highlight'
import { getFiberFromElement, getFiberId, shouldIncludeFiber } from '../fiber/utils'

let isInspectorEnabled = false
let inspectorMode: 'select-component' | 'open-in-editor' = 'select-component'

const selectCallbacks = new Set<(fiberId: string) => void>()
const openInEditorCallbacks = new Set<(fileName: string, line: number, column: number) => void>()

export function onInspectorSelect(callback: (fiberId: string) => void) {
  selectCallbacks.add(callback)
  return () => selectCallbacks.delete(callback)
}

export function onOpenInEditor(callback: (fileName: string, line: number, column: number) => void) {
  openInEditorCallbacks.add(callback)
  return () => openInEditorCallbacks.delete(callback)
}

function emitSelect(fiberId: string) {
  selectCallbacks.forEach(cb => cb(fiberId))
}

function emitOpenInEditor(fileName: string, line: number, column: number) {
  openInEditorCallbacks.forEach(cb => cb(fileName, line, column))
}

function findNearestComponentFiber(fiber: FiberNode | null): FiberNode | null {
  let current = fiber
  while (current) {
    // We want to find the nearest Component (not HostComponent) usually
    // So passing false to shouldIncludeFiber excludes HostComponents
    if (shouldIncludeFiber(current, false)) {
      return current
    }
    current = current.return
  }
  return null
}

function findSourceFiber(fiber: FiberNode | null): FiberNode | null {
  let current = fiber
  while (current) {
    if (current._debugSource) {
      return current
    }
    current = current.return
  }
  return null
}

function handleMouseOver(e: MouseEvent) {
  if (!isInspectorEnabled)
    return

  const target = e.target as Element
  const fiber = getFiberFromElement(target)

  // Highlight logic depends on mode
  if (inspectorMode === 'select-component') {
    const componentFiber = findNearestComponentFiber(fiber)
    if (componentFiber) {
      highlightNode(componentFiber)
    }
    else {
      hideHighlight()
    }
  }
  else if (inspectorMode === 'open-in-editor') {
    // For open-in-editor, we want to highlight the element itself if possible
    // But our highlightNode only works with fibers.
    // Let's find the fiber that has source info.
    const sourceFiber = findSourceFiber(fiber)
    if (sourceFiber) {
      const source = sourceFiber._debugSource
        ? {
            fileName: sourceFiber._debugSource.fileName,
            lineNumber: sourceFiber._debugSource.lineNumber,
            columnNumber: sourceFiber._debugSource.columnNumber,
          }
        : undefined

      // Highlight the nearest fiber associated with the DOM element,
      // effectively highlighting the DOM element or its closest React wrapper.
      // If we want precise DOM highlighting, we might need a different highlight mechanism
      // or rely on the fiber that corresponds to this host component.
      // HostComponents are fibers too!
      if (fiber) {
        highlightNode(fiber, source)
      }
      else {
        highlightNode(sourceFiber, source)
      }
    }
    else {
      hideHighlight()
    }
  }
}

function handleClick(e: MouseEvent) {
  if (!isInspectorEnabled)
    return

  e.preventDefault()
  e.stopPropagation()

  const target = e.target as Element
  const fiber = getFiberFromElement(target)

  if (inspectorMode === 'select-component') {
    const componentFiber = findNearestComponentFiber(fiber)
    if (componentFiber) {
      const id = getFiberId(componentFiber)
      emitSelect(id)
      toggleInspector(false)
      hideHighlight()
    }
  }
  else if (inspectorMode === 'open-in-editor') {
    // For open in editor, we look for the nearest debug source
    const sourceFiber = findSourceFiber(fiber)
    if (sourceFiber && sourceFiber._debugSource) {
      const { fileName, lineNumber, columnNumber } = sourceFiber._debugSource
      // console.log('[React DevTools] Opening in editor:', fileName, lineNumber, columnNumber, 'from fiber:', sourceFiber)
      emitOpenInEditor(fileName, lineNumber, columnNumber)
      toggleInspector(false)
      hideHighlight()
    }
    else {
      // console.warn('[React DevTools] No source location found for fiber:', fiber)
    }
  }
}

export interface ToggleInspectorOptions {
  mode?: 'select-component' | 'open-in-editor'
}

export function toggleInspector(enabled: boolean, options: ToggleInspectorOptions = {}) {
  isInspectorEnabled = enabled
  if (options.mode) {
    inspectorMode = options.mode
  }

  if (enabled) {
    window.addEventListener('mouseover', handleMouseOver, true)
    window.addEventListener('click', handleClick, true)
    document.body.style.cursor = 'default'
  }
  else {
    window.removeEventListener('mouseover', handleMouseOver, true)
    window.removeEventListener('click', handleClick, true)
    document.body.style.cursor = ''
    hideHighlight()
  }
}
