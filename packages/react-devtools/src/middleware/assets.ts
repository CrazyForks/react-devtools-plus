/**
 * Assets middleware for React DevTools
 * Supports both Vite and Webpack
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import fsp from 'node:fs/promises'
import path from 'node:path'

// Asset types
export type AssetType = 'image' | 'font' | 'video' | 'audio' | 'text' | 'json' | 'wasm' | 'other'

export interface AssetInfo {
  path: string
  type: AssetType
  publicPath: string
  relativePath: string
  filePath: string
  size: number
  mtime: number
}

export interface ImageMeta {
  width: number
  height: number
  orientation?: number
  type?: string
  mimeType?: string
}

export interface AssetImporter {
  url: string
  id?: string
}

// Guess asset type from file extension
function guessType(filePath: string): AssetType {
  if (/\.(?:png|jpe?g|jxl|gif|svg|webp|avif|ico|bmp|tiff?)$/i.test(filePath))
    return 'image'
  // Check text BEFORE video to avoid .ts (TypeScript) being matched as video (.ts = MPEG transport stream)
  if (/\.(?:json[5c]?|te?xt|[mc]?[jt]sx?|md[cx]?|markdown|ya?ml|toml)$/i.test(filePath))
    return 'text'
  // Note: removed 'ts' from video pattern to avoid conflict with TypeScript files
  if (/\.(?:mp4|webm|ogv|mov|avi|flv|wmv|mpg|mpeg|mkv|3gp|3g2|mts|m2ts|vob|ogm|ogx|rm|rmvb|asf|amv|divx|m4v|svi|viv|f4v|f4p|f4a|f4b)$/i.test(filePath))
    return 'video'
  if (/\.(?:mp3|wav|ogg|flac|aac|wma|alac|ape|ac3|dts|tta|opus|amr|aiff|au|mid|midi|ra|rm|wv|weba|dss|spx|vox|tak|dsf|dff|dsd|cda)$/i.test(filePath))
    return 'audio'
  if (/\.(?:woff2?|eot|ttf|otf|ttc|pfa|pfb|pfm|afm)$/i.test(filePath))
    return 'font'
  if (/\.wasm$/i.test(filePath))
    return 'wasm'
  return 'other'
}

// Default file patterns to scan
const FILE_PATTERNS = [
  // image
  '**/*.{png,jpg,jpeg,gif,svg,webp,avif,ico,bmp,tiff}',
  // video
  '**/*.{mp4,webm,ogv,mov,avi,flv,wmv,mpg,mpeg,mkv,3gp,3g2,m2ts,vob,ogm,ogx,rm,rmvb,asf,amv,divx,m4v,svi,viv,f4v,f4p,f4a,f4b}',
  // audio
  '**/*.{mp3,wav,ogg,flac,aac,wma,alac,ape,ac3,dts,tta,opus,amr,aiff,au,mid,midi,ra,rm,wv,weba,dss,spx,vox,tak,dsf,dff,dsd,cda}',
  // font
  '**/*.{woff,woff2,eot,ttf,otf,ttc,pfa,pfb,pfm,afm}',
  // text
  '**/*.{json,json5,jsonc,txt,text,tsx,jsx,ts,js,md,mdx,mdc,markdown,yaml,yml,toml}',
  // wasm
  '**/*.wasm',
]

// Directories to ignore
const IGNORE_DIRS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.git/**',
  '**/package-lock.*',
  '**/pnpm-lock.*',
  '**/yarn.lock',
  '**/pnpm-workspace.*',
]

interface AssetsConfig {
  root: string
  publicDir?: string
  baseUrl?: string
}

// Assets scanner class
export class AssetsScanner {
  private config: AssetsConfig
  private cache: AssetInfo[] | null = null
  private imageMetaCache = new Map<string, ImageMeta | undefined>()

  constructor(config: AssetsConfig) {
    this.config = {
      root: config.root,
      publicDir: config.publicDir || 'public',
      baseUrl: config.baseUrl || '/',
    }
  }

