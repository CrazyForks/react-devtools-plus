import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Helper to get absolute path to plugin files
// In a real package build, you might need to copy these files to dist or handle them differently
// For this monorepo playground, we point to the source
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const getBuiltinPlugins = () => {
  // When running from dist/index.js, __dirname is .../packages/playground/my-devtools/dist
  // We copy the plugins to dist/plugins during build
  const pluginPath = path.resolve(__dirname, './plugins/ContextInspector.tsx')

  return [
    {
      name: 'context-inspector',
      view: {
        title: 'Inspector',
        // Eye icon
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
        src: pluginPath,
      },
    },
  ]
}
