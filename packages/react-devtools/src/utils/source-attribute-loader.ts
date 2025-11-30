/**
 * Webpack loader for injecting data-source-path attributes to JSX elements
 * 
 * This loader is used when babel-loader is not available (e.g., Next.js with SWC).
 * It runs as a pre-loader to add source location attributes before the main compilation.
 */

import type { LoaderContext } from 'webpack'
import { transformSourceCode } from './babel-transform'

interface LoaderOptions {
  projectRoot: string
  sourcePathMode: 'absolute' | 'relative'
}

export default function sourceAttributeLoader(
  this: LoaderContext<LoaderOptions>,
  source: string,
) {
  const options = this.getOptions()
  const { projectRoot, sourcePathMode } = options

  // Get the resource path (file being processed)
  const resourcePath = this.resourcePath

  console.log('[React DevTools Loader] Processing:', resourcePath)

  // Skip if not a JSX/TSX file
  if (!resourcePath.match(/\.[jt]sx$/)) {
    console.log('[React DevTools Loader] Skipping (not JSX/TSX):', resourcePath)
    return source
  }

  // Skip node_modules
  if (resourcePath.includes('node_modules')) {
    console.log('[React DevTools Loader] Skipping (node_modules):', resourcePath)
    return source
  }

  console.log('[React DevTools Loader] Transforming:', resourcePath)

  try {
    const result = transformSourceCode(
      source,
      resourcePath,
      true, // enableInjection
      projectRoot,
      sourcePathMode,
    )

    if (result?.code) {
      console.log('[React DevTools Loader] Transform success:', resourcePath)
      // Return transformed code with source map
      if (result.map) {
        this.callback(null, result.code, result.map)
        return
      }
      return result.code
    }
    else {
      console.log('[React DevTools Loader] Transform returned no code:', resourcePath)
    }
  }
  catch (error) {
    // Log error but don't fail the build
    console.warn('[React DevTools] Source attribute loader error:', error)
  }

  // Return original source if transformation failed
  return source
}

