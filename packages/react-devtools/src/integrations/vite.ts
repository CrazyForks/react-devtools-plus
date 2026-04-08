/**
 * Vite-specific integration logic
 * Vite 特定的集成逻辑
 */

import type { PreviewServer, ResolvedConfig, ViteDevServer } from 'vite'
import type { ResolvedPluginConfig } from '../config/types'
import fs from 'node:fs'
import path from 'node:path'
import { createAssetsMiddleware, createGraphMiddleware, createOpenInEditorMiddleware, getViteModuleGraph, serveClient } from '../middleware'
import {
  GLOBALS_CHUNK_NAME,
  OVERLAY_CHUNK_NAME,
  SCAN_CHUNK_NAME,
  VIRTUAL_PATH_PREFIX,
  VITE_GLOBALS_CACHE_FILE,
  VITE_SCAN_CACHE_FILE,
} from '../utils/paths'

/**
 * Create Vite output configuration
 * 创建 Vite 输出配置
 */
export function createOutputConfig(baseConfig: any) {
  return {
    ...baseConfig,
    manualChunks: (id: string, options: any, getModuleInfo: any) => {
      if (id.includes(VITE_GLOBALS_CACHE_FILE))
        return GLOBALS_CHUNK_NAME
      if (id.includes(VITE_SCAN_CACHE_FILE))
        return SCAN_CHUNK_NAME
      if (id.includes(OVERLAY_CHUNK_NAME) || id.includes('react-devtools-overlay.mjs')) {
        return OVERLAY_CHUNK_NAME
      }
      if (typeof baseConfig?.manualChunks === 'function') {
        return baseConfig.manualChunks(id, options, getModuleInfo)
      }
      return null
    },
  }
}

/**
 * Merge extra Rollup inputs (globals / scan bootstrap files) into the config
 */
export function createRollupInput(
  existingInput: any,
  overlayInput: string,
  root: string,
  extraEntries?: Record<string, string>,
): any {
  const appendExtrasToArray = (arr: string[]) => {
    const extras = extraEntries ? Object.values(extraEntries) : []
    return [...arr, overlayInput, ...extras]
  }

  const mergeObject = (obj: Record<string, any>) => ({
    ...obj,
    [OVERLAY_CHUNK_NAME]: overlayInput,
    ...(extraEntries || {}),
  })

  if (existingInput) {
    if (Array.isArray(existingInput)) {
      return appendExtrasToArray(existingInput)
    }
    if (typeof existingInput === 'object') {
      return mergeObject(existingInput)
    }
  }

  // When input is not set, Vite uses index.html as default
  const indexHtmlPath = path.resolve(root, 'index.html')
  if (fs.existsSync(indexHtmlPath)) {
    return mergeObject({ main: indexHtmlPath })
  }

  if (extraEntries && Object.keys(extraEntries).length > 0) {
    return {
      [OVERLAY_CHUNK_NAME]: overlayInput,
      ...extraEntries,
    }
  }

  return overlayInput
}

/**
 * Find emitted chunk fileName by logical chunk name (manualChunks) or path hint
 */
export function findRollupChunkFileName(bundle: Record<string, any>, chunkName: string): string | null {
  for (const [, chunk] of Object.entries(bundle)) {
    if (chunk?.type !== 'chunk')
      continue
    const c = chunk as { name?: string, fileName?: string }
    if (c.name === chunkName && c.fileName)
      return c.fileName
  }
  for (const [, chunk] of Object.entries(bundle)) {
    if (chunk?.type !== 'chunk')
      continue
    const c = chunk as { fileName?: string }
    if (typeof c.fileName === 'string' && c.fileName.includes(chunkName))
      return c.fileName
  }
  return null
}

/**
 * @deprecated Use findRollupChunkFileName(bundle, OVERLAY_CHUNK_NAME)
 */
export function findOverlayBundle(bundle: Record<string, any>): string | null {
  return findRollupChunkFileName(bundle, OVERLAY_CHUNK_NAME)
}

/**
 * Find a built asset under outDir (e.g. Vite emits JS under assets/)
 */
export function findOutputFileRelativeTo(
  outDirAbs: string,
  predicate: (baseName: string) => boolean,
): string | null {
  if (!fs.existsSync(outDirAbs))
    return null

  function walk(dir: string): string | null {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name)
      if (ent.isDirectory()) {
        const found = walk(full)
        if (found)
          return found
      }
      else if (predicate(ent.name)) {
        return path.relative(outDirAbs, full).split(path.sep).join('/')
      }
    }
    return null
  }

  return walk(outDirAbs)
}

