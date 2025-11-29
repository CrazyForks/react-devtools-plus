/**
 * React Scan Initialization Code Generation
 *
 * Generates code for initializing React Scan performance monitoring.
 * React Scan must be initialized before React runs to properly hook into React.
 */

import type { ScanConfig } from '../config/types'
import path from 'node:path'

/**
 * Default scan options
 */
const DEFAULT_SCAN_OPTIONS: Partial<ScanConfig> = {
  enabled: true,
  showToolbar: false,
  log: true,
  animationSpeed: 'fast',
  showOutlines: true,
}

/**
 * Normalize scan options with defaults
 */
export function normalizeScanOptions(options: ScanConfig): ScanConfig {
  return {
    ...DEFAULT_SCAN_OPTIONS,
    ...options,
  }
}

/**
 * Generate React Scan initialization code for Vite (ESM)
 */
export function generateScanInitESMCode(options: ScanConfig): string {
  const normalizedOptions = normalizeScanOptions(options)

  return `
import { initScan, ReactScanInternals, setOptions, getOptions, scan } from 'react-devtools/scan';

if (typeof window !== 'undefined') {
  window.__REACT_SCAN_INTERNALS__ = ReactScanInternals;
  window.__REACT_SCAN_SET_OPTIONS__ = setOptions;
  window.__REACT_SCAN_GET_OPTIONS__ = getOptions;
  window.__REACT_SCAN_SCAN__ = scan;
}

if (ReactScanInternals) {
  ReactScanInternals.runInAllEnvironments = true;
}

scan(${JSON.stringify(normalizedOptions)});
`.trim()
}

/**
 * Generate React Scan initialization code for Webpack (CommonJS)
 */
export function generateScanInitCJSCode(options: ScanConfig): string {
  const normalizedOptions = {
    ...normalizeScanOptions(options),
    showOutlines: true, // Force show outlines for Webpack
  }

  // Resolve the actual path to scan.cjs
  const scanPackagePath = path.dirname(require.resolve('react-devtools/package.json'))
  const scanModulePath = path.join(scanPackagePath, 'dist', 'scan.cjs').replace(/\\/g, '/')

  return `
var scanModule = require('${scanModulePath}');
var initScan = scanModule.initScan;
var ReactScanInternals = scanModule.ReactScanInternals;
var setOptions = scanModule.setOptions;
var getOptions = scanModule.getOptions;
var scan = scanModule.scan;

if (typeof window !== 'undefined') {
  window.__REACT_SCAN_INTERNALS__ = ReactScanInternals;
  window.__REACT_SCAN_SET_OPTIONS__ = setOptions;
  window.__REACT_SCAN_GET_OPTIONS__ = getOptions;
  window.__REACT_SCAN_SCAN__ = scan;
}

// Ensure we run in all environments
if (ReactScanInternals) {
  ReactScanInternals.runInAllEnvironments = true;
}

initScan(${JSON.stringify(normalizedOptions)});
`.trim()
}

/**
 * Generate script tag for React Scan (Vite)
 */
export function generateScanScriptTag(
  base: string,
  options: ScanConfig,
): {
  tag: 'script'
  attrs: { type: string }
  children: string
  injectTo: 'head-prepend'
} {
  return {
    tag: 'script',
    attrs: { type: 'module' },
    children: `import '${base}@id/__react-devtools-scan__';`,
    injectTo: 'head-prepend',
  }
}
