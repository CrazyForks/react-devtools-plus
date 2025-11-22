import type { PluginOption, PreviewServer, ResolvedConfig, ViteDevServer } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { bold, cyan, green, yellow } from 'kolorist'
import sirv from 'sirv'
import { normalizePath } from 'vite'
import { DIR_OVERLAY } from './dir.js'

// Constants
const OVERLAY_ENTRY_ID = '\0react-devtools-overlay-entry'
const OVERLAY_CHUNK_NAME = 'react-devtools-overlay'
const VIRTUAL_PATH_PREFIX = 'virtual:react-devtools-path:'
const DEVTOOLS_OPTIONS_ID = 'virtual:react-devtools-options'
const RESOLVED_OPTIONS_ID = `\0${DEVTOOLS_OPTIONS_ID}`
const STANDALONE_FLAG = '__REACT_DEVTOOLS_OVERLAY_STANDALONE__'

// Utility functions
function getPluginPath() {
  const currentPath = normalizePath(path.dirname(fileURLToPath(import.meta.url)))
  return currentPath.replace(/\/dist$/, '/src')
}

function getClientPath(reactDevtoolsPath: string) {
  const clientPath = path.resolve(reactDevtoolsPath, '../../react-devtools-client')
  const oldClientPath = path.resolve(reactDevtoolsPath, '../client')
  const clientDistPath = path.resolve(clientPath, 'dist')

  return (fs.existsSync(clientDistPath) && fs.existsSync(path.resolve(clientDistPath, 'index.html')))
    ? clientDistPath
    : oldClientPath
}

function isOverlayPath(id: string): boolean {
  return id.includes(OVERLAY_CHUNK_NAME) || id.includes(DIR_OVERLAY)
}

function createOutputConfig(baseConfig: any) {
  return {
    ...baseConfig,
    manualChunks: (id: string, options: any, getModuleInfo: any) => {
      if (isOverlayPath(id)) {
        return OVERLAY_CHUNK_NAME
      }
      if (typeof baseConfig?.manualChunks === 'function') {
        return baseConfig.manualChunks(id, options, getModuleInfo)
      }
      return null
    },
  }
}

function createRollupInput(
  existingInput: any,
  overlayInput: string,
  root: string,
): any {
  if (existingInput) {
    if (Array.isArray(existingInput)) {
      return [...existingInput, overlayInput]
    }
    if (typeof existingInput === 'object') {
      return {
        ...existingInput,
        [OVERLAY_CHUNK_NAME]: overlayInput,
      }
    }
  }

  // When input is not set, Vite uses index.html as default
  const indexHtmlPath = path.resolve(root, 'index.html')
  if (fs.existsSync(indexHtmlPath)) {
    return {
      main: indexHtmlPath,
      [OVERLAY_CHUNK_NAME]: overlayInput,
    }
  }

  return overlayInput
}

function findOverlayBundle(bundle: Record<string, any>): string | null {
  for (const [key, chunk] of Object.entries(bundle)) {
    if (chunk?.type === 'chunk' && (key === OVERLAY_CHUNK_NAME || chunk.name === OVERLAY_CHUNK_NAME)) {
      return chunk.fileName
    }
  }
  return null
}

function updateHtmlWithOverlayPath(
  htmlPath: string,
  overlayBundleName: string,
  base: string,
) {
  let htmlContent = fs.readFileSync(htmlPath, 'utf-8')
  const placeholderPath = `${base}assets/react-devtools-overlay.js`
  const virtualPath = `${base}@id/${VIRTUAL_PATH_PREFIX}main.tsx`
  const actualPath = `${base}${overlayBundleName}`

  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  htmlContent = htmlContent.replace(new RegExp(escapeRegex(placeholderPath), 'g'), actualPath)
  htmlContent = htmlContent.replace(new RegExp(escapeRegex(virtualPath), 'g'), actualPath)

  fs.writeFileSync(htmlPath, htmlContent, 'utf-8')
}