/**
 * Replace Vite dev-only @id/ URLs in built HTML with real emitted asset paths
 */
export function patchBuiltHtmlDevtoolsAssets(
  htmlPath: string,
  replacements: { overlay?: string, globals?: string, scan?: string },
  base: string,
) {
  if (!fs.existsSync(htmlPath))
    return

  let htmlContent = fs.readFileSync(htmlPath, 'utf-8')
  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  if (replacements.overlay) {
    const actualPath = `${base}${replacements.overlay}`
    htmlContent = htmlContent.replace(
      new RegExp(escapeRegex(`${base}assets/react-devtools-overlay.js`), 'g'),
      actualPath,
    )
    htmlContent = htmlContent.replace(
      new RegExp(escapeRegex(`${base}@id/${VIRTUAL_PATH_PREFIX}main.tsx`), 'g'),
      actualPath,
    )
  }

  if (replacements.globals) {
    const actualPath = `${base}${replacements.globals}`
    htmlContent = htmlContent.replace(
      new RegExp(escapeRegex(`${base}@id/__react-devtools-globals__`), 'g'),
      actualPath,
    )
  }

  if (replacements.scan) {
    const actualPath = `${base}${replacements.scan}`
    htmlContent = htmlContent.replace(
      new RegExp(escapeRegex(`import '${base}@id/__react-devtools-scan__'`), 'g'),
      `import '${actualPath}'`,
    )
    htmlContent = htmlContent.replace(
      new RegExp(escapeRegex(`import \"${base}@id/__react-devtools-scan__\"`), 'g'),
      `import \"${actualPath}\"`,
    )
    htmlContent = htmlContent.replace(
      new RegExp(escapeRegex(`${base}@id/__react-devtools-scan__`), 'g'),
      actualPath,
    )
  }

  fs.writeFileSync(htmlPath, htmlContent, 'utf-8')
}

/**
 * Update HTML with overlay bundle path
 * 使用 overlay bundle 路径更新 HTML
 */
export function updateHtmlWithOverlayPath(
  htmlPath: string,
  overlayBundleName: string,
  base: string,
) {
  patchBuiltHtmlDevtoolsAssets(htmlPath, { overlay: overlayBundleName }, base)
}

/**
 * Setup Vite dev server middlewares
 * 设置 Vite 开发服务器中间件
 */
export function setupDevServerMiddlewares(
  server: ViteDevServer,
  config: ResolvedPluginConfig,
  clientPath: string,
) {
  const base = server.config.base || '/'

  // Open in editor middleware
  server.middlewares.use(createOpenInEditorMiddleware(
    config.projectRoot,
    config.sourcePathMode,
    config.launchEditor,
  ))

  // Graph middleware for module dependency visualization (must be before client serving)
  server.middlewares.use(createGraphMiddleware(
    getViteModuleGraph(server, config.projectRoot),
    base,
  ))

  // Assets middleware for project files browsing
  server.middlewares.use(createAssetsMiddleware({
    root: config.projectRoot,
    publicDir: server.config.publicDir || 'public',
    baseUrl: base,
  }))

  // Client serving middleware
  server.middlewares.use(`${base}__react_devtools__`, serveClient(clientPath))
}

/**
 * Setup Vite preview server middlewares
 * 设置 Vite 预览服务器中间件
 */
export function setupPreviewServerMiddlewares(
  server: PreviewServer,
  config: ResolvedPluginConfig,
  clientPath: string,
) {
  // Open in editor middleware
  server.middlewares.use(createOpenInEditorMiddleware(
    config.projectRoot,
    config.sourcePathMode,
    config.launchEditor,
  ))

  // Client serving middleware
  const base = server.config.base || '/'
  server.middlewares.use(`${base}__react_devtools__`, serveClient(clientPath))
}

/**
 * Get Vite mode and command from config
 * 从配置中获取 Vite 模式和命令
 *
 * Priority for mode detection:
 * 1. Vite config.mode (explicit configuration)
 * 2. NODE_ENV environment variable (commonly used in Node.js ecosystem)
 * 3. Default to 'development'
 */
export function getViteModeAndCommand(viteConfig: ResolvedConfig): {
  mode: string
  command: 'build' | 'serve'
} {
  return {
    // Consider both Vite mode and NODE_ENV for environment detection
    mode: viteConfig.mode || process.env.NODE_ENV || 'development',
    command: viteConfig.command,
  }
}
