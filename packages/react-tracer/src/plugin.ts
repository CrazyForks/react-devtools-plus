/**
 * ReactTracer unplugin — standalone build plugin for source tracing.
 *
 * Supports Vite, Webpack, and Rspack via `unplugin`.
 *
 * Build-time responsibilities:
 * 1. Injects `data-source-path` attributes into JSX elements via Babel
 * 2. Registers `/__open-in-editor` server middleware
 */

import type { UnpluginFactory } from 'unplugin'
import type { ReactTracerOptions, SourcePathMode } from './types'
import process from 'node:process'
import { createUnplugin } from 'unplugin'
import { createOpenInEditorMiddleware } from './middleware'
import { shouldProcessFile, transformSourceCode } from './transform'

function resolveEnabled(
  enabled: boolean | 'dev' | 'prod',
  command: 'serve' | 'build',
): boolean {
  if (enabled === 'dev')
    return command === 'serve'
  if (enabled === 'prod')
    return command === 'build'
  return !!enabled
}

const unpluginFactory: UnpluginFactory<ReactTracerOptions | undefined> = (options = {}) => {
  const {
    enabled = 'dev',
    sourcePathMode = 'relative',
    launchEditor,
  } = options || {}

  let isEnabled = true
  let projectRoot = process.cwd()

  return {
    name: 'react-tracer',
    enforce: 'pre',

    transformInclude(id: string) {
      if (!isEnabled)
        return false
      return /\.[jt]sx$/.test(id)
    },

    transform(code: string, id: string) {
      if (!isEnabled)
        return null
      const filename = id.split('?', 2)[0]
      if (!shouldProcessFile(filename))
        return null
      return transformSourceCode(code, filename, projectRoot, sourcePathMode as SourcePathMode)
    },

    // Vite-specific hooks
    vite: {
      configResolved(config: any) {
        projectRoot = config.root || process.cwd()
        isEnabled = resolveEnabled(enabled, config.command)
      },

      configureServer(server: any) {
        if (!isEnabled)
          return
        server.middlewares.use(
          createOpenInEditorMiddleware(projectRoot, sourcePathMode as SourcePathMode, launchEditor),
        )
      },
    },

    // Webpack-specific hooks
    webpack(compiler: any) {
      projectRoot = compiler.options.context || process.cwd()
      const mode = compiler.options.mode || 'development'
      const isServe = process.env.WEBPACK_SERVE === 'true'
        || (compiler.options.devServer && mode === 'development')
      isEnabled = resolveEnabled(enabled, isServe ? 'serve' : 'build')

      if (!isEnabled)
        return

      // Setup dev server middleware for open-in-editor
      if (isServe) {
        const middleware = createOpenInEditorMiddleware(projectRoot, sourcePathMode as SourcePathMode, launchEditor)

        // Webpack 5 devServer.setupMiddlewares
        const originalSetupMiddlewares = compiler.options.devServer?.setupMiddlewares
        if (compiler.options.devServer) {
          compiler.options.devServer.setupMiddlewares = (middlewares: any[], devServer: any) => {
            middlewares.unshift({ name: 'react-tracer', middleware })
            if (originalSetupMiddlewares) {
              return originalSetupMiddlewares(middlewares, devServer)
            }
            return middlewares
          }
        }
      }
    },

    // Rspack-specific hooks
    rspack(compiler: any) {
      projectRoot = compiler.options.context || process.cwd()
      const mode = compiler.options.mode || 'development'
      const isServe = process.env.RSPACK_SERVE === 'true'
        || process.env.WEBPACK_SERVE === 'true'
        || (compiler.options.devServer && mode === 'development')
      isEnabled = resolveEnabled(enabled, isServe ? 'serve' : 'build')
    },
  }
}

export const unplugin = createUnplugin(unpluginFactory)

/**
 * Create a ReactTracer Vite plugin.
 *
 * @example
 * ```ts
 * import { defineConfig } from 'vite'
 * import { ReactTracer } from 'react-tracer'
 *
 * export default defineConfig({
 *   plugins: [ReactTracer()],
 * })
 * ```
 */
export function ReactTracer(options?: ReactTracerOptions) {
  return unplugin.vite(options)
}
