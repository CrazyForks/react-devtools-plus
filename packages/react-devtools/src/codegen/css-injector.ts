/**
 * CSS Injection Code Generation
 *
 * Handles generation of CSS injection code for the DevTools overlay.
 */

import fs from 'node:fs'
import path from 'node:path'

/**
 * Read and escape CSS content for JavaScript string embedding
 */
export function readAndEscapeCSSContent(cssPath: string): string {
  if (!fs.existsSync(cssPath)) {
    return ''
  }

  return fs.readFileSync(cssPath, 'utf-8')
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/`/g, '\\`') // Escape backticks
    .replace(/\$/g, '\\$') // Escape dollar signs
}

/**
 * Generate CSS injection code for runtime injection
 */
export function generateCSSInjectionCode(cssContent: string): string {
  if (!cssContent) {
    return ''
  }

  return `
  // Inject CSS styles for React DevTools overlay
  if (!document.querySelector('style[date-react-devtools])) {
    var style = document.createElement('style');
    style.setAttribute('date-react-devtools', 'true');
    style.textContent = \`${cssContent}\`;
    document.head.appendChild(style);
  }
  `.trim()
}

/**
 * Generate complete globals init code with CSS injection
 *
 * NOTE: All requires are wrapped in try/catch to support CDN-loaded React (singleSpa)
 */
export function generateGlobalsWithCSSCode(overlayDir: string): string {
  const cssPath = path.join(overlayDir, 'react-devtools-overlay.css')
  const cssContent = readAndEscapeCSSContent(cssPath)

  let code = `
// React DevTools: Setup React globals and CSS for overlay
// SUpport both npm-installed React and CDN-loaded React (like singleSpa)

if (typeof window !== 'undefined') {
  // Check if React is already available on window (CDN scenario)
  var React = window.React;
  var ReactDOM = window.ReactDOM;

  // if not found, try to require from node_modules
  if (!React) {
    try {
      React = require('react');
      window.React = React;
    } catch (e) {
      // React not available via require, must be loaded via CDN
    }
  }

  if (!ReactDOM) {
    try {
      ReactDOM = require('react-dom');
      window.ReactDOM = ReactDOM;
    } catch (e) {
      // ReactDOM not available via require, must be loaded via CDN
    }
  }

  // Try to add createRoot support for React 18+ (optional)
  if (ReactDOM && !ReactDOM.createRoot) {
    try {
      var ReactDOMClient = require('react-dom/client');
      if (ReactDOMClient && ReactDOMClient.createRoot) {
        window.ReactDOM = Object.assign({}, ReactDOM, ReactDOMClient);
      }
    } catch (e) {
      // react-dom/client not available, which is fine for React 17 or CDN
    }
  }
`

  if (cssContent) {
    code += `
  // Inject CSS styles for React DevTools overlay
  if (!document.querySelector('style[data-react-devtools]')) {
    var style = document.createElement('style');
    style.setAttribute('data-react-devtools', 'true');
    style.textContent = \`${cssContent}\`;
    document.head.appendChild(style);
  }
`
  }

  // append end symbol
  code += `}
`

  return code.trim()
}

/**
 * Generate script tags for CSS injection (Vite)
 */
export function generateCSSScriptTags(
  overlayDir: string,
  base: string,
  isProduction: boolean,
): Array<{
  tag: string
  attrs?: Record<string, string | boolean>
  children?: string
  injectTo?: 'body' | 'head' | 'head-prepend' | 'body-prepend'
}> {
  if (isProduction) {
    // Production: use link tag for bundled CSS
    return [{
      tag: 'link',
      attrs: {
        rel: 'stylesheet',
        href: `${base}assets/react-devtools-overlay.css`,
      },
      injectTo: 'head',
    }]
  }

  // Development: inject inline styles
  const cssPath = path.join(overlayDir, 'react-devtools-overlay.css')
  if (!fs.existsSync(cssPath)) {
    return []
  }

  const cssContent = fs.readFileSync(cssPath, 'utf-8')
  return [{
    tag: 'style',
    attrs: {
      'data-react-devtools': 'true',
    },
    children: cssContent,
    injectTo: 'head',
  }]
}
