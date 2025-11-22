/**
 * Try to open a file in the editor using URL protocol (fallback)
 */
function tryOpenWithProtocol(fileName: string, line: number, column: number): boolean {
  try {
    // Try to get editor from localStorage (user preference)
    const editor = localStorage.getItem('react_devtools_editor') || 'vscode'

    // Use URL protocol as fallback
    // Format: vscode://file/path/to/file:line:column
    const protocolUrl = `${editor}://file/${fileName}:${line}:${column}`

    const link = document.createElement('a')
    link.href = protocolUrl
    link.click()
    link.remove()

    console.log('[React DevTools] Fallback: Opening with URL protocol:', editor)
    return true
  }
  catch (e) {
    console.warn('[React DevTools] Failed to open with URL protocol:', e)
    return false
  }
}

export function openInEditor(fileName: string, line: number, column: number) {
  try {
    // Primary method: Use server endpoint (works with both Vite and Webpack)
    const url = `/__open-in-editor?file=${encodeURIComponent(`${fileName}:${line}:${column}`)}`

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          // If server endpoint fails (e.g., 404), try URL protocol as fallback
          console.warn('[React DevTools] Server endpoint failed, trying URL protocol fallback')
          tryOpenWithProtocol(fileName, line, column)
        }
      })
      .catch(() => {
        // If fetch fails (e.g., network error), try URL protocol as fallback
        console.warn('[React DevTools] Fetch failed, trying URL protocol fallback')
        tryOpenWithProtocol(fileName, line, column)
      })
  }
  catch (e) {
    console.error('[React DevTools] Failed to open in editor:', e)
    // Last resort: try URL protocol
    tryOpenWithProtocol(fileName, line, column)
  }
}
