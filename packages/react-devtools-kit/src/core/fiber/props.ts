/**
 * Props and Context manipulation utilities for React components
 *
 * This module provides functionality to modify component props and context values
 * at runtime for debugging purposes. Changes are NOT persisted to code.
 *
 * Key features:
 * - Props editing using React's official overrideProps API
 * - Context editing via Context Provider's value prop
 * - Automatic type inference for null/undefined values
 * - Fallback mechanisms when official APIs are unavailable
 */

import type { FiberNode } from '../../types'
import { REACT_TAGS } from '../../types'
import { getFiberById } from './tree'

// ============================================================================
// State Management
// ============================================================================

/** Stores overridden props for UI display */
const overriddenProps = new Map<string, Map<string, any>>()

/** Stores overridden context values for UI display */
const overriddenContexts = new Map<string, any>()

// ============================================================================
// Renderer Access
// ============================================================================

/**
 * Get the React renderer that has overrideProps API
 *
 * React DevTools hook may have multiple renderers. We need to find the one
 * that provides the official overrideProps API (React's native renderer).
 */
function getRenderer(): any {
  const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__
  if (!hook?.renderers)
    return null

  // Find the renderer with overrideProps API
  for (const renderer of hook.renderers.values()) {
    if (renderer?.overrideProps) {
      return renderer
    }
  }

  // Fallback: return any available renderer
  for (const renderer of hook.renderers.values()) {
    if (renderer) {
      return renderer
    }
  }

  return null
}

// ============================================================================
// Value Parsing
// ============================================================================

/**
 * Parse a string value to the appropriate JavaScript type
 *
 * @param value - The string representation of the value
 * @param expectedType - The expected type of the value
 * @returns The parsed value in the correct type
 */
export function parseValue(value: string, expectedType: string): any {
  // For null/undefined, infer the new type from the value
  if (expectedType === 'null' || expectedType === 'undefined') {
    if (value === 'null')
      return null
    if (value === 'undefined')
      return undefined
    return inferValueType(value)
  }

  switch (expectedType) {
    case 'number':
      return Number(value)
    case 'boolean':
      return value === 'true'
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
      // Remove surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"'))
        || (value.startsWith('\'') && value.endsWith('\''))) {
        return value.slice(1, -1)
      }
      return value
  }
}

/**
 * Infer the type of a value from its string representation
 *
 * Used when the original type is null/undefined and user enters a new value.
 */
function inferValueType(value: string): any {
  const trimmed = value.trim()

  // Boolean
  if (trimmed === 'true')
    return true
  if (trimmed === 'false')
    return false

  // Null/undefined
  if (trimmed === 'null')
    return null
  if (trimmed === 'undefined')
    return undefined

  // Number
  const num = Number(trimmed)
  if (!Number.isNaN(num) && trimmed !== '') {
    return num
  }

  // JSON object/array
  if ((trimmed.startsWith('{') && trimmed.endsWith('}'))
    || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      return JSON.parse(trimmed)
    }
    catch {
      // Not valid JSON, treat as string
    }
  }

  // Quoted string
  if ((trimmed.startsWith('"') && trimmed.endsWith('"'))
    || (trimmed.startsWith('\'') && trimmed.endsWith('\''))) {
    return trimmed.slice(1, -1)
  }

  // Default: return as string
  return trimmed
}

// ============================================================================
// Object Manipulation
// ============================================================================

/**
 * Set a nested property on an object immutably
 *
 * @param obj - The source object
 * @param path - Array of keys representing the path to the property
 * @param value - The value to set
 * @returns A new object with the updated value
 */
function setNestedValue(obj: any, path: string[], value: any): any {
  if (path.length === 0)
    return value

  const result = Array.isArray(obj) ? [...obj] : { ...obj }
  let current = result

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]
    const nextKey = path[i + 1]
    const isNextArray = !Number.isNaN(Number(nextKey))
    current[key] = current[key]
      ? (Array.isArray(current[key]) ? [...current[key]] : { ...current[key] })
      : (isNextArray ? [] : {})
    current = current[key]
  }

  current[path[path.length - 1]] = value
  return result
}

