/**
 * webpack-dev-server Version Detection
 *
 * webpack-dev-server 3.x (for Webpack 4) uses different API than 4.x+ (for Webpack 5)
 * - v3: contentBase, before/after hooks
 * - v4+: static, setupMiddlewares hook
 */

import fs from 'node:fs'
import path from 'node:path'

// Use 'any' for Compiler to support both webpack 4 and 5 types
type Compiler = any

/**
 * webpack-dev-server version information
 */
export interface DevServerVersionInfo {
  /** Major version number */
  major: number
  /** Full version string (if detected) */
  version: string
  /** Whether this is v3.x API */
  isV3: boolean
  /** Whether this is v4.x+ API */
  isV4Plus: boolean
}

/**
 * Detect webpack-dev-server version from devServer options and compiler context
 *
 * Detection strategy:
 * 1. First, check the actual installed package version (most reliable)
 * 2. Then check for v4+-specific options (static, setupMiddlewares)
 * 3. Then check for v3-specific options (contentBase, before, after)
 * 4. Default to v4+ API
 *
 * Note: We prioritize package.json detection over config options because
 * in monorepos with hoisted dependencies, the config might use v3 options
 * but the actual installed package could be v4+.
 */
export function detectDevServerVersion(
  devServerOptions: any,
  compiler: Compiler,
): DevServerVersionInfo {
  // First, try to detect from package.json (most reliable)
  const detectedVersion = detectFromPackageJson(compiler)
  if (detectedVersion) {
    return detectedVersion
  }

  // Check for v4+ specific options
  if (hasV4PlusOptions(devServerOptions)) {
    return { major: 4, version: '4.x+', isV3: false, isV4Plus: true }
  }

  // Check for v3-specific options
  if (hasV3Options(devServerOptions)) {
    return { major: 3, version: '3.x', isV3: true, isV4Plus: false }
  }

  // Default to v4+ API as it's more common in modern setups
  return { major: 4, version: '4.x+ (assumed)', isV3: false, isV4Plus: true }
}

/**
 * Check if devServer options contain v3-specific properties
 */
function hasV3Options(devServerOptions: any): boolean {
  return (
    devServerOptions.contentBase !== undefined
    || typeof devServerOptions.before === 'function'
    || typeof devServerOptions.after === 'function'
  )
}

/**
 * Check if devServer options contain v4+-specific properties
 */
function hasV4PlusOptions(devServerOptions: any): boolean {
  return (
    devServerOptions.static !== undefined
    || typeof devServerOptions.setupMiddlewares === 'function'
  )
}

/**
 * Try to detect version from webpack-dev-server package.json
 */
function detectFromPackageJson(compiler: Compiler): DevServerVersionInfo | null {
  const contextPath = compiler.context || process.cwd()

  const possiblePaths = [
    path.join(contextPath, 'node_modules', 'webpack-dev-server', 'package.json'),
    path.join(contextPath, '..', 'node_modules', 'webpack-dev-server', 'package.json'),
    path.join(contextPath, '..', '..', 'node_modules', 'webpack-dev-server', 'package.json'),
  ]

  for (const pkgPath of possiblePaths) {
    try {
      if (fs.existsSync(pkgPath)) {
        const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
        const version = pkgJson.version || ''
        const major = Number.parseInt(version.split('.')[0], 10) || 4

        return {
          major,
          version,
          isV3: major === 3,
          isV4Plus: major >= 4,
        }
      }
    }
    catch {
      continue
    }
  }

  return null
}

/**
 * Check if webpack-dev-server is version 3.x
 */
export function isDevServerV3(devServerOptions: any, compiler: Compiler): boolean {
  return detectDevServerVersion(devServerOptions, compiler).isV3
}

/**
 * Middleware adapter for different webpack-dev-server versions
 */
export interface MiddlewareSetup {
  /** Middleware name (for v4+) */
  name: string
  /** Optional path prefix */
  path?: string
  /** The middleware function */
  middleware: (req: any, res: any, next?: () => void) => void
}

/**
 * DevServer middleware adapter
 */
export const DevServerMiddlewareAdapter = {
  /**
   * Apply middleware for webpack-dev-server v3
   */
  applyV3(
    devServerOptions: any,
    middlewares: MiddlewareSetup[],
  ): void {
    const originalBefore = devServerOptions.before

    devServerOptions.before = (app: any, server: any, compiler: any) => {
      // Apply all middlewares
      for (const { path: pathPrefix, middleware } of middlewares) {
        if (pathPrefix) {
          app.use(pathPrefix, middleware)
        }
        else {
          app.use(middleware)
        }
      }

      // Call original before if it exists
      if (originalBefore) {
        originalBefore(app, server, compiler)
      }
    }
  },
  /**
   * Apply middleware for webpack-dev-server v4+
   */
  applyV4Plus(
    devServerOptions: any,
    middlewares: MiddlewareSetup[],
  ): void {
    const originalSetupMiddlewares = devServerOptions.setupMiddlewares

    devServerOptions.setupMiddlewares = (existingMiddlewares: any[], devServer: any) => {
      // Call original setupMiddlewares if it exists
      let result = existingMiddlewares
      if (originalSetupMiddlewares) {
        result = originalSetupMiddlewares(existingMiddlewares, devServer)
      }

      // Prepend our middlewares (reverse order to maintain priority)
      for (const setup of [...middlewares].reverse()) {
        result.unshift({
          name: setup.name,
          path: setup.path,
          middleware: setup.middleware,
        })
      }

      return result
    }
  },
  /**
   * Apply middleware based on detected version
   */
  apply(
    devServerOptions: any,
    compiler: any,
    middlewares: MiddlewareSetup[],
  ): void {
    if (isDevServerV3(devServerOptions, compiler)) {
      this.applyV3(devServerOptions, middlewares)
    }
    else {
      this.applyV4Plus(devServerOptions, middlewares)
    }
  },
}
