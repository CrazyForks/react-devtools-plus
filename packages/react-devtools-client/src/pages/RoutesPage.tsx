import { getRpcClient } from '@react-devtools/kit'
import { useCallback, useEffect, useState } from 'react'

interface RouteInfo {
  path: string
  name?: string
  element?: string
  children?: RouteInfo[]
}

interface RouterState {
  currentPath: string
  routes: RouteInfo[]
  routerType: 'react-router' | 'unknown' | null
}

interface ServerRpcFunctions {
  getRouterInfo: () => Promise<RouterState | null>
  navigateTo: (path: string) => Promise<boolean>
}

function RouteIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function flattenRoutes(routes: RouteInfo[], parentPath = ''): RouteInfo[] {
  const result: RouteInfo[] = []
  for (const route of routes) {
    const fullPath = route.path.startsWith('/')
      ? route.path
      : `${parentPath}/${route.path}`.replace(/\/+/g, '/')
    result.push({ ...route, path: fullPath || '/' })
    if (route.children) {
      result.push(...flattenRoutes(route.children, fullPath))
    }
  }
  return result
}

function RouteItem({
  route,
  isActive,
  level = 0,
  onNavigate,
}: {
  route: RouteInfo
  isActive: boolean
  level?: number
  onNavigate: (path: string) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = route.children && route.children.length > 0

  return (
    <div className="w-full">
      <div
        className={`group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
          isActive
            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50'
        }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={() => onNavigate(route.path)}
      >
        {hasChildren && (
          <button
            className="shrink-0 p-0.5 -ml-1"
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
          >
            <ChevronDownIcon
              className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? '' : '-rotate-90'}`}
            />
          </button>
        )}
        <div className="min-w-0 flex flex-1 items-center gap-2">
          {isActive && (
            <span className="shrink-0 rounded bg-primary-500 px-1.5 py-0.5 text-xs text-white font-medium">
              active
            </span>
          )}
          <span className="truncate text-sm font-mono">{route.path}</span>
        </div>
        {route.name && (
          <span className="shrink-0 text-xs text-gray-400">{route.name}</span>
        )}
      </div>
      {hasChildren && expanded && (
        <div className="mt-0.5">
          {route.children!.map((child, index) => (
            <RouteItem
              key={`${child.path}-${index}`}
              route={child}
              isActive={false}
              level={level + 1}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function RoutesPage() {
  const [currentPath, setCurrentPath] = useState('')
  const [inputPath, setInputPath] = useState('')
  const [routes, setRoutes] = useState<RouteInfo[]>([])
  const [routerType, setRouterType] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchRouterInfo = useCallback(async () => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (!rpc)
      return

    try {
      const info = await rpc.getRouterInfo()
      if (info) {
        setCurrentPath(info.currentPath)
        setInputPath(info.currentPath)
        setRoutes(info.routes)
        setRouterType(info.routerType)
      }
    }
    catch (e) {
      console.error('[RoutesPage] Failed to fetch router info:', e)
    }
    finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRouterInfo()

    // Poll for route changes every 500ms
    const interval = setInterval(fetchRouterInfo, 500)
    return () => clearInterval(interval)
  }, [fetchRouterInfo])

  const handleNavigate = useCallback(async (path: string) => {
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (!rpc)
      return

    try {
      const success = await rpc.navigateTo(path)
      if (success) {
        setCurrentPath(path)
        setInputPath(path)
      }
    }
    catch (e) {
      console.error('[RoutesPage] Failed to navigate:', e)
    }
  }, [])

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputPath && inputPath !== currentPath) {
      handleNavigate(inputPath)
    }
  }

  const flatRoutes = flattenRoutes(routes)

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50/50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="h-8 w-8 animate-spin border-2 border-primary-500 border-t-transparent rounded-full" />
          <span>Loading routes...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-gray-50/50 dark:bg-neutral-950">
      {/* Header */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-[#121212]">
        <div className="flex items-center gap-3">
          <RouteIcon className="h-5 w-5 text-primary-500" />
          <h1 className="text-lg text-gray-900 font-semibold dark:text-white">Routes</h1>
          {routerType && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              {routerType}
            </span>
          )}
        </div>
      </div>

      {/* Current Route Input */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-[#121212]">
        <label className="mb-2 block text-sm text-gray-500 font-medium dark:text-gray-400">
          Current route
        </label>
        <form onSubmit={handleInputSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 text-gray-400 -translate-y-1/2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 10 4 15 9 20" />
                <path d="M20 4v7a4 4 0 0 1-4 4H4" />
              </svg>
            </span>
            <input
              type="text"
              value={inputPath}
              onChange={e => setInputPath(e.target.value)}
              className="w-full border border-primary-300 rounded-lg bg-white py-2 pl-9 pr-3 text-sm ring-2 ring-primary-100 transition-all dark:border-primary-700 focus:border-primary-500 dark:bg-[#1a1a1a] dark:text-white focus:outline-none dark:ring-primary-900/50 focus:ring-primary-200 dark:focus:ring-primary-800"
              placeholder="Enter path to navigate..."
            />
          </div>
          <button
            type="submit"
            disabled={!inputPath || inputPath === currentPath}
            className="shrink-0 rounded-lg bg-primary-500 px-4 py-2 text-sm text-white font-medium transition-colors disabled:cursor-not-allowed hover:bg-primary-600 disabled:opacity-50"
          >
            Go
          </button>
        </form>
        <p className="mt-1.5 text-xs text-gray-400">
          Edit path above to navigate
        </p>
      </div>

      {/* Routes List */}
      <div className="flex-1 overflow-auto p-4">
        <div className="border border-gray-200 rounded-xl bg-white dark:border-gray-800 dark:bg-[#121212]">
          {/* Section Header */}
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <div className="flex items-center gap-2">
              <RouteIcon className="h-5 w-5 text-gray-400" />
              <span className="text-gray-900 font-medium dark:text-white">All Routes</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                {flatRoutes.length}
                {' '}
                routes registered in your application
              </span>
            </div>
            <ChevronDownIcon
              className={`h-5 w-5 text-gray-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
            />
          </button>

          {/* Routes Table */}
          {!isCollapsed && (
            <div className="border-t border-gray-200 dark:border-gray-800">
              {/* Table Header */}
              <div className="flex border-b border-gray-100 bg-gray-50/50 px-4 py-2 text-xs text-gray-500 font-semibold tracking-wide uppercase dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400">
                <div className="flex-1">Route Path</div>
                <div className="w-32 text-right">Name</div>
              </div>

              {/* Routes */}
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {flatRoutes.length === 0
                  ? (
                      <div className="px-4 py-8 text-center text-gray-400">
                        <RouteIcon className="mx-auto mb-2 h-8 w-8 opacity-50" />
                        <p>No routes detected</p>
                        <p className="mt-1 text-xs">Make sure your app uses React Router</p>
                      </div>
                    )
                  : (
                      flatRoutes.map((route, index) => {
                        const isActive = route.path === currentPath
                        return (
                          <div
                            key={`${route.path}-${index}`}
                            className={`group flex cursor-pointer items-center px-4 py-2.5 transition-colors ${
                              isActive
                                ? 'bg-primary-50 dark:bg-primary-900/20'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-900/50'
                            }`}
                            onClick={() => handleNavigate(route.path)}
                          >
                            <div className="flex flex-1 items-center gap-2">
                              {isActive && (
                                <span className="shrink-0 rounded bg-primary-500 px-1.5 py-0.5 text-xs text-white font-medium">
                                  active
                                </span>
                              )}
                              <span
                                className={`text-sm font-mono ${
                                  isActive
                                    ? 'text-primary-600 dark:text-primary-400'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {route.path}
                              </span>
                            </div>
                            <div className="w-32 text-right text-sm text-gray-400">
                              {route.name || route.element || '-'}
                            </div>
                          </div>
                        )
                      })
                    )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