// ============================================================================
// Force Update Utilities
// ============================================================================

/**
 * Force update a specific component and its ancestors
 *
 * Strategy:
 * 1. Try class component forceUpdate (safest)
 * 2. Try function component hooks with object/array state
 * 3. Try primitive state with toggle-and-restore
 */
function forceComponentUpdate(fiber: FiberNode): boolean {
  // Try class component first
  if (fiber.stateNode && typeof fiber.stateNode.forceUpdate === 'function') {
    try {
      fiber.stateNode.forceUpdate()
      return true
    }
    catch {
      // Continue to next method
    }
  }

  // Walk up ancestors to find a component with updatable state
  let current: FiberNode | null = fiber
  let depth = 0

  while (current && depth < 50) {
    // Try class component
    if (current.stateNode && typeof current.stateNode.forceUpdate === 'function') {
      try {
        current.stateNode.forceUpdate()
        return true
      }
      catch {
        // Continue
      }
    }

    // Try function component hooks
    if (current.memoizedState !== null && typeof current.memoizedState === 'object') {
      const result = tryDispatchStateUpdate(current.memoizedState)
      if (result)
        return true
    }

    current = current.return
    depth++
  }

  return false
}

/**
 * Try to dispatch a state update through hook state
 */
function tryDispatchStateUpdate(hookState: any): boolean {
  while (hookState) {
    const queue = hookState.queue
    const currentState = hookState.memoizedState

    if (queue?.dispatch) {
      try {
        const dispatch = queue.dispatch

        // Object/array: create new reference (preserves data)
        if (currentState !== null && typeof currentState === 'object') {
          const newState = Array.isArray(currentState)
            ? [...currentState]
            : { ...currentState }
          dispatch(newState)
          return true
        }
        // Boolean: toggle and restore
        else if (typeof currentState === 'boolean') {
          dispatch(!currentState)
          setTimeout(() => dispatch(currentState), 0)
          return true
        }
        // Number: nudge and restore
        else if (typeof currentState === 'number') {
          dispatch(currentState + 0.0000001)
          setTimeout(() => dispatch(currentState), 0)
          return true
        }
      }
      catch {
        // Continue to next hook
      }
    }
    hookState = hookState.next
  }

  return false
}

/**
 * Force update by finding any component in the tree with updatable state
 */
function forceGlobalUpdate(): boolean {
  try {
    const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__
    if (!hook?.renderers)
      return false

    for (const [rendererID] of hook.renderers.entries()) {
      const roots = hook.getFiberRoots?.(rendererID)
      if (roots) {
        for (const root of roots) {
          if (root.current) {
            if (findAndForceUpdate(root.current))
              return true
          }
        }
      }
    }
  }
  catch {
    // Silently fail
  }
  return false
}

/**
 * Walk fiber tree to find a component that can be force-updated
 */
function findAndForceUpdate(fiber: FiberNode, depth = 0): boolean {
  if (!fiber || depth > 100)
    return false

  // Try class component
  if (fiber.stateNode && typeof fiber.stateNode.forceUpdate === 'function') {
    try {
      fiber.stateNode.forceUpdate()
      return true
    }
    catch {
      // Continue
    }
  }

  // Try function component hooks
  if (fiber.memoizedState !== null && typeof fiber.memoizedState === 'object') {
    if (tryDispatchStateUpdate(fiber.memoizedState))
      return true
  }

  // Recurse into children and siblings
  if (fiber.child && findAndForceUpdate(fiber.child, depth + 1))
    return true
  if (fiber.sibling && findAndForceUpdate(fiber.sibling, depth + 1))
    return true

  return false
}

// ============================================================================
// Props Editing
// ============================================================================

