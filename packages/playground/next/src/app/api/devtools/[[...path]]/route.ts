import fs from 'node:fs'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'

// MIME types for common file extensions
const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  return mimeTypes[ext] || 'application/octet-stream'
}

function findPackageDir(): string | null {
  const possiblePaths = [
    // For workspace link (development)
    path.join(process.cwd(), 'node_modules', 'react-devtools-plus'),
    // Resolved from monorepo
    path.resolve(process.cwd(), '../../react-devtools'),
  ]

  // Also try require.resolve
  try {
    // Use dynamic import resolution
    const pkgPath = require.resolve('react-devtools-plus/package.json')
    possiblePaths.unshift(path.dirname(pkgPath))
  }
  catch {
    // Ignore
  }

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      // Verify it's the right package
      const pkgJsonPath = path.join(p, 'package.json')
      if (fs.existsSync(pkgJsonPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'))
          if (pkg.name === 'react-devtools-plus') {
            return p
          }
        }
        catch {
          // Continue checking
        }
      }
    }
  }

  return null
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  try {
    const params = await context.params
    const pathSegments = params.path || []
    const requestPath = pathSegments.join('/')

    const packageDir = findPackageDir()
    if (!packageDir) {
      return new NextResponse(`react-devtools-plus package not found.\nCWD: ${process.cwd()}\nChecked paths, but none matched.`, {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      })
    }

    console.log('[DevTools API] Found package at:', packageDir)

    // Handle overlay.mjs special case
    if (requestPath === 'overlay.mjs') {
      const overlayPaths = [
        path.join(packageDir, 'src', 'overlay', 'react-devtools-overlay.mjs'),
        path.join(packageDir, 'dist', 'overlay', 'react-devtools-overlay.mjs'),
      ]

      for (const overlayPath of overlayPaths) {
        if (fs.existsSync(overlayPath)) {
          const content = fs.readFileSync(overlayPath, 'utf-8')
          return new NextResponse(content, {
            headers: {
              'Content-Type': 'application/javascript; charset=utf-8',
              'Cache-Control': 'no-cache',
            },
          })
        }
      }

      return new NextResponse(`Overlay not found`, { status: 404 })
    }

    // Handle overlay CSS
    if (requestPath === 'overlay.css') {
      const cssPaths = [
        path.join(packageDir, 'src', 'overlay', 'react-devtools-overlay.css'),
        path.join(packageDir, 'dist', 'overlay', 'react-devtools-overlay.css'),
      ]

      for (const cssPath of cssPaths) {
        if (fs.existsSync(cssPath)) {
          const content = fs.readFileSync(cssPath, 'utf-8')
          return new NextResponse(content, {
            headers: {
              'Content-Type': 'text/css; charset=utf-8',
              'Cache-Control': 'no-cache',
            },
          })
        }
      }
    }

    // Find the client directory
    const clientDir = path.join(packageDir, 'client')
    if (!fs.existsSync(clientDir)) {
      return new NextResponse(`DevTools client not found`, { status: 404 })
    }

    // Determine the file to serve
    let filePath = path.join(clientDir, requestPath || 'index.html')

    // SPA fallback
    if (!requestPath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(clientDir, 'index.html')
    }

    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 })
    }

    let content: string | Buffer = fs.readFileSync(filePath)
    const mimeType = getMimeType(filePath)

    // Fix relative paths in HTML
    if (filePath.endsWith('.html')) {
      let htmlContent = content.toString('utf-8')
      // Replace relative paths with absolute paths to this API route
      htmlContent = htmlContent.replace(/src="\.\/assets\//g, 'src="/api/devtools/assets/')
      htmlContent = htmlContent.replace(/href="\.\/assets\//g, 'href="/api/devtools/assets/')
      content = htmlContent
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'no-cache',
      },
    })
  }
  catch (error) {
    console.error('[React DevTools] Error:', error)
    return new NextResponse('Error', { status: 500 })
  }
}
