import type { IncomingMessage, ServerResponse } from 'node:http'
import fs from 'node:fs'
import { transformSync } from '@babel/core'

export function createPluginFileMiddleware() {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const rawUrl = req.url || ''
    const url = new URL(rawUrl, 'http://localhost')

    // Log all requests to /__react_devtools__/ to debug
    if (rawUrl.includes('__react_devtools__')) {
      // console.log('[React DevTools] Middleware Request:', rawUrl, 'Pathname:', url.pathname)
    }

    // Strict match for the file path
    if (url.pathname === '/__react_devtools__/file') {
      const filePath = url.searchParams.get('path')
      if (!filePath) {
        console.error('[React DevTools] Plugin file middleware: Missing path parameter', req.url)
        res.statusCode = 400
        res.end('Missing path parameter')
        return
      }

      // console.log('[React DevTools] Processing plugin file:', filePath)

      try {
        const decodedPath = decodeURIComponent(filePath)

        if (!fs.existsSync(decodedPath)) {
          console.error('[React DevTools] Plugin file middleware: File not found', decodedPath)
          res.statusCode = 404
          res.end('File not found')
          return
        }

        const content = fs.readFileSync(decodedPath, 'utf-8')
        const isTs = decodedPath.endsWith('.ts') || decodedPath.endsWith('.tsx')
        const isJsx = decodedPath.endsWith('.jsx') || decodedPath.endsWith('.tsx')

        // Transform code
        const result = transformSync(content, {
          filename: decodedPath,
          presets: [
            ['@babel/preset-react', {
              runtime: 'classic', // Switch to classic runtime to avoid jsx-dev-runtime imports
              development: true,
            }],
            ['@babel/preset-typescript', { isTSX: isJsx, allExtensions: true, allowDeclareFields: true }],
          ],
          plugins: [
            // Plugin to rewrite imports for browser compatibility
            // - "import React from 'react'" -> "const React = window.React"
            // - "import { ... } from 'react-devtools-plus/api'" -> "const { ... } = window.__REACT_DEVTOOLS_API__"
            function () {
              return {
                visitor: {
                  ImportDeclaration(path: any) {
                    const source = path.node.source.value

                    // Rewrite React imports
                    if (source === 'react') {
                      const defaultSpecifier = path.node.specifiers.find(
                        (s: any) => s.type === 'ImportDefaultSpecifier',
                      )
                      if (defaultSpecifier) {
                        const localName = defaultSpecifier.local.name
                        path.replaceWith({
                          type: 'VariableDeclaration',
                          kind: 'const',
                          declarations: [
                            {
                              type: 'VariableDeclarator',
                              id: { type: 'Identifier', name: localName },
                              init: {
                                type: 'MemberExpression',
                                object: { type: 'Identifier', name: 'window' },
                                property: { type: 'Identifier', name: 'React' },
                              },
                            },
                          ],
                        })
                      }
                      else {
                        const namespaceSpecifier = path.node.specifiers.find(
                          (s: any) => s.type === 'ImportNamespaceSpecifier',
                        )
                        if (namespaceSpecifier) {
                          const localName = namespaceSpecifier.local.name
                          path.replaceWith({
                            type: 'VariableDeclaration',
                            kind: 'const',
                            declarations: [
                              {
                                type: 'VariableDeclarator',
                                id: { type: 'Identifier', name: localName },
                                init: {
                                  type: 'MemberExpression',
                                  object: { type: 'Identifier', name: 'window' },
                                  property: { type: 'Identifier', name: 'React' },
                                },
                              },
                            ],
                          })
                        }
                        else {
                          path.remove()
                        }
                      }
                    }

                    // Rewrite react-devtools-plus/api imports
                    // These are exposed via window.__REACT_DEVTOOLS_API__ by the DevTools client
                    if (source === 'react-devtools-plus/api' || source === '@react-devtools-plus/api') {
                      const namedSpecifiers = path.node.specifiers.filter(
                        (s: any) => s.type === 'ImportSpecifier',
                      )
                      const typeOnlySpecifiers = path.node.specifiers.filter(
                        (s: any) => s.type === 'ImportSpecifier' && s.importKind === 'type',
                      )

                      // If all specifiers are type-only, just remove the import
                      if (namedSpecifiers.length === typeOnlySpecifiers.length) {
                        path.remove()
                        return
                      }

                      // Filter out type-only specifiers for value imports
                      const valueSpecifiers = namedSpecifiers.filter(
                        (s: any) => s.importKind !== 'type',
                      )

                      if (valueSpecifiers.length > 0) {
                        // Create destructuring: const { usePluginRpc, usePluginEvent } = window.__REACT_DEVTOOLS_API__
                        const properties = valueSpecifiers.map((s: any) => ({
                          type: 'ObjectProperty',
                          key: { type: 'Identifier', name: s.imported.name },
                          value: { type: 'Identifier', name: s.local.name },
                          shorthand: s.imported.name === s.local.name,
                          computed: false,
                        }))

                        path.replaceWith({
                          type: 'VariableDeclaration',
                          kind: 'const',
                          declarations: [
                            {
                              type: 'VariableDeclarator',
                              id: {
                                type: 'ObjectPattern',
                                properties,
                              },
                              init: {
                                type: 'MemberExpression',
                                object: { type: 'Identifier', name: 'window' },
                                property: { type: 'Identifier', name: '__REACT_DEVTOOLS_API__' },
                              },
                            },
                          ],
                        })
                      }
                      else {
                        // No value imports, just remove
                        path.remove()
                      }
                    }
                  },
                },
              }
            },
          ],
        })

        res.setHeader('Content-Type', 'application/javascript')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.end(result?.code || '')
        return
      }
      catch (e) {
        console.error('[React DevTools] Failed to transform plugin file:', e)
        res.statusCode = 500
        res.end(JSON.stringify({ error: (e as Error).message }))
        return
      }
    }

    next()
  }
}