/**
 * Set a prop value on a component
 *
 * Uses React's official overrideProps API when available,
 * falls back to direct fiber manipulation otherwise.
 *
 * @param fiberId - The fiber ID of the component
 * @param propPath - Dot-separated path to the prop (e.g., "user.name")
 * @param value - The string representation of the new value
 * @param valueType - The expected type of the value
 * @returns Whether the operation succeeded
 */
export function setComponentProp(
  fiberId: string,
  propPath: string,
  value: string,
  valueType: string,
): boolean {
  const fiber = getFiberById(fiberId)
  if (!fiber) {
    console.warn(`[React DevTools] Fiber not found: ${fiberId}`)
    return false
  }

  const parsedValue = parseValue(value, valueType)
  const pathParts = propPath.split('.')

  try {
    // Store the override for UI display
    if (!overriddenProps.has(fiberId)) {
      overriddenProps.set(fiberId, new Map())
    }
    overriddenProps.get(fiberId)!.set(propPath, parsedValue)

    const renderer = getRenderer()

    // Method 1: Use React's official overrideProps API
    if (renderer?.overrideProps) {
      // Try with fiber object
      try {
        renderer.overrideProps(fiber, pathParts, parsedValue)
        return true
      }
      catch {
        // Try with numeric ID
        const numericId = Number.parseInt(fiberId.replace('react-fiber-', ''), 10)
        if (!Number.isNaN(numericId)) {
          try {
            renderer.overrideProps(numericId, pathParts, parsedValue)
            return true
          }
          catch {
            // Fall through to direct manipulation
          }
        }
      }
    }

    // Method 2: Direct fiber manipulation (fallback)
    const currentProps = fiber.memoizedProps || {}
    const newProps = setNestedValue(currentProps, pathParts, parsedValue)

    fiber.memoizedProps = newProps
    fiber.pendingProps = newProps

    if (fiber.alternate) {
      fiber.alternate.memoizedProps = newProps
      fiber.alternate.pendingProps = newProps
    }

    // Trigger update
    forceComponentUpdate(fiber) || forceGlobalUpdate()
    return true
  }
  catch (error) {
    console.warn('[React DevTools] Failed to set prop:', error)
    return false
  }
}

/**
 * Get an overridden prop value for UI display
 */
export function getOverriddenProp(fiberId: string, propPath: string): any {
  return overriddenProps.get(fiberId)?.get(propPath)
}

/**
 * Check if a prop is editable
 *
 * Some props cannot be edited (children, key, ref, etc.)
 * Some types cannot be edited (functions, symbols, elements)
 */
export function isEditableProp(propName: string, valueType: string): boolean {
  const nonEditableProps = ['children', 'key', 'ref', '$$typeof']
  if (nonEditableProps.includes(propName))
    return false

  const nonEditableTypes = ['element', 'function', 'symbol']
  if (nonEditableTypes.includes(valueType))
    return false

  return true
}

// ============================================================================
// Context Editing
// ============================================================================

/**
 * Set a Context Provider's value
 *
 * @param fiberId - The fiber ID of the Context Provider
 * @param value - The string representation of the new value
 * @param valueType - The expected type of the value
 * @returns Whether the operation succeeded
 */
export function setContextValue(
  fiberId: string,
  value: string,
  valueType: string,
): boolean {
  const fiber = getFiberById(fiberId)
  if (!fiber) {
    console.warn(`[React DevTools] Fiber not found: ${fiberId}`)
    return false
  }

  if (fiber.tag !== REACT_TAGS.ContextProvider) {
    console.warn(`[React DevTools] Fiber is not a Context Provider`)
    return false
  }

  try {
    const parsedValue = parseValue(value, valueType)
    return applyContextValue(fiber, parsedValue, fiberId)
  }
  catch (error) {
    console.warn('[React DevTools] Failed to set context value:', error)
    return false
  }
}

/**
 * Set a Context Provider's value from a JSON string
 *
 * Used for complex objects where JSON editing is more convenient.
 */