function resolveOverlayPath(normalizedId: string, reactDevtoolsPath: string): string | null {
  if (!normalizedId.startsWith(VIRTUAL_PATH_PREFIX)) {
    return null
  }

  const pathPart = normalizedId.replace(VIRTUAL_PATH_PREFIX, '')
  const basePath = pathPart.replace(/\.mjs$/, '')
  const hasExtension = /\.(?:tsx?|jsx?)$/.test(basePath)

  const paths = [
    hasExtension ? path.join(DIR_OVERLAY, basePath) : path.join(DIR_OVERLAY, `${basePath}.tsx`),
    path.join(DIR_OVERLAY, hasExtension ? basePath.replace(/\.tsx$/, '.ts') : `${basePath}.ts`),
    path.join(reactDevtoolsPath, 'overlay', pathPart),
  ]

  for (const p of paths) {
    if (fs.existsSync(p)) {
      return normalizePath(p)
    }
  }

  return normalizePath(path.join(reactDevtoolsPath, 'overlay', pathPart))
}

export interface ReactDevToolsPluginOptions {
  /**
   * Insert overlay script by appending to files that match this filter.
   * When not provided, the script will be injected into index.html automatically.
   */
  appendTo?: string | RegExp
  /**
   * Enable DevTools in specific environments.
   * - When not provided (default), DevTools will be enabled in dev mode (`vite dev`) and disabled in build mode (`vite build`).
   * - When set to `true`, same as default behavior (enabled in serve, disabled in build).
   * - When set to `false`, DevTools will be disabled in all environments.
   * - When set to an array of environment names (e.g., `['development', 'test']`),
   *   DevTools will be enabled in those environments during build mode.
   * - Environment is determined by `process.env.NODE_ENV` or Vite's `--mode` flag.
   *
   * @example
   * // Default: enabled in dev mode, disabled in build mode
   * ReactDevTools()
   *
   * // Enable only in dev and test environments (including build mode)
   * ReactDevTools({ enabledEnvironments: ['development', 'test'] })
   *
   * // Disable in all environments
   * ReactDevTools({ enabledEnvironments: false })
   */
  enabledEnvironments?: boolean | string[]
}

function shouldEnableDevTools(
  enabledEnvironments: boolean | string[] | undefined,
  mode: string,
  command: 'build' | 'serve',
): boolean {
  if (process.env.VITE_REACT_DEVTOOLS_ENABLED !== undefined) {
    return process.env.VITE_REACT_DEVTOOLS_ENABLED === 'true'
  }

  if (enabledEnvironments === true) {
    return command === 'serve'
  }

  if (enabledEnvironments === false) {
    return false
  }

  if (Array.isArray(enabledEnvironments)) {
    const nodeEnv = process.env.NODE_ENV || mode
    return enabledEnvironments.includes(nodeEnv) || enabledEnvironments.includes(mode)
  }

  return command === 'serve'
}

