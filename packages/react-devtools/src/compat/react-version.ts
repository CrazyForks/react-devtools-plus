/**
 * React Version Detection and Rendering Adapter
 *
 * Handles compatibility between React 17 (legacy render) and React 18+ (createRoot)
 *
 * NOTE: This module intentionally avoids static imports of `react` or `react-dom`
 * to support CDN-loaded React scenarios (like singleSpa micro-frontends).
 */

/**
 * React version information
 */
export interface ReactVersionInfo {
  /** Major version number */
  major: number
  /** Full version string */
  version: string
  /** Whether createRoot API is available */
  hasCreateRoot: boolean
  /** Whether legacy render API is available */
  hasLegacyRender: boolean
}

/**
 * Detect React version from the React module
 */
export function detectReactVersion(React: any): ReactVersionInfo {
  const version = React?.version || '0.0.0'
  const major = Number.parseInt(version.split('.')[0], 10) || 0

  return {
    major,
    version,
    hasCreateRoot: major >= 18,
    hasLegacyRender: major < 18 || major === 0,
  }
}

/**
 * Check if React 18+ createRoot is available
 */
export function isReact18OrNewer(React: any): boolean {
  return detectReactVersion(React).hasCreateRoot
}

/**
 * React Root reference (abstract for both React 17 and 18)
 */
export interface ReactRootRef {
  /** Unmount the root */
  unmount: () => void
  /** Type of root (createRoot or legacy) */
  type: 'createRoot' | 'legacy'
  /** Container element */
  container: HTMLElement
}

/**
 * React Rendering Adapter
 *
 * Provides a unified API for rendering React components that works with both
 * React 17 (legacy ReactDOM.render) and React 18+ (createRoot)
 */
export const ReactRenderAdapter = {
  /**
   * Render element using createRoot (React 18+)
   */
  renderWithCreateRoot(
    ReactDOM: any,
    element: any,
    container: HTMLElement,
  ): ReactRootRef {
    const root = ReactDOM.createRoot(container)
    root.render(element)
    return {
      unmount: () => root.unmount(),
      type: 'createRoot',
      container,
    }
  },
  /**
   * Render element using legacy render (React 17 and below)
   */
  renderWithLegacyRender(
    ReactDOM: any,
    element: any,
    container: HTMLElement,
  ): ReactRootRef {
    // eslint-disable-next-line react-dom/no-render
    ReactDOM.render(element, container)
    return {
      unmount: () => {
        if (typeof ReactDOM.unmountComponentAtNode === 'function') {
          ReactDOM.unmountComponentAtNode(container)
        }
      },
      type: 'legacy',
      container,
    }
  },
  /**
   * Render element using the appropriate method based on React version
   */
  render(
    React: any,
    ReactDOM: any,
    element: any,
    container: HTMLElement,
  ): ReactRootRef | null {
    const versionInfo = detectReactVersion(React)

    // Try createRoot first for React 18+
    if (versionInfo.hasCreateRoot && typeof ReactDOM.createRoot === 'function') {
      try {
        return this.renderWithCreateRoot(ReactDOM, element, container)
      }
      catch (e) {
        console.warn('[React DevTools] createRoot failed, falling back to legacy render:', e)
      }
    }

    // Fail back to legacy render
    if (typeof ReactDOM.render === 'function') {
      try {
        return this.renderWithLegacyRender(ReactDOM, element, container)
      }
      catch (e) {
        console.warn('[React DevTools] legacy render failed:', e)
      }
    }

    console.warn('[React DevTools] No suitable React render method found')
    return null
  },
  /**
   * Unmount the root
   */
  unmount(rootRef: ReactRootRef | null): void {
    if (rootRef) {
      try {
        rootRef.unmount()
      }
      catch (e) {
        // Silently ignore unmount errors
      }
    }
  },
}

/**
 * Generate code for React globals initialization (for Webpack injection)
 *
 * This code handles the case where React is loaded from CDN and ensures
 * window.React and window.ReactDOM are available for the DevTools overlay.
 */
export function generateReactGlobalsInitCode(): string {
  return `
// React DevTools: Setup React globals for overlay
// Supports both npm-installed React and CDN-loaded React (singleSpa)

if (typeof window !== 'undefined') {
  // Try to get React from window first (CDN scenario)
  var React = window.React;
  var ReactDOM = window.ReactDOM;

  // If not found, try to import from node_modules
  if (!React) {
    try {
      React = require('react');
      window.React = React;
    } catch (e) {
      // React not available via require, must be loaded via CDN
    }
  }

  if (!ReactDOM) {
    try {
      ReactDOM = require('react-dom');
      window.ReactDOM = ReactDOM;
    } catch (e) {
      // ReactDOM not available via require, must be loaded via CDN
    }
  }

  // Try to add createRoot support for React 18+ (optional)
  if (ReactDOM && !ReactDOM.createRoot) {
    try {
      var ReactDOMClient = require('react-dom/client');
      if (ReactDOMClient && ReactDOMClient.createRoot) {
        window.ReactDOM = Object.assign({}, ReactDOM, ReactDOMClient);
      }
    } catch (e) {
      // react-dom/client not available, which is fine for React 17 or CDN
    }
  }
}
`.trim()
}