  async scan(): Promise<AssetInfo[]> {
    const { root, publicDir, baseUrl } = this.config

    try {
      // Dynamic import fast-glob
      const fg = await import('fast-glob').then(m => m.default || m)

      const resolvedPublicDir = path.isAbsolute(publicDir!)
        ? publicDir!
        : path.resolve(root, publicDir!)

      const relativePublicDir = path.relative(root, resolvedPublicDir)

      const files = await fg(FILE_PATTERNS, {
        cwd: root,
        onlyFiles: true,
        caseSensitiveMatch: false,
        ignore: IGNORE_DIRS,
      })

      this.cache = await Promise.all(files.map(async (relativePath: string) => {
        const filePath = path.resolve(root, relativePath)
        const stat = await fsp.lstat(filePath)

        // Remove public prefix to resolve assets correctly
        const assetPath = relativePath.replace(new RegExp(`^${relativePublicDir}/`), '')

        return {
          path: assetPath,
          relativePath,
          publicPath: path.posix.join(baseUrl!, assetPath),
          filePath,
          type: guessType(relativePath),
          size: stat.size,
          mtime: stat.mtimeMs,
        }
      }))

      return this.cache
    }
    catch (error) {
      console.error('[React DevTools] Failed to scan assets:', error)
      return []
    }
  }

  async getAssets(): Promise<AssetInfo[]> {
    if (this.cache)
      return this.cache
    return this.scan()
  }

  clearCache() {
    this.cache = null
  }

  async getImageMeta(filepath: string): Promise<ImageMeta | undefined> {
    if (this.imageMetaCache.has(filepath))
      return this.imageMetaCache.get(filepath)

    try {
      // Dynamic import image-meta
      const { imageMeta } = await import('image-meta')
      const buffer = await fsp.readFile(filepath)
      const meta = imageMeta(buffer) as ImageMeta
      this.imageMetaCache.set(filepath, meta)
      return meta
    }
    catch (e) {
      this.imageMetaCache.set(filepath, undefined)
      return undefined
    }
  }

  async getTextContent(filepath: string, limit = 500): Promise<string | undefined> {
    try {
      const content = await fsp.readFile(filepath, 'utf-8')
      return content.slice(0, limit)
    }
    catch (e) {
      return undefined
    }
  }
}

// Global assets scanner instance
let globalScanner: AssetsScanner | null = null

export function getAssetsScanner(): AssetsScanner | null {
  return globalScanner
}

export function createAssetsScanner(config: AssetsConfig): AssetsScanner {
  globalScanner = new AssetsScanner(config)
  return globalScanner
}

// Create assets middleware for HTTP requests
export function createAssetsMiddleware(config: AssetsConfig) {
  const scanner = createAssetsScanner(config)

  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const rawUrl = req.url || ''
    const url = new URL(rawUrl, 'http://localhost')

    // Handle assets API endpoints
    if (url.pathname === '/__react_devtools__/api/assets') {
      try {
        const assets = await scanner.getAssets()
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.end(JSON.stringify(assets))
        return
      }
      catch (e) {
        res.statusCode = 500
        res.end(JSON.stringify({ error: 'Failed to scan assets' }))
        return
      }
    }

    if (url.pathname === '/__react_devtools__/api/assets/refresh') {
      try {
        scanner.clearCache()
        const assets = await scanner.scan()
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.end(JSON.stringify(assets))
        return
      }
      catch (e) {
        res.statusCode = 500
        res.end(JSON.stringify({ error: 'Failed to refresh assets' }))
        return
      }
    }

    if (url.pathname === '/__react_devtools__/api/assets/image-meta') {
      const filepath = url.searchParams.get('path')
      if (!filepath) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: 'Missing path parameter' }))
        return
      }
      try {
        const meta = await scanner.getImageMeta(filepath)
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.end(JSON.stringify(meta || null))
        return
      }
      catch (e) {
        res.statusCode = 500
        res.end(JSON.stringify({ error: 'Failed to get image meta' }))
        return
      }
    }

    if (url.pathname === '/__react_devtools__/api/assets/text-content') {
      const filepath = url.searchParams.get('path')
      const limit = Number.parseInt(url.searchParams.get('limit') || '500', 10)
      if (!filepath) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: 'Missing path parameter' }))
        return
      }
      try {
        const content = await scanner.getTextContent(filepath, limit)
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.end(JSON.stringify({ content: content || null }))
        return
      }
      catch (e) {
        res.statusCode = 500
        res.end(JSON.stringify({ error: 'Failed to get text content' }))
        return
      }
    }

    next()
  }
}
