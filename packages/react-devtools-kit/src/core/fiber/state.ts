/**
 * State manipulation utilities for React components
 * 直接编辑组件的 useState/useReducer 状态（这是最可靠的调试方式）
 */

import { REACT_TAGS } from '../../types'
import { getFiberById } from './tree'

export interface HookStateInfo {
  index: number
  name: string
  value: any
  type: string
  canEdit: boolean
}

/**
 * Get all useState/useReducer hooks from a component
 */
export function getComponentHookStates(fiberId: string): HookStateInfo[] {
  const fiber = getFiberById(fiberId)
  if (!fiber)
    return []

  // Only function components have hooks
  if (fiber.tag !== REACT_TAGS.FunctionComponent
    && fiber.tag !== REACT_TAGS.ForwardRef
    && fiber.tag !== REACT_TAGS.SimpleMemoComponent
    && fiber.tag !== REACT_TAGS.MemoComponent) {
    return []
  }

  const states: HookStateInfo[] = []
  const debugHookTypes = fiber._debugHookTypes

  let hookState = fiber.memoizedState
  let index = 0

  while (hookState) {
    // Only include useState and useReducer hooks (they have queue.dispatch)
    if (hookState.queue?.dispatch) {
      const hookName = debugHookTypes?.[index] || 'State'
      const value = hookState.memoizedState
      const valueType = getValueType(value)

      states.push({
        index,
        name: hookName,
        value: serializeForDisplay(value),
        type: valueType,
        canEdit: isEditableType(valueType),
      })
    }

    hookState = hookState.next
    index++
  }

  return states
}

/**
 * Set a hook state value
 * This directly calls the useState setter, which is the most reliable way to update React state
 */
export function setHookState(
  fiberId: string,
  hookIndex: number,
  value: string,
  valueType: string,
): boolean {
  const fiber = getFiberById(fiberId)
  if (!fiber) {
    console.warn(`[React DevTools] Fiber not found: ${fiberId}`)
    return false
  }

  // Find the hook at the specified index
  let hookState = fiber.memoizedState
  let currentIndex = 0
  let targetHook: any = null

  while (hookState) {
    if (hookState.queue?.dispatch) {
      if (currentIndex === hookIndex) {
        targetHook = hookState
        break
      }
      currentIndex++
    }
    hookState = hookState.next
  }

  if (!targetHook) {
    console.warn(`[React DevTools] Hook at index ${hookIndex} not found`)
    return false
  }

  const dispatch = targetHook.queue.dispatch
  if (!dispatch) {
    console.warn(`[React DevTools] Hook has no dispatch function`)
    return false
  }

  try {
    const parsedValue = parseValue(value, valueType)

    // Call the dispatch function directly - this is the official React way!
    dispatch(parsedValue)
    return true
  }
  catch (error) {
    console.warn('[React DevTools] Failed to set hook state:', error)
    return false
  }
}

/**
 * Set a hook state value using JSON (for objects/arrays)
 */
export function setHookStateFromJson(
  fiberId: string,
  hookIndex: number,
  jsonValue: string,
): boolean {
  try {
    const parsedValue = JSON.parse(jsonValue)
    const fiber = getFiberById(fiberId)
    if (!fiber)
      return false

    // Find the hook
    let hookState = fiber.memoizedState
    let currentIndex = 0

    while (hookState) {
      if (hookState.queue?.dispatch) {
        if (currentIndex === hookIndex) {
          hookState.queue.dispatch(parsedValue)
          return true
        }
        currentIndex++
      }
      hookState = hookState.next
    }

    return false
  }
  catch (error) {
    console.warn('[React DevTools] Failed to set hook state from JSON:', error)
    return false
  }
}

// Helper functions

function getValueType(value: any): string {
  if (value === null)
    return 'null'
  if (value === undefined)
    return 'undefined'
  if (Array.isArray(value))
    return 'array'
  return typeof value
}

function isEditableType(type: string): boolean {
  return ['string', 'number', 'boolean', 'null', 'undefined', 'object', 'array'].includes(type)
}

function parseValue(value: string, valueType: string): any {
  switch (valueType) {
    case 'number':
      return Number(value)
    case 'boolean':
      return value === 'true'
    case 'null':
      return null
    case 'undefined':
      return undefined
    case 'object':
    case 'array':
      try {
        return JSON.parse(value)
      }
      catch {
        return value
      }
    case 'string':
    default:
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
        return value.slice(1, -1)
      }
      return value
  }
}

function serializeForDisplay(value: any): any {
  if (value === null)
    return null
  if (value === undefined)
    return undefined
  if (typeof value === 'function')
    return `ƒ ${value.name || 'anonymous'}()`
  if (typeof value === 'symbol')
    return value.toString()

  // For objects and arrays, return as-is (will be serialized later)
  return value
}
