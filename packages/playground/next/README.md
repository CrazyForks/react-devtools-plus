# Next.js Playground

This playground demonstrates React DevTools Plus integration with Next.js (App Router).

## Quick Start

```bash
# From the monorepo root
pnpm install

# Build the plugin first
pnpm build

# Run this playground
pnpm --filter @react-devtools-plus/playground-next dev
```

## Integration Methods

### Method 1: withReactDevTools Wrapper + DevToolsProvider (Recommended)

1. Wrap your Next.js config with `withReactDevTools`:

```ts
// next.config.ts
import { withReactDevTools } from 'react-devtools-plus/next'

const nextConfig = {
  // your config
}

export default withReactDevTools(nextConfig)
```

2. Add DevToolsProvider to your layout:

```tsx
// app/layout.tsx
'use client'

import { DevToolsProvider } from 'react-devtools-plus/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <DevToolsProvider>{children}</DevToolsProvider>
      </body>
    </html>
  )
}
```

3. Create API routes to serve DevTools (see `src/app/api/devtools` in this playground for an example)

### Method 2: DevToolsProvider Only (Minimal Setup)

For a minimal setup, just add DevToolsProvider and an API route:

```tsx
// app/layout.tsx
import DevToolsProvider from '@/components/DevToolsProvider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <DevToolsProvider>{children}</DevToolsProvider>
      </body>
    </html>
  )
}
```

## Turbopack Support

Next.js 15+ uses Turbopack by default. The integration automatically detects Turbopack and uses client-side injection.

To run with Turbopack explicitly:

```bash
pnpm --filter @react-devtools-plus/playground-next dev:turbo
```

## Accessing DevTools

1. **Keyboard Shortcut**: Press `Option/Alt + Shift + D` to toggle the DevTools panel (when overlay is visible)
2. **URL**: Navigate to `http://localhost:3000/api/devtools` to view the DevTools client

## Features

- Component Tree inspection
- React Scan integration (render detection)
- Open in Editor support
- Timeline profiling
- Asset inspection

## Notes

- Next.js uses its own dev server (not webpack-dev-server), so DevTools are served via API routes
- The overlay is loaded dynamically after React hydration
- SSR/hydration is fully supported with proper "use client" directives
