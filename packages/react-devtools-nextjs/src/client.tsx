'use client'

/**
 * DevTools Client Component for Next.js
 * 
 * Usage in app/layout.tsx:
 * ```tsx
 * import { DevToolsProvider } from '@react-devtools/nextjs/client'
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <DevToolsProvider />
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */

import React, { useEffect, useState } from 'react'

export interface DevToolsProviderProps {
  /**
   * API base path for DevTools
   * @default '/api/devtools'
   */
  apiBasePath?: string
}

/**
 * DevTools Provider Component
 * Renders the DevTools overlay and initializes all features
 */
export function DevToolsProvider({ apiBasePath }: DevToolsProviderProps) {
  const [DevTools, setDevTools] = useState<React.ComponentType<{ clientUrl: string }> | null>(null)
  
  // Get API base path from env or props
  const basePath = apiBasePath || 
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_REACT_DEVTOOLS_API_BASE_PATH) || 
    '/api/devtools'

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') {
      return
    }

    // Dynamically import to avoid SSR issues
    import('@react-devtools/overlay').then(async (mod) => {
      // Initialize DevTools features
      if (mod.initDevTools) {
        await mod.initDevTools({
          autoStartScan: true,
          installHook: false,
        })
      }
      
      setDevTools(() => mod.DevTools)
    }).catch((err) => {
      console.warn('[React DevTools] Failed to load overlay:', err)
    })
  }, [])

  // Don't render in production or on server
  if (process.env.NODE_ENV !== 'development' || !DevTools) {
    return null
  }

  return <DevTools clientUrl={basePath} />
}

// Default export for convenience
export default DevToolsProvider