export function setContextValueFromJson(
  fiberId: string,
  jsonValue: string,
): boolean {
  const fiber = getFiberById(fiberId)
  if (!fiber) {
    console.warn(`[React DevTools] Fiber not found: ${fiberId}`)
    return false
  }

  if (fiber.tag !== REACT_TAGS.ContextProvider) {
    console.warn(`[React DevTools] Fiber is not a Context Provider`)
    return false
  }

  try {
    const parsedValue = JSON.parse(jsonValue)
    return applyContextValue(fiber, parsedValue, fiberId)
  }
  catch (error) {
    console.warn('[React DevTools] Failed to set context value from JSON:', error)
    return false
  }
}

/**
 * Set a nested property within a Context Provider's value
 *
 * @param fiberId - The fiber ID of the Context Provider
 * @param path - Dot-separated path to the property (e.g., "theme.mode")
 * @param value - The string representation of the new value
 * @param valueType - The expected type of the value
 * @returns Whether the operation succeeded
 */
export function setContextValueAtPath(
  fiberId: string,
  path: string,
  value: string,
  valueType: string,
): boolean {
  const fiber = getFiberById(fiberId)
  if (!fiber) {
    console.warn(`[React DevTools] Fiber not found: ${fiberId}`)
    return false
  }

  if (fiber.tag !== REACT_TAGS.ContextProvider) {
    console.warn(`[React DevTools] Fiber is not a Context Provider`)
    return false
  }

  try {
    const parsedValue = parseValue(value, valueType)
    const pathParts = path.split('.')

    // Get current context value
    const currentValue = fiber.memoizedProps?.value

    // Create new value with the nested path updated
    const newValue = setNestedValue(currentValue, pathParts, parsedValue)

    return applyContextValue(fiber, newValue, fiberId)
  }
  catch (error) {
    console.warn('[React DevTools] Failed to set context value at path:', error)
    return false
  }
}

/**
 * Apply a value to a Context Provider
 *
 * Context Provider is essentially a component with a `value` prop.
 * We use overrideProps to modify this prop.
 */
function applyContextValue(fiber: FiberNode, newValue: any, fiberId: string): boolean {
  // Store the override for UI display
  overriddenContexts.set(fiberId, newValue)

  const renderer = getRenderer()

  // Method 1: Use React's official overrideProps API
  if (renderer?.overrideProps) {
    // Try with fiber object
    try {
      renderer.overrideProps(fiber, ['value'], newValue)
      return true
    }
    catch {
      // Try with numeric ID
      const numericId = Number.parseInt(fiberId.replace('react-fiber-', ''), 10)
      if (!Number.isNaN(numericId)) {
        try {
          renderer.overrideProps(numericId, ['value'], newValue)
          return true
        }
        catch {
          // Fall through to direct manipulation
        }
      }
    }
  }

  // Method 2: Direct fiber manipulation (fallback)
  const newProps = { ...(fiber.memoizedProps || {}), value: newValue }
  fiber.memoizedProps = newProps
  fiber.pendingProps = newProps

  if (fiber.alternate) {
    fiber.alternate.memoizedProps = newProps
    fiber.alternate.pendingProps = newProps
  }

  // Update context internal values if available
  const contextType = fiber.type?._context
  if (contextType) {
    contextType._currentValue = newValue
    if ('_currentValue2' in contextType) {
      contextType._currentValue2 = newValue
    }
  }

  // Trigger update
  forceComponentUpdate(fiber) || forceGlobalUpdate()
  return true
}

/**
 * Get an overridden context value for UI display
 */
export function getOverriddenContext(fiberId: string): any {
  return overriddenContexts.get(fiberId)
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Clear all overrides
 *
 * Should be called when the page refreshes or DevTools disconnects.
 */
export function clearOverrides(): void {
  overriddenProps.clear()
  overriddenContexts.clear()
}
