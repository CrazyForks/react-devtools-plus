import { getRpcClient } from '@react-devtools/kit'
import { useEffect, useState } from 'react'

interface ScanConfig {
  enabled?: boolean
  showToolbar?: boolean
  showOutlines?: boolean
  animationSpeed?: 'slow' | 'fast' | 'off'
  log?: boolean
  clearLog?: boolean
}

export function ScanPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [config, setConfig] = useState<ScanConfig>({
    enabled: true,
    showToolbar: true,
    showOutlines: true,
    animationSpeed: 'fast',
    log: false,
    clearLog: false,
  })

  useEffect(() => {
    // Get initial config from the scan plugin
    const rpc = getRpcClient() as any
    if (rpc?.callPluginRPC) {
      rpc.callPluginRPC('react-scan', 'getOptions')
        .then((initialConfig: ScanConfig) => {
          if (initialConfig) {
            setConfig(prev => ({ ...prev, ...initialConfig }))
          }
        })
        .catch(() => {
          // Scan plugin might not be available
        })
    }
  }, [])

  const handleToggleScan = async () => {
    const rpc = getRpcClient() as any
    if (!rpc?.callPluginRPC)
      return

    try {
      // Check if scan is currently active
      const isActive = await rpc.callPluginRPC('react-scan', 'isActive')

      // Toggle based on current state
      const result = isActive
        ? await rpc.callPluginRPC('react-scan', 'stop')
        : await rpc.callPluginRPC('react-scan', 'start')

      if (result) {
        setIsRunning(!isActive)
      }
    }
    catch (error) {
      console.error('[Scan Page] Failed to toggle scan:', error)
    }
  }

  const handleStartScan = async () => {
    const rpc = getRpcClient() as any
    if (!rpc?.callPluginRPC)
      return

    try {
      const result = await rpc.callPluginRPC('react-scan', 'start')
      if (result) {
        setIsRunning(true)
      }
    }
    catch (error) {
      console.error('[Scan Page] Failed to start scan:', error)
    }
  }

  const handleStopScan = async () => {
    const rpc = getRpcClient() as any
    if (!rpc?.callPluginRPC)
      return

    try {
      const result = await rpc.callPluginRPC('react-scan', 'stop')
      if (result) {
        setIsRunning(false)
      }
    }
    catch (error) {
      console.error('[Scan Page] Failed to stop scan:', error)
    }
  }

  const handleConfigChange = async (key: keyof ScanConfig, value: any) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)

    const rpc = getRpcClient() as any
    if (!rpc?.callPluginRPC)
      return

    try {
      await rpc.callPluginRPC('react-scan', 'setOptions', newConfig)
    }
    catch (error) {
      console.error('[Scan Page] Failed to update config:', error)
    }
  }

  return (
    <div className="h-full flex flex-col bg-base">
      {/* Header */}
      <div className="border-b border-base bg-base px-4 py-3">
        <h1 className="text-xl text-gray-900 font-semibold dark:text-gray-100">
          React Scan
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Performance analysis and render visualization
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Status Card */}
          <div className="border border-gray-200 rounded-lg bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg text-gray-900 font-medium dark:text-gray-100">
                  Scan Status
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {isRunning ? 'Currently monitoring React renders' : 'Scan is not running'}
                </p>
              </div>
              <div className={`h-3 w-3 flex items-center justify-center rounded-full ${isRunning ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                {isRunning && (
                  <div className="h-3 w-3 animate-ping rounded-full bg-green-400 opacity-75"></div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleStartScan}
                disabled={isRunning}
                className="rounded-lg bg-primary-500 px-4 py-2 text-sm text-white font-medium transition-colors disabled:cursor-not-allowed hover:bg-primary-600 disabled:opacity-50"
              >
                Start Scan
              </button>
              <button
                type="button"
                onClick={handleStopScan}
                disabled={!isRunning}
                className="border border-gray-300 rounded-lg bg-white px-4 py-2 text-sm text-gray-700 font-medium transition-colors disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:text-gray-300 disabled:opacity-50 dark:hover:bg-gray-600"
              >
                Stop Scan
              </button>
              <button
                type="button"
                onClick={handleToggleScan}
                className="border border-gray-300 rounded-lg bg-white px-4 py-2 text-sm text-gray-700 font-medium transition-colors dark:border-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Toggle
              </button>
            </div>
          </div>

          {/* Configuration Card */}
          <div className="border border-gray-200 rounded-lg bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg text-gray-900 font-medium dark:text-gray-100">
              Configuration
            </h2>

            <div className="space-y-4">
              {/* Show Toolbar */}
              <label className="flex cursor-pointer items-center justify-between">
                <div>
                  <div className="text-sm text-gray-900 font-medium dark:text-gray-100">
                    Show Toolbar
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Display the React Scan toolbar on the page
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.showToolbar ?? true}
                  onChange={e => handleConfigChange('showToolbar', e.target.checked)}
                  className="h-4 w-4 border-gray-300 rounded text-primary-600 focus:ring-primary-500"
                />
              </label>

              {/* Show Outlines */}
              <label className="flex cursor-pointer items-center justify-between">
                <div>
                  <div className="text-sm text-gray-900 font-medium dark:text-gray-100">
                    Show Outlines
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Show visual outlines around re-rendering components
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.showOutlines ?? true}
                  onChange={e => handleConfigChange('showOutlines', e.target.checked)}
                  className="h-4 w-4 border-gray-300 rounded text-primary-600 focus:ring-primary-500"
                />
              </label>

              {/* Animation Speed */}
              <div>
                <label className="mb-2 block text-sm text-gray-900 font-medium dark:text-gray-100">
                  Animation Speed
                </label>
                <select
                  value={config.animationSpeed || 'fast'}
                  onChange={e => handleConfigChange('animationSpeed', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="slow">Slow</option>
                  <option value="fast">Fast</option>
                  <option value="off">Off</option>
                </select>
              </div>

              {/* Log */}
              <label className="flex cursor-pointer items-center justify-between">
                <div>
                  <div className="text-sm text-gray-900 font-medium dark:text-gray-100">
                    Console Logging
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Log render information to the console
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.log ?? false}
                  onChange={e => handleConfigChange('log', e.target.checked)}
                  className="h-4 w-4 border-gray-300 rounded text-primary-600 focus:ring-primary-500"
                />
              </label>
            </div>
          </div>

          {/* Info Card */}
          <div className="border border-blue-200 rounded-lg bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="flex">
              <svg className="mr-3 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium">
                  About React Scan
                </p>
                <p className="mt-1">
                  React Scan helps you identify performance issues by visualizing component renders in real-time.
                  Components that re-render frequently will be highlighted, making it easy to spot unnecessary updates.
                </p>
                <p className="mt-2">
                  <a
                    href="https://react-scan.million.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    Learn more about React Scan →
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