export default function ReactDevToolsPlugin(options?: ReactDevToolsPluginOptions): PluginOption {
  console.warn(yellow('[React DevTools] You are currently using a legacy Vite-specific build method. It is recommended to switch to an implementation based on unplugin.'))

  const reactDevtoolsPath = getPluginPath()
  const pluginOptions = options ?? {}
  const enabledEnvironments = options?.enabledEnvironments
  let config: ResolvedConfig

  function serveClient(server: ViteDevServer | PreviewServer) {
    const base = server.config.base || '/'
    const servePath = getClientPath(reactDevtoolsPath)

    server.middlewares.use(`${base}__react_devtools__`, sirv(servePath, {
      single: true,
      dev: true,
    }))

    const originalPrintUrls = server.printUrls
    server.printUrls = () => {
      originalPrintUrls()
      const urls = server.resolvedUrls
      if (!urls)
        return

      const shortcut = process.platform === 'darwin' ? 'Option(⌥)+Shift(⇧)+R' : 'Alt(⌥)+Shift(⇧)+R'
      const colorUrl = (value: string) => cyan(value.replace(/:(\d+)\//, (_, port) => `:${bold(port)}/`))

      for (const url of urls.local) {
        const devtoolsUrl = url.endsWith('/') ? `${url}__react_devtools__/` : `${url}/__react_devtools__/`
        console.log(`  ${green('➜')}  ${bold('React DevTools')}: Open ${colorUrl(devtoolsUrl)} to view component tree`)
        console.log(`  ${green('➜')}  ${bold('React DevTools')}: Press ${cyan(shortcut)} in the app to toggle the overlay`)
      }
    }
  }

  return <PluginOption>{
    name: 'vite-plugin-react-devtools',
    enforce: 'pre',
    apply(config, env) {
      return shouldEnableDevTools(
        enabledEnvironments,
        env.mode || config.mode || 'development',
        env.command,
      )
    },
    configResolved(resolved) {
      config = resolved
      if (resolved.server) {
        resolved.server.fs.allow = [
          ...(resolved.server.fs.allow || []),
          DIR_OVERLAY,
          path.resolve(DIR_OVERLAY, '..'),
        ]
      }
    },
    config(config, env) {
      if (env.command !== 'build') {
        return {}
      }

      const currentMode = env.mode || config.mode || 'development'
      const isEnabled = shouldEnableDevTools(enabledEnvironments, currentMode, env.command)

      if (!isEnabled) {
        return {}
      }

      const overlayMainPath = path.join(DIR_OVERLAY, 'main.tsx')
      if (!fs.existsSync(overlayMainPath)) {
        return {}
      }

      const existingInput = config.build?.rollupOptions?.input
      const existingOutput = config.build?.rollupOptions?.output

      const outputConfig = Array.isArray(existingOutput)
        ? existingOutput.map(createOutputConfig)
        : existingOutput
          ? createOutputConfig(existingOutput)
          : createOutputConfig({})

      const input = createRollupInput(existingInput, OVERLAY_ENTRY_ID, config.root || process.cwd())

      return {
        build: {
          ...config.build,
          rollupOptions: {
            ...config.build?.rollupOptions,
            input,
            output: outputConfig,
          },
        },
      }
    },
    configureServer(server) {
      serveClient(server)
    },
    configurePreviewServer(server) {
      serveClient(server)
    },
    async resolveId(id) {
      if (id === DEVTOOLS_OPTIONS_ID) {
        return RESOLVED_OPTIONS_ID
      }

      if (id === OVERLAY_ENTRY_ID) {
        const overlayMainPath = path.join(DIR_OVERLAY, 'main.tsx')
        return fs.existsSync(overlayMainPath) ? overlayMainPath : null
      }

      const normalizedId = id.startsWith('@id/') ? id.replace('@id/', '') : id
      return resolveOverlayPath(normalizedId, reactDevtoolsPath)
    },
    async load(id) {
      if (id === RESOLVED_OPTIONS_ID) {
        const enabled = shouldEnableDevTools(
          enabledEnvironments,
          config.mode || 'development',
          config.command,
        )
        return `export default ${JSON.stringify({
          base: config.base || '/',
          enabled,
        })}`
      }
      return null
    },
    transform(code, id, options) {
      if (options?.ssr)
        return null

      const filename = id.split('?', 2)[0]
      const appendTo = pluginOptions.appendTo
      if (!appendTo)
        return null

      const matches = typeof appendTo === 'string'
        ? filename.endsWith(appendTo)
        : appendTo instanceof RegExp && appendTo.test(filename)

      return matches
        ? { code: `import '${VIRTUAL_PATH_PREFIX}overlay.ts';\n${code}`, map: null }
        : null
    },
    transformIndexHtml(html, ctx) {
      if (pluginOptions.appendTo)
        return

      const enabled = shouldEnableDevTools(
        enabledEnvironments,
        config.mode || 'development',
        config.command,
      )

      if (!enabled)
        return html

      const base = config.base || '/'
      const scriptSrc = config.command === 'build'
        ? `${base}assets/react-devtools-overlay.js`
        : `${base}@id/${VIRTUAL_PATH_PREFIX}main.tsx`

      return {
        html,
        tags: [
          {
            tag: 'script',
            injectTo: 'head',
            children: `window.${STANDALONE_FLAG} = true;`,
          },
          {
            tag: 'script',
            injectTo: 'head',
            attrs: { type: 'module', src: scriptSrc },
          },
        ],
      }
    },
    generateBundle(options, bundle) {
      if (config.command === 'build') {
        const overlayBundleName = findOverlayBundle(bundle)
        if (overlayBundleName) {
          ;(this as any).__overlayBundleName = overlayBundleName
        }
      }
    },
    writeBundle(options, bundle) {
      if (config.command !== 'build')
        return

      const overlayBundleName = (this as any).__overlayBundleName
      if (!overlayBundleName)
        return

      const outDir = options.dir || config.build?.outDir || 'dist'
      const htmlPath = path.resolve(outDir, 'index.html')

      if (fs.existsSync(htmlPath)) {
        updateHtmlWithOverlayPath(htmlPath, overlayBundleName, config.base || '/')
      }
    },
  }
}
