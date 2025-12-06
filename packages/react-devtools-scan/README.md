# @react-devtools-plus/scan

React Scan integration layer for React DevTools.

## Overview

This package provides a seamless integration between [react-scan](https://github.com/aidenybai/react-scan) and React DevTools, making it easy to add powerful performance analysis capabilities to your React applications.

## Features

- 🚀 **Easy Setup**: Single function call to enable React Scan
- 🎨 **Flexible Integration**: Choose between overlay, panel, or both modes
- ⚙️ **Full Configuration**: Access to all react-scan options
- 🔧 **Runtime Control**: Start, stop, and configure scan at runtime
- 📦 **Type Safe**: Full TypeScript support

## Installation

```bash
pnpm add @react-devtools-plus/scan
```

## Quick Start

### Basic Usage

```typescript
import { initScan } from '@react-devtools-plus/scan';

// Initialize with defaults (development only)
initScan();
```

### Custom Configuration

```typescript
import { initScan } from '@react-devtools-plus/scan';

const scanInstance = initScan({
  enabled: true,
  showToolbar: true,
  animationSpeed: 'fast',
  trackUnnecessaryRenders: true,
  integrationMode: 'overlay',
});

// Control at runtime
scanInstance.stop();
scanInstance.start();
```

### With React DevTools Plugin

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { reactDevtools } from 'react-devtools/vite';

export default defineConfig({
  plugins: [
    reactDevtools({
      scan: {
        enabled: true,
        showToolbar: true,
      },
    }),
  ],
});
```

## API

### `initScan(options?)`

Initialize React Scan with optional configuration.

**Parameters:**

- `options` (optional): `ReactDevtoolsScanOptions`

**Returns:** `ScanInstance`

### `getScan()`

Get the current scan instance.

**Returns:** `ScanInstance | null`

### `ScanInstance` Methods

- `getOptions()`: Get current scan options
- `setOptions(options)`: Update scan options at runtime
- `start()`: Start scanning
- `stop()`: Stop scanning
- `isActive()`: Check if scanning is active

## Configuration Options

All [react-scan options](https://github.com/aidenybai/react-scan#options) are supported, plus:

```typescript
interface ReactDevtoolsScanOptions {
  // ... all react-scan options

  /**
   * Integration mode
   * @default 'overlay'
   */
  integrationMode?: 'overlay' | 'panel' | 'both';

  /**
   * Sync state with DevTools panel
   * @default true
   */
  syncWithDevtools?: boolean;
}
```

## Examples

### Conditional Enabling

```typescript
import { initScan } from '@react-devtools-plus/scan';

if (process.env.NODE_ENV === 'development') {
  initScan({
    enabled: true,
    log: false,
  });
}
```

### Runtime Control

```typescript
import { getScan } from '@react-devtools-plus/scan';

// Later in your code...
const scan = getScan();

if (scan?.isActive()) {
  // Temporarily disable for screenshot
  scan.stop();
  takeScreenshot();
  scan.start();
}
```

### Custom Animation Speed

```typescript
import { initScan } from '@react-devtools-plus/scan';

initScan({
  animationSpeed: 'slow', // 'slow' | 'fast' | 'off'
});
```

## Integration with React DevTools

This package is designed to work seamlessly with the React DevTools plugin system. When used together, you get:

- Unified configuration through the DevTools plugin
- Automatic injection in development builds
- Coordinated UI between DevTools panel and Scan overlay

See [React DevTools Scan Integration Guide](../../REACT_SCAN_INTEGRATION.md) for more details.

## License

MIT
