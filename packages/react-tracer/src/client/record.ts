import type { PositionInfo } from '../types'

const KEY_IGNORE = 'data-react-tracer-ignore'
const KEY_GLOBAL = '__react_tracer__'

interface Store {
  hasData: boolean
  events?: any
}

// eslint-disable-next-line ts/no-unsafe-assignment
let _store: Store = (globalThis as any)[KEY_GLOBAL]
if (!_store) {
  _store = { hasData: false }
  Object.defineProperty(globalThis, KEY_GLOBAL, {
    value: _store,
    configurable: true,
    enumerable: false,
  })
}

/**
 * @internal
 */
export function getInternalStore(): Store {
  return _store
}

// ---------------------------------------------------------------------------
// Source resolution strategies
// ---------------------------------------------------------------------------

function parseSourcePath(path: string): PositionInfo | null {
  const lastColon = path.lastIndexOf(':')
  if (lastColon === -1)
    return null

  const secondLastColon = path.lastIndexOf(':', lastColon - 1)
  if (secondLastColon === -1)
    return null

  const source = path.substring(0, secondLastColon)
  const line = Number.parseInt(path.substring(secondLastColon + 1, lastColon), 10)
  const column = Number.parseInt(path.substring(lastColon + 1), 10)

  if (Number.isNaN(line) || Number.isNaN(column))
    return null

  return [source, line, column]
}

/**
 * Get source info from `data-source-path` attribute on the element or ancestors.
 */
function getSourceFromAttribute(element: Element): PositionInfo | null {
  let current: Element | null = element
  while (current && current !== document.body) {
    const sourcePath = current.getAttribute('data-source-path')
    if (sourcePath) {
      return parseSourcePath(sourcePath)
    }
    current = current.parentElement
  }
  return null
}

/**
 * Get a React Fiber from a DOM element via React's internal properties.
 */
export function getFiberFromElement(element: Element): any | null {
  const keys = Object.keys(element)

  for (const key of keys) {
    if (key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance')) {
      return (element as any)[key]
    }
  }

  return null
}

/**
 * Get source info from a fiber's `_debugSource` (walks up the return chain).
 */
function getSourceFromFiber(element: Element): PositionInfo | null {
  const fiber = getFiberFromElement(element)
  if (!fiber)
    return null

  let current = fiber
  while (current) {
    if (current._debugSource) {
      const { fileName, lineNumber, columnNumber } = current._debugSource
      return [fileName, lineNumber || 0, columnNumber || 0]
    }
    current = current.return
  }
  return null
}

/**
 * Get a display name from a fiber node.
 */
function getDisplayNameFromFiber(fiber: any): string {
  let current = fiber
  while (current) {
    const type = current.elementType || current.type
    if (type && typeof type !== 'string') {
      return type.displayName || type.name || type.__name || 'Anonymous'
    }
    if (typeof type === 'string') {
      return type
    }
    current = current.return
  }
  return 'Unknown'
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Trace information for a DOM element, including its source location.
 *
 * This is the primary data object returned by the lookup APIs.
 */
export class ElementTraceInfo {
  pos: PositionInfo
  el: Element | undefined

  constructor(pos: PositionInfo, el?: Element) {
    this.pos = pos
    this.el = el
  }

  /**
   * Source file path (without line/column).
   */
  get filepath(): string {
    return this.pos[0]
  }

  /**
   * Full path including line and column: `"path/to/file.tsx:10:5"`
   */
  get fullpath(): string {
    let path = this.pos[0]
    if (this.pos[1]) {
      path += `:${this.pos[1]}`
      if (this.pos[2])
        path += `:${this.pos[2]}`
    }
    return path
  }

  get line(): number {
    return this.pos[1]
  }

  get column(): number {
    return this.pos[2]
  }

  get rect(): DOMRect | undefined {
    return this.el?.getBoundingClientRect()
  }

  /**
   * Resolved display name (component name or tag name).
   */
  get componentName(): string {
    if (!this.el)
      return ''
    const fiber = getFiberFromElement(this.el)
    if (!fiber)
      return this.el.tagName.toLowerCase()
    return getDisplayNameFromFiber(fiber)
  }
}

/**
 * Find trace information for a given DOM element.
 *
 * Tries `data-source-path` attribute first, then falls back to
 * React fiber `_debugSource`.
 */
export function findTraceFromElement(el?: Element | null): ElementTraceInfo | undefined {
  if (!el)
    return undefined

  const attrSource = getSourceFromAttribute(el)
  if (attrSource) {
    _store.hasData = true
    return new ElementTraceInfo(attrSource, el)
  }

  const fiberSource = getSourceFromFiber(el)
  if (fiberSource) {
    _store.hasData = true
    return new ElementTraceInfo(fiberSource, el)
  }

  return undefined
}

/**
 * Find trace information at a pointer position.
 *
 * Uses `document.elementsFromPoint` and returns the first element
 * that has trace data. Elements with `data-react-tracer-ignore` and
 * their ancestors are skipped.
 */
export function findTraceAtPointer(e: { x: number, y: number }): ElementTraceInfo | undefined {
  let elements = document.elementsFromPoint(e.x, e.y)
  const ignoreIndex = elements.findIndex(node => node?.hasAttribute?.(KEY_IGNORE))
  if (ignoreIndex !== -1)
    elements = elements.slice(ignoreIndex)
  for (const el of elements) {
    const match = findTraceFromElement(el)
    if (match)
      return match
  }
  return undefined
}

/**
 * Whether any trace data has been found since page load.
 */
export function hasData(): boolean {
  return _store.hasData
}

export type { PositionInfo }
