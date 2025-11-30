/**
 * DevTools API Route Handler for Next.js
 * 
 * Usage in app/api/devtools/[[...slug]]/route.ts:
 * ```ts
 * export { GET, POST } from '@react-devtools/nextjs/middleware'
 * ```
 */

import fs from 'node:fs'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import { resolvePluginConfig, getClientPath } from 'react-devtools'

// Content type mapping
const contentTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

// Lazy-loaded config and paths
let cachedConfig: any = null
let cachedClientPath: string | null = null

function getConfig() {
  if (cachedConfig) return cachedConfig
  
  const projectRoot = process.cwd()
  const optionsJson = process.env.NEXT_PUBLIC_REACT_DEVTOOLS_OPTIONS || '{}'
  const options = JSON.parse(optionsJson)
  
  cachedConfig = resolvePluginConfig(options, projectRoot, 'development', 'serve')
  return cachedConfig
}

function getClientDistPath(): string {
  if (cachedClientPath) return cachedClientPath
  
  const projectRoot = process.cwd()
  
  // Try to find react-devtools-client dist
  const possiblePaths = [
    // In monorepo
    path.resolve(projectRoot, '../../react-devtools-client/dist'),
    path.resolve(projectRoot, '../react-devtools-client/dist'),
    // In node_modules
    path.resolve(projectRoot, 'node_modules/@react-devtools/client/dist'),
    path.resolve(projectRoot, 'node_modules/react-devtools-client/dist'),
  ]
  
  for (const p of possiblePaths) {
    if (fs.existsSync(path.join(p, 'index.html'))) {
      cachedClientPath = p
      return p
    }
  }
  
  // Fallback: try getClientPath from react-devtools
  try {
    const reactDevtoolsPath = require.resolve('react-devtools')
    cachedClientPath = getClientPath(path.dirname(reactDevtoolsPath))
    return cachedClientPath
  } catch {
    throw new Error('[React DevTools] Could not find client distribution')
  }
}

function getApiBasePath(): string {
  return process.env.NEXT_PUBLIC_REACT_DEVTOOLS_API_BASE_PATH || '/api/devtools'
}

// Handle plugins manifest
function handlePluginsManifest(): NextResponse {
  const config = getConfig()
  const apiBasePath = getApiBasePath()
  const plugins = config.plugins || []
  
  const manifest = plugins.map((plugin: any) => ({
    ...plugin,
    view: plugin.view ? {
      ...plugin.view,
      src: `${apiBasePath}/file?path=${encodeURIComponent(plugin.view.src)}`,
    } : undefined,
  }))
  
  return NextResponse.json(manifest)
}

// Handle plugin file transformation
function handlePluginFile(filePath: string): NextResponse | null {
  if (!filePath || !fs.existsSync(filePath)) {
    return null
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    
    // Transform JSX/TSX using Babel
    const babel = require('@babel/core')
    const result = babel.transformSync(content, {
      presets: [
        ['@babel/preset-react', { runtime: 'classic' }],
        ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
      ],
      filename: filePath,
    })
    
    let code = result?.code || content
    
    // Replace React imports with global React
    code = code.replace(
      /import\s+React\s*(?:,\s*\{[^}]*\})?\s*from\s*['"]react['"]\s*;?/g,
      'const React = window.React;'
    )
    code = code.replace(
      /import\s*\{([^}]*)\}\s*from\s*['"]react['"]\s*;?/g,
      (_match: string, imports: string) => {
        const importList = imports.split(',').map((i: string) => i.trim()).filter(Boolean)
        return `const { ${importList.join(', ')} } = window.React;`
      }
    )
    
    return new NextResponse(code, {
      headers: { 'Content-Type': 'application/javascript' },
    })
  } catch (error) {
    console.error('[React DevTools] Failed to transform plugin file:', error)
    return null
  }
}

// Handle open-in-editor
function handleOpenInEditor(file: string): NextResponse {
  try {
    const launchEditor = require('launch-editor')
    launchEditor(file, 'code') // Default to VS Code
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[React DevTools] Failed to open editor:', e)
    return NextResponse.json({ error: 'Failed to open editor' }, { status: 500 })
  }
}

// Handle static file serving
function handleStaticFile(urlPath: string, rewriteAssetPaths: boolean = false): NextResponse | null {
  const clientPath = getClientDistPath()
  const apiBasePath = getApiBasePath()
  
  // Default to index.html
  let filePath = urlPath
  if (filePath === '' || filePath === '/') {
    filePath = '/index.html'
  }
  
  const fullPath = path.join(clientPath, filePath)
  
  // Security check
  if (!fullPath.startsWith(clientPath)) {
    return null
  }
  
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    const ext = path.extname(fullPath).toLowerCase()
    
    // For HTML files, rewrite relative asset paths to absolute
    if (ext === '.html' && rewriteAssetPaths) {
      let htmlContent = fs.readFileSync(fullPath, 'utf-8')
      htmlContent = htmlContent.replace(/\.\/assets\//g, `${apiBasePath}/assets/`)
      return new NextResponse(htmlContent, {
        headers: { 'Content-Type': 'text/html' },
      })
    }
    
    const content = fs.readFileSync(fullPath)
    return new NextResponse(content, {
      headers: { 'Content-Type': contentTypes[ext] || 'application/octet-stream' },
    })
  }
  
  return null
}

// Main GET handler
export async function GET(
  request: NextRequest,
  { params }: { params: { slug?: string[] } }
) {
  const slug = params.slug || []
  const urlPath = '/' + slug.join('/')
  const searchParams = request.nextUrl.searchParams
  
  // Handle plugins manifest
  if (urlPath === '/plugins-manifest.json') {
    return handlePluginsManifest()
  }
  
  // Handle plugin file
  if (urlPath === '/file') {
    const filePath = searchParams.get('path')
    if (filePath) {
      const response = handlePluginFile(filePath)
      if (response) return response
    }
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
  
  // Handle open-in-editor
  if (urlPath === '/open-in-editor') {
    const file = searchParams.get('file')
    if (file) {
      return handleOpenInEditor(file)
    }
    return NextResponse.json({ error: 'No file specified' }, { status: 400 })
  }
  
  // Serve static files from client
  const isRoot = urlPath === '/' || urlPath === ''
  const response = handleStaticFile(urlPath, isRoot)
  if (response) return response
  
  // Fallback: serve index.html for SPA routing
  const fallbackResponse = handleStaticFile('/index.html', true)
  if (fallbackResponse) return fallbackResponse
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

// Main POST handler
export async function POST(
  request: NextRequest,
  { params }: { params: { slug?: string[] } }
) {
  const slug = params.slug || []
  const urlPath = '/' + slug.join('/')
  
  // Handle open-in-editor POST
  if (urlPath === '/open-in-editor') {
    const body = await request.json().catch(() => ({}))
    const file = body.file
    if (file) {
      return handleOpenInEditor(file)
    }
    return NextResponse.json({ error: 'No file specified' }, { status: 400 })
  }
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

