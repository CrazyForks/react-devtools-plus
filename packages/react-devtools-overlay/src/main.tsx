import type { Root } from 'react-dom/client'
import { globalPluginManager } from '@react-devtools/core'
import { createScanPlugin } from '@react-devtools/scan'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

let root: Root | null = null

async function init() {
  // Prevent duplicate initialization
  if (document.getElementById('react-devtools-overlay')) {
    console.warn('[React DevTools] Overlay already exists, skipping initialization')
    return
  }

  // installReactHook(getShowHostComponents)

  // Register React Scan plugin
  try {
    await globalPluginManager.register(createScanPlugin({
      autoStart: true, // Auto-start to show flash effects by default
    }))
    console.log('[React DevTools] Scan plugin registered')
  }
  catch (error) {
    console.warn('[React DevTools] Failed to register Scan plugin:', error)
  }

  const container = document.createElement('div')
  container.id = 'react-devtools-overlay'
  document.body.appendChild(container)

  root = createRoot(container)
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

function handleKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented)
    return
  const key = event.key.toLowerCase()
  if (event.altKey && event.shiftKey && !event.metaKey && !event.ctrlKey && key === 'r') {
    event.preventDefault()
    const container = document.getElementById('react-devtools-overlay')
    if (container) {
      container.style.display = container.style.display === 'none' ? 'block' : 'none'
    }
  }
}

window.addEventListener('keydown', handleKeydown)

if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', init, { once: true })
else
  init()

// HMR support (Vite only)
// In webpack, import.meta.hot will be undefined, which is fine
if (typeof import.meta !== 'undefined' && (import.meta as any).hot) {
  (import.meta as any).hot.dispose(() => {
    window.removeEventListener('keydown', handleKeydown)
    root?.unmount()
    root = null
    const container = document.getElementById('react-devtools-overlay')
    container?.remove()
  })
}
