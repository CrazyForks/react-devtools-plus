import type { ElementTraceInfo } from './record'
import { events, getIsEnabled, getLastMatchedElement, setIsEnabled } from './listeners'

export * from './listeners'

const ANIMATE_DURATION = '0.15s'

/**
 * Reactive-like state for the overlay.
 *
 * Mutate `state.isEnabled` to toggle the tracer, read `state.isVisible`
 * and `state.main` for current highlight info.
 */
export const state = {
  get isEnabled() { return getIsEnabled() },
  set isEnabled(v: boolean) { setIsEnabled(v) },
  isVisible: false,
  main: undefined as ElementTraceInfo | undefined,
}

// DOM references (set during init)
let overlayEl: HTMLDivElement
let svgEl: SVGSVGElement
let mainRect: SVGRectElement
let mainText: HTMLDivElement
let mainTextTag: HTMLDivElement
let mainTextPath: HTMLDivElement

function createOverlay(): void {
  overlayEl = document.createElement('div')
  overlayEl.id = 'react-tracer-overlay'
  overlayEl.setAttribute('data-react-tracer-ignore', '')
  Object.assign(overlayEl.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    bottom: '0',
    right: '0',
    zIndex: '2147483640',
    pointerEvents: 'none',
    opacity: '0',
    transition: `opacity ${ANIMATE_DURATION}`,
  } as Partial<CSSStyleDeclaration>)

  svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  Object.assign(svgEl.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    bottom: '0',
    right: '0',
    pointerEvents: 'none',
  } as Partial<CSSStyleDeclaration>)
  svgEl.setAttribute('width', '100%')
  svgEl.setAttribute('height', '100%')

  mainRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  mainRect.setAttribute('fill', 'rgba(97,218,251,0.13)')
  mainRect.setAttribute('stroke', '#61dafb')
  mainRect.setAttribute('rx', '4')
  mainRect.setAttribute('ry', '4')
  mainRect.style.transition = `all ${ANIMATE_DURATION}`
  mainRect.style.opacity = '0'

  mainText = document.createElement('div')
  Object.assign(mainText.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    transition: `all ${ANIMATE_DURATION}`,
    backgroundColor: '#20232a',
    color: '#61dafb',
    borderRadius: '0 0 4px 4px',
    padding: '2px 6px',
    pointerEvents: 'none',
    fontSize: '11px',
    fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
    opacity: '0',
  } as Partial<CSSStyleDeclaration>)

  mainTextTag = document.createElement('div')
  Object.assign(mainTextTag.style, {
    fontWeight: '600',
    color: '#fff',
  } as Partial<CSSStyleDeclaration>)

  mainTextPath = document.createElement('div')
  Object.assign(mainTextPath.style, {
    opacity: '0.8',
    fontSize: '10px',
  } as Partial<CSSStyleDeclaration>)

  mainText.appendChild(mainTextTag)
  mainText.appendChild(mainTextPath)

  svgEl.appendChild(mainRect)
  overlayEl.appendChild(svgEl)
  overlayEl.appendChild(mainText)
  document.body.appendChild(overlayEl)
}

function updateOverlay(result: ElementTraceInfo | undefined): void {
  if (!result || !result.rect) {
    state.isVisible = false
    state.main = undefined
    overlayEl.style.opacity = '0'
    mainRect.style.opacity = '0'
    mainText.style.opacity = '0'
    return
  }

  state.isVisible = true
  state.main = result

  overlayEl.style.opacity = '1'
  mainRect.style.opacity = '1'
  mainText.style.opacity = '1'

  const rect = result.rect
  mainRect.setAttribute('x', String(rect.left))
  mainRect.setAttribute('y', String(rect.top))
  mainRect.setAttribute('width', String(rect.width))
  mainRect.setAttribute('height', String(rect.height))

  const tagName = result.componentName
  mainTextTag.textContent = tagName ? `<${tagName}>` : ''
  mainTextPath.textContent = `${result.pos[0]}:${result.pos[1]}:${result.pos[2]}`

  // Position the label just below the highlight rect
  const labelTop = rect.top + rect.height
  Object.assign(mainText.style, {
    left: `${rect.left}px`,
    top: `${labelTop}px`,
  })
}

function init(): void {
  createOverlay()

  events.on('hover', (result) => {
    updateOverlay(result)
  })

  events.on('disabled', () => {
    updateOverlay(undefined)
  })

  document.addEventListener('scroll', () => {
    if (state.isVisible)
      updateOverlay(getLastMatchedElement())
  })
  window.addEventListener('resize', () => {
    if (state.isVisible)
      updateOverlay(getLastMatchedElement())
  })
}

init()
