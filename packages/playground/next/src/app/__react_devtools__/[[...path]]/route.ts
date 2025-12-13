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
  // Try multiple paths to find the package
  const possiblePaths = [
    path.join(process.cwd(), 'node_modules', 'react-devtools-plus'),
  ]

  // Try to resolve from package.json
  try {
    const pkgPath = require.resolve('react-devtools-plus/package.json')
    possiblePaths.push(path.dirname(pkgPath))
  }
  catch {
    // Ignore resolution errors
  }

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p
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
      return new NextResponse('react-devtools-plus package not found', { status: 404 })
    }

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

      return new NextResponse(`Overlay not found. Searched:\n${overlayPaths.join('\n')}`, {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      })
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
      return new NextResponse(`DevTools client not found at ${clientDir}`, { status: 404 })
    }

    // Determine the file to serve
    let filePath = path.join(clientDir, requestPath || 'index.html')

    // If path is empty or doesn't exist as file, serve index.html (SPA fallback)
    if (!requestPath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(clientDir, 'index.html')
    }

    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 })
    }

    const content = fs.readFileSync(filePath)
    const mimeType = getMimeType(filePath)

    return new NextResponse(content, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'no-cache',
      },
    })
  }
  catch (error) {
    console.error('[React DevTools] Error serving client:', error)
    return new NextResponse('Error loading DevTools client', { status: 500 })
  }
}
