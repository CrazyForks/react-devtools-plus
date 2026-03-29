import type { FiberNode } from '../../types'
import { findTraceFromElement } from 'react-tracer/client/record'
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
    if (shouldIncludeFiber(current, false)) {
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
    // Use react-tracer's unified source lookup
    const traceInfo = findTraceFromElement(target)

    if (traceInfo && fiber) {
      highlightNode(fiber, {
        fileName: traceInfo.filepath,
        lineNumber: traceInfo.line,
        columnNumber: traceInfo.column,
      })
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
    // Use react-tracer's unified source lookup
    const traceInfo = findTraceFromElement(target)

    if (traceInfo) {
      emitOpenInEditor(traceInfo.filepath, traceInfo.line, traceInfo.column)
      toggleInspector(false)
      hideHighlight()
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
