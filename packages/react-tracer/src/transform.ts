/**
 * Babel transformation for injecting `data-source-path` attributes into JSX elements.
 *
 * This module can be used standalone or through the ReactTracer unplugin.
 */

import type { NodePath } from '@babel/core'
import type { JSXOpeningElement } from '@babel/types'
import type { SourcePathMode } from './types'
import path from 'node:path'
import { transformSync, types } from '@babel/core'

/**
 * Create a Babel plugin that injects `data-source-path` attributes.
 *
 * Each JSX element gets a `data-source-path="path/to/file.tsx:line:column"`
 * attribute based on its source location.
 */
export function createSourceAttributePlugin(projectRoot: string, pathMode: SourcePathMode) {
  return function sourceAttributePlugin() {
    return {
      name: 'react-tracer-source-attribute',
      visitor: {
        JSXOpeningElement(nodePath: NodePath<JSXOpeningElement>) {
          const loc = nodePath.node.loc
          if (!loc)
            return

          const filename = (this as any).file?.opts?.filename || ''
          if (!filename)
            return

          let finalPath = filename
          if (pathMode === 'relative' && path.isAbsolute(filename) && projectRoot) {
            const parentDir = path.dirname(projectRoot)
            finalPath = path.relative(parentDir, filename)
            finalPath = finalPath.split(path.sep).join('/')
          }

          nodePath.node.attributes.push(
            types.jsxAttribute(
              types.jsxIdentifier('data-source-path'),
              types.stringLiteral(`${finalPath}:${loc.start.line}:${loc.start.column}`),
            ),
          )
        },
      },
    }
  }
}

/**
 * Transform source code with Babel, injecting `data-source-path` attributes.
 *
 * Only processes `.jsx` and `.tsx` files.
 *
 * @returns Transformed code and source map, or `null` if the file should not be processed.
 */
export function transformSourceCode(
  code: string,
  id: string,
  projectRoot: string,
  sourcePathMode: SourcePathMode,
): { code: string, map: any } | null {
  if (!id.match(/\.[jt]sx$/))
    return null

  try {
    const result = transformSync(code, {
      filename: id,
      presets: [
        ['@babel/preset-react', { runtime: 'automatic' }],
        ['@babel/preset-typescript', { allowDeclareFields: true }],
      ],
      plugins: [createSourceAttributePlugin(projectRoot, sourcePathMode)],
      ast: true,
      sourceMaps: true,
      configFile: false,
      babelrc: false,
    })

    return result?.code ? { code: result.code, map: result.map } : null
  }
  catch (error) {
    console.error('[react-tracer] Babel transform error:', error)
    return null
  }
}

/**
 * Check if a file should be processed by the Babel transform.
 *
 * Excludes `node_modules`, HTML files, and static assets.
 */
export function shouldProcessFile(id: string): boolean {
  if (id.includes('node_modules'))
    return false

  if (id.endsWith('.html') || id.endsWith('.htm'))
    return false

  if (/\.(?:css|scss|sass|less|styl|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i.test(id))
    return false

  return true
}
