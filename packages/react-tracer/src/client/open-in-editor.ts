/**
 * JetBrains IDEs that use the `open?file=` URL format
 */
const JETBRAINS_EDITORS = [
  'webstorm',
  'phpstorm',
  'idea',
  'intellij',
  'pycharm',
  'rubymine',
  'goland',
  'clion',
  'rider',
  'appcode',
  'datagrip',
  'dataspell',
]

function buildEditorUrl(editor: string, fileName: string, line: number, column: number): string {
  const editorLower = editor.toLowerCase()

  if (JETBRAINS_EDITORS.some(ide => editorLower.includes(ide))) {
    return `${editor}://open?file=${encodeURIComponent(fileName)}&line=${line}&column=${column}`
  }

  return `${editor}://file/${fileName}:${line}:${column}`
}

/**
 * Get the configured editor from the global config or localStorage.
 *
 * Priority: global config > localStorage > default `'vscode'`
 */
export function getConfiguredEditor(): string {
  const config = (window as any).__REACT_TRACER_CONFIG__
    || (window as any).__REACT_DEVTOOLS_CONFIG__
  if (config?.launchEditor) {
    return config.launchEditor
  }

  const stored = localStorage.getItem('react_tracer_editor')
    || localStorage.getItem('react_devtools_editor')
  if (stored) {
    return stored
  }

  return 'vscode'
}

function isValidApiResponse(response: Response): boolean {
  if (!response.ok)
    return false
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('text/html'))
    return false
  return true
}

/**
 * Try to open a file in the editor using URL protocol (fallback).
 */
function tryOpenWithProtocol(fileName: string, line: number, column: number): boolean {
  try {
    const editor = getConfiguredEditor()
    const protocolUrl = buildEditorUrl(editor, fileName, line, column)

    const link = document.createElement('a')
    link.href = protocolUrl
    link.click()
    link.remove()

    return true
  }
  catch (e) {
    console.warn('[react-tracer] Failed to open with URL protocol:', e)
    return false
  }
}

/**
 * Open a source file in the editor.
 *
 * Tries server-side `/__open-in-editor` endpoints first,
 * then falls back to URL protocol (`vscode://file/...`).
 *
 * @param fullpath - Full path in `"path/to/file.tsx:line:column"` format
 */
export async function openInEditor(fullpath: string): Promise<void>
/**
 * Open a source file in the editor.
 *
 * @param fileName - File path
 * @param line - Line number
 * @param column - Column number
 */
export async function openInEditor(fileName: string, line: number, column: number): Promise<void>
export async function openInEditor(fileOrFullpath: string, line?: number, column?: number): Promise<void> {
  const fileParam = line !== undefined
    ? encodeURIComponent(`${fileOrFullpath}:${line}:${column || 0}`)
    : encodeURIComponent(fileOrFullpath)

  const editor = getConfiguredEditor()
  const editorParam = encodeURIComponent(editor)

  const basePath = (() => {
    const config = (window as any).__REACT_DEVTOOLS_CONFIG__
    if (config?.clientUrl) {
      try {
        const url = new URL(config.clientUrl, window.location.origin)
        return url.pathname.replace(/\/$/, '')
      }
      catch { /* fallthrough */ }
    }
    return '/__react_devtools__'
  })()

  const endpoints = [
    `/__open-in-editor?file=${fileParam}&editor=${editorParam}`,
    `${basePath}/api/open-in-editor?file=${fileParam}&editor=${editorParam}`,
  ]

  for (const url of endpoints) {
    try {
      const response = await fetch(url)
      if (isValidApiResponse(response)) {
        return
      }
    }
    catch {
      // try next endpoint
    }
  }

  // All server endpoints failed — try URL protocol
  console.warn('[react-tracer] Server endpoints unavailable, using URL protocol fallback')

  const parts = fileOrFullpath.split(':')
  const fileName2 = parts[0]
  const l = line ?? (parts[1] ? Number.parseInt(parts[1], 10) : 0)
  const c = column ?? (parts[2] ? Number.parseInt(parts[2], 10) : 0)
  tryOpenWithProtocol(fileName2, l, c)
}
