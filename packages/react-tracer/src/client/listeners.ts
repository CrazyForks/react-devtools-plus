import type { Emitter } from 'mitt'
import type { ElementTraceInfo } from './record'
import mitt from 'mitt'
import { findTraceAtPointer, getInternalStore } from './record'

export * from './record'

export interface TracerEvents {
  hover: ElementTraceInfo | undefined
  click: ElementTraceInfo
  enabled: undefined
  disabled: undefined
}

const _store = getInternalStore()

/**
 * Event emitter for tracer events.
 *
 * Events:
 * - `hover`: emitted when the pointer moves over a traced element (or `undefined` if none)
 * - `click`: emitted when a traced element is clicked
 * - `enabled`: emitted when the tracer is enabled
 * - `disabled`: emitted when the tracer is disabled
 */
// eslint-disable-next-line ts/no-unsafe-assignment
export const events: Emitter<TracerEvents> = _store.events ||= mitt<TracerEvents>()

let _isEnabled = false
let _lastMatchedElement: ElementTraceInfo | undefined

/**
 * Whether the tracer listeners are currently active.
 */
export function getIsEnabled(): boolean {
  return _isEnabled
}

/**
 * Enable or disable the tracer listeners.
 *
 * When enabled, pointer events on the page will be intercepted to
 * find traced elements and emit `hover` / `click` events.
 */
export function setIsEnabled(value: boolean) {
  if (value === _isEnabled)
    return
  _isEnabled = value
  if (value)
    events.emit('enabled')
  else
    events.emit('disabled')
}

/**
 * The last matched `ElementTraceInfo` from a pointer hover.
 * Useful for updating UI on scroll/resize.
 */
export function getLastMatchedElement(): ElementTraceInfo | undefined {
  return _lastMatchedElement
}

if (typeof document !== 'undefined') {
  document.addEventListener('pointermove', (e) => {
    if (!_isEnabled)
      return

    const result = findTraceAtPointer({ x: e.clientX, y: e.clientY })
    if (result?.el === _lastMatchedElement?.el)
      return
    _lastMatchedElement = result
    events.emit('hover', result)
  })

  document.addEventListener('click', (e) => {
    if (!_isEnabled)
      return

    const result = findTraceAtPointer({ x: e.clientX, y: e.clientY })
    if (result) {
      events.emit('click', result)
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()
    }
  }, true)
}
