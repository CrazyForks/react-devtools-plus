import type { FiberNode } from '../../types'
import { REACT_TAGS } from '../../types'

export function getDisplayName(fiber: FiberNode): string {
  const { elementType, type, tag } = fiber
  const resolvedType = elementType || type

  if (!resolvedType) {
    if (tag === REACT_TAGS.HostRoot)
      return 'Root'
    if (tag === REACT_TAGS.HostComponent)
      return typeof fiber.type === 'string' ? fiber.type : 'Host'
    return 'Unknown'
  }

  if (typeof resolvedType === 'string')
    return resolvedType

  // Try to get displayName first
  if (resolvedType.displayName)
    return resolvedType.displayName

  // Then try name
  if (resolvedType.name)
    return resolvedType.name

  // For default exports, the name might be in __name or _name
  if (resolvedType.__name)
    return resolvedType.__name

  // Check if it's a memo component
  if (resolvedType.type) {
    const innerType = resolvedType.type
    if (innerType?.displayName)
      return innerType.displayName
    if (innerType?.name)
      return innerType.name
    if (innerType?.__name)
      return innerType.__name
  }

  // Check render function name
  if (resolvedType.render?.name)
    return resolvedType.render.name

  // Last resort: try to infer from function source
  if (typeof resolvedType === 'function') {
    const funcName = resolvedType.name
    if (funcName && funcName !== '')
      return funcName
  }

  return 'Anonymous'
}

export function shouldIncludeFiber(fiber: FiberNode, showHostComponents: boolean): boolean {
  if (fiber.tag === REACT_TAGS.HostText)
    return false

  if (fiber.tag === REACT_TAGS.Fragment || fiber.tag === REACT_TAGS.Mode || fiber.tag === REACT_TAGS.HostRoot)
    return false

  if (!showHostComponents && fiber.tag === REACT_TAGS.HostComponent)
    return false

  const visibleTags: number[] = [
    REACT_TAGS.HostComponent,
    REACT_TAGS.FunctionComponent,
    REACT_TAGS.ClassComponent,
    REACT_TAGS.ForwardRef,
    REACT_TAGS.MemoComponent,
    REACT_TAGS.SimpleMemoComponent,
    REACT_TAGS.IndeterminateComponent,
    REACT_TAGS.ContextProvider,
    REACT_TAGS.ContextConsumer,
    REACT_TAGS.SuspenseComponent,
  ]
  return visibleTags.includes(fiber.tag)
}

let fiberIdCounter = 0
const fiberIdMap = new WeakMap<FiberNode, string>()

export function getFiberId(fiber: FiberNode): string {
  if (!fiberIdMap.has(fiber))
    fiberIdMap.set(fiber, `react-fiber-${++fiberIdCounter}`)
  return fiberIdMap.get(fiber)!
}

export function getFiberFromElement(element: Element): FiberNode | null {
  const keys = Object.keys(element)

  for (const key of keys) {
    // React 18+ legacy or older uses __reactFiber$<randomId>
    if (key.startsWith('__reactFiber')) {
      return (element as any)[key]
    }
    // React < 18 uses __reactInternalInstance$<randomId>
    if (key.startsWith('__reactInternalInstance')) {
      return (element as any)[key]
    }
  }

  return null
}
