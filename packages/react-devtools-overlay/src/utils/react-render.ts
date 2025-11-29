/**
 * React Render Adapter for Overlay
 *
 * Provides unified rendering API that works with both:
 * - React 17 and below (legacy ReactDOM.render)
 * - React 18+ (createRoot)
 */

import { version as reactVersion } from 'react'
import ReactDOM from 'react-dom'

/**
 * Root reference that abstracts React 17/18 differences
 */
export interface ReactRootRef {
  /** Unmount the root */
  unmount: () => void
  /** Root style */
  type: 'createRoot' | 'legacy'
  /** Container element */
  container: HTMLElement
}

/**
 * Check if React 18+ createRoot is available
 */
export function isReact18OrNewer(): boolean {
  const majorVersion = Number((reactVersion || '0').split('.')[0])
  return majorVersion >= 18
}

/**
 * Check if createRoot function is available on ReactDOM
 */
function hasCreateRoot(): boolean {
  return typeof (ReactDOM as any).createRoot === 'function'
}

/**
 * Check if legacy render function is available
 */
function hasLegacyRender(): boolean {
  return typeof ReactDOM.render === 'function'
}

/**
 * Render using React 18+ createRoot
 */
function renderWithCreateRoot(element: React.ReactElement, container: HTMLElement): ReactRootRef {
  const root = (ReactDOM as any).createRoot(container)
  root.render(element)
  return {
    unmount: () => root.unmount(),
    type: 'createRoot',
    container,
  }
}

/**
 * Render using legacy ReactDOM.render (React 17 and below)
 */
function renderWithLegacyRender(element: React.ReactElement, container: HTMLElement): ReactRootRef {
  ;(ReactDOM as any).render(element, container)
  return {
    unmount: () => {
      if (typeof (ReactDOM as any).unmountComponentAtNode === 'function') {
        (ReactDOM as any).unmountComponentAtNode(container)
      }
    },
    type: 'legacy',
    container,
  }
}

/**
 * Render React element to container, automatically choosing the right method
 *
 * @param element - React element to render
 * @param container - DOM container to render into
 * @returns Root reference or null if rendering failed
 */
export function renderToContainer(
  element: React.ReactElement,
  container: HTMLElement,
): ReactRootRef | null {
  // Try createRoot first for React 18+
  if (isReact18OrNewer() && hasCreateRoot()) {
    try {
      return renderWithCreateRoot(element, container)
    }
    catch (e) {
      console.warn('[React DevTools] createRoot failed, falling back to legacy render:', e)
    }
  }

  // Fail back to legacy render
  if (hasLegacyRender()) {
    try {
      return renderWithLegacyRender(element, container)
    }
    catch (e) {
      console.warn('[React DevTools] legacy render failed:', e)
    }
  }

  // Failed to render
  console.warn('[React DevTools] No suitable React render method found:', element)
  return null
}

/**
 * Unmount a root reference
 */
export function unmountRoot(rootRef: ReactRootRef | null): void {
  if (!rootRef) {
    return
  }

  try {
    rootRef.unmount()
  }
  catch {
    // Silently handle unmount errors
  }
}
