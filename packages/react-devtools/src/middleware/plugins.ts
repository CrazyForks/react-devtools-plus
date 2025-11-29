import type { IncomingMessage, ServerResponse } from 'node:http'
import type { ResolvedPluginConfig, UserPlugin } from '../config/types'

export function createPluginsMiddleware(
  config: ResolvedPluginConfig,
  transformPath?: (path: string) => string,
) {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const rawUrl = req.url || ''
    const url = new URL(rawUrl, 'http://localhost')

    // We mount this middleware globally in both Vite and Webpack.
    // This ensures consistent behavior and allows us to strictly match the full path.
    const isMatch = url.pathname === '/__react_devtools__/plugins-manifest.json'

    if (isMatch) {
      // console.log('[React DevTools] Serving plugins manifest from:', rawUrl)
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Access-Control-Allow-Origin', '*')

      const plugins = (config.plugins || []).map((plugin): UserPlugin => {
        if (plugin.view && plugin.view.src && transformPath) {
          return {
            ...plugin,
            view: {
              ...plugin.view,
              src: transformPath(plugin.view.src),
            },
          }
        }
        return plugin
      })

      res.end(JSON.stringify(plugins))
      return
    }
    next()
  }
}
