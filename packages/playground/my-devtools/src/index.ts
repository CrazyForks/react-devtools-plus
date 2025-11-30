import type { ReactDevToolsPluginOptions } from 'react-devtools'
import ReactDevTools from 'react-devtools'
import { getBuiltinPlugins } from './plugins'

// Merge user options with our defaults
function resolveOptions(options: ReactDevToolsPluginOptions = {}): ReactDevToolsPluginOptions {
  const builtinPlugins = getBuiltinPlugins()

  return {
    ...options,
    // Ensure scan is enabled by default if not provided
    scan: options.scan ?? {
      enabled: true,
      showToolbar: false,
      animationSpeed: 'fast',
    },
    plugins: [
      ...builtinPlugins,
      ...(options.plugins || []),
    ],
  }
}

export const vite = (options?: ReactDevToolsPluginOptions) => {
  return ReactDevTools.vite(resolveOptions(options))
}

export const webpack = (options?: ReactDevToolsPluginOptions) => {
  return ReactDevTools.webpack(resolveOptions(options))
}

export default {
  vite,
  webpack,
}

export type { ReactDevToolsPluginOptions }
