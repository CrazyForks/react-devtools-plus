'use client'

import { useEffect } from 'react'

/**
 * DevToolsProvider component
 *
 * This component initializes React DevTools Plus for Next.js.
 * Add this to your root layout to enable DevTools.
 *
 * Note: This is a temporary solution until the full integration is ready.
 * The withReactDevTools wrapper should handle this automatically in most cases.
 */
export function DevToolsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize DevTools hook if not already present
    if (typeof window !== 'undefined' && !window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      const renderers = new Map()
      ;(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
        __IS_OUR_MOCK__: true,
        checkDCE() {},
        supportsFiber: true,
        renderers,
        onScheduleFiberRoot() {},
        onCommitFiberRoot() {},
        onCommitFiberUnmount() {},
        inject(renderer: any) {
          const id = Math.random().toString(36).slice(2)
          renderers.set(id, renderer)
          return id
        },
      }
    }

    // Expose React and ReactDOM to window for overlay
    async function setupGlobals() {
      if (typeof window === 'undefined')
        return

      try {
        // Import React and ReactDOM
        const React = await import('react')
        const ReactDOM = await import('react-dom')

        // Expose to window
        ;(window as any).React = React
        ;(window as any).ReactDOM = ReactDOM

        // Try to add createRoot for React 18+
        try {
          const ReactDOMClient = await import('react-dom/client')
          ;(window as any).ReactDOM = {
            ...ReactDOM,
            createRoot: ReactDOMClient.createRoot,
            hydrateRoot: ReactDOMClient.hydrateRoot,
          }
        }
        catch {
          // React 17 or earlier
        }

        // Signal ready
        ;(window as any).__REACT_DEVTOOLS_GLOBALS_READY__ = true
        window.dispatchEvent(new CustomEvent('react-devtools-globals-ready'))
      }
      catch (err) {
        console.warn('[React DevTools] Failed to setup globals:', err)
      }
    }

    setupGlobals()

    // Load overlay CSS first
    function loadOverlayCSS() {
      if (typeof window === 'undefined')
        return

      // Check if CSS is already loaded
      if (document.getElementById('react-devtools-overlay-styles'))
        return

      const link = document.createElement('link')
      link.id = 'react-devtools-overlay-styles'
      link.rel = 'stylesheet'
      link.href = '/api/devtools/overlay.css'
      document.head.appendChild(link)
    }

    // Load overlay script
    async function loadOverlay() {
      if (typeof window === 'undefined')
        return

      try {
        // Load CSS first
        loadOverlayCSS()

        // IMPORTANT: Set clientUrl config BEFORE loading the overlay script
        // This tells the overlay where to load the DevTools client iframe from
        ;(window as any).__REACT_DEVTOOLS_CONFIG__ = {
          ...(window as any).__REACT_DEVTOOLS_CONFIG__,
          clientUrl: '/api/devtools/',
        }

        // Try to load the overlay from the API route
        const script = document.createElement('script')
        script.type = 'module'
        script.src = '/api/devtools/overlay.mjs'
        script.onerror = () => {
          console.debug('[React DevTools] Overlay not available - trying fallback')
          // Fallback: try the original path
          const fallbackScript = document.createElement('script')
          fallbackScript.type = 'module'
          fallbackScript.src = '/__react_devtools__/overlay.mjs'
          fallbackScript.onerror = () => {
            console.debug('[React DevTools] Overlay not available')
          }
          document.body.appendChild(fallbackScript)
        }
        document.body.appendChild(script)
      }
      catch (err) {
        console.debug('[React DevTools] Failed to load overlay:', err)
      }
    }

    // Load overlay after globals are ready
    if ((window as any).__REACT_DEVTOOLS_GLOBALS_READY__) {
      loadOverlay()
    }
    else {
      window.addEventListener('react-devtools-globals-ready', loadOverlay, {
        once: true,
      })
    }
  }, [])

  return <>{children}</>
}

export default DevToolsProvider
