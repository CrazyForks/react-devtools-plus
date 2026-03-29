/**
 * Server-side middleware for handling `/__open-in-editor` requests.
 *
 * This module can be used standalone or through the ReactTracer unplugin.
 */

import type { SourcePathMode } from './types'
import { exec } from 'node:child_process'
import path from 'node:path'

/**
 * Parse an editor path in `"file:line:column"` format.
 */
export function parseEditorPath(editorPath: string): {
  filePath: string
  line?: number
  column?: number
} {
  const parts = editorPath.split(':')
  const filePath = parts[0]
  const line = parts[1] ? Number.parseInt(parts[1], 10) : undefined
  const column = parts[2] ? Number.parseInt(parts[2], 10) : undefined
  return { filePath, line, column }
}

/**
 * Convert file path + line + column to editor CLI format: `"file:line:column"`.
 */
export function convertToEditorPath(
  filePath: string,
  line?: number,
  column?: number,
): string {
  const parts = [filePath]
  if (line !== undefined)
    parts.push(String(line))
  if (column !== undefined && line !== undefined)
    parts.push(String(column))
  return parts.join(':')
}

/**
 * Resolve a relative path to absolute based on project root.
 */
export function resolveRelativeToAbsolute(
  relativePath: string,
  projectRoot: string,
  sourcePathMode: SourcePathMode,
): string {
  if (sourcePathMode === 'absolute' || path.isAbsolute(relativePath)) {
    return relativePath
  }

  const segments = relativePath.split('/')
  const pathFromRoot = segments.length > 1 ? segments.slice(1).join('/') : relativePath
  return path.resolve(projectRoot, pathFromRoot)
}

/**
 * Open a file in the configured editor.
 *
 * @param filePath - File path in `"path:line:column"` format
 * @param projectRoot - Project root directory
 * @param sourcePathMode - Path mode (`'absolute'` or `'relative'`)
 * @param launchEditor - Editor command (e.g. `'code'`, `'cursor'`, `'webstorm'`)
 */
export async function openFileInEditor(
  filePath: string,
  projectRoot: string,
  sourcePathMode: SourcePathMode,
  launchEditor?: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const { filePath: file, line, column } = parseEditorPath(filePath)
    const absolutePath = resolveRelativeToAbsolute(file, projectRoot, sourcePathMode)
    const editorPath = convertToEditorPath(absolutePath, line, column)
    const editorCmd = launchEditor || process.env.EDITOR || 'code'
    const cmd = `${editorCmd} -g "${editorPath}"`

    exec(cmd, (error) => {
      if (error) {
        console.error('[react-tracer] Failed to open editor:', error)
        reject(error)
      }
      else {
        resolve()
      }
    })
  })
}

/**
 * Create an Express/Connect-compatible middleware for `/__open-in-editor` requests.
 *
 * @param projectRoot - Project root directory
 * @param sourcePathMode - Path mode
 * @param launchEditor - Editor command
 */
export function createOpenInEditorMiddleware(
  projectRoot: string,
  sourcePathMode: SourcePathMode,
  launchEditor?: string,
) {
  return async (req: any, res: any, next?: () => void) => {
    if (!req.url?.startsWith('/__open-in-editor')) {
      next?.()
      return
    }

    const url = new URL(req.url, `http://${req.headers.host}`)
    const file = url.searchParams.get('file')

    if (!file) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'text/plain')
      res.end('Missing file parameter')
      return
    }

    const editorFromClient = url.searchParams.get('editor')
    const effectiveEditor = launchEditor || editorFromClient || undefined

    try {
      await openFileInEditor(file, projectRoot, sourcePathMode, effectiveEditor)
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/plain')
      res.end('OK')
    }
    catch (error: any) {
      console.error('[react-tracer] Failed to execute editor command:', error.message)
      res.statusCode = 500
      res.setHeader('Content-Type', 'text/plain')
      res.end('Failed to open editor')
    }
  }
}
