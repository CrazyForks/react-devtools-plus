import { createRpcClient, openInEditor } from '@react-devtools/kit'
import { useEffect, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import ReactLogo from '~/components/assets/ReactLogo'
import { pluginEvents } from './events'
import { ComponentsPage } from './pages/ComponentsPage'
import { OverviewPage } from './pages/OverviewPage'
import { ScanPage } from './pages/ScanPage'

function ComponentsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" />
    </svg>
  )
}

function ScanIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M8 12h8" />
    </svg>
  )
}

function NavItem({ to, icon: Icon, label }: { to: string, icon: any, label: string }) {
  const location = useLocation()
  const isActive = location.pathname === to
  const navigate = useNavigate()

  return (
    <div
      className={`group relative cursor-pointer rounded-lg p-2 transition-colors ${isActive ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400'}`}
      onClick={() => navigate(to)}
    >
      <Icon className="h-6 w-6" />
      <div className="pointer-events-none absolute left-14 top-1/2 z-50 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity -translate-y-1/2 group-hover:opacity-100">
        {label}
      </div>
    </div>
  )
}

export function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [tree, setTree] = useState<any>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  useEffect(() => {
    // Define server-side RPC functions that the client can call
    interface ServerRpcFunctions {
      inspectNode: (fiberId: string) => void
      hideHighlight: () => void
      rebuildTree: (showHostComponents: boolean) => void
      toggleInspector: (enabled: boolean) => void
      toggleInspectorMode: (mode: 'select-component' | 'open-in-editor') => void
      openInEditor: (options: { fileName: string, line: number, column: number }) => void
      callPluginRPC: (pluginId: string, rpcName: string, ...args: any[]) => Promise<any>
      subscribeToPluginEvent: (pluginId: string, eventName: string) => () => void
    }

    // Define client-side RPC functions that the server can call
    interface ClientRpcFunctions {
      updateTree: (newTree: any) => void
      selectNode: (fiberId: string) => void
      openInEditor: (payload: { fileName: string, line: number, column: number }) => void
      onPluginEvent: (pluginId: string, eventName: string, data: any) => void
    }

    createRpcClient<ServerRpcFunctions, ClientRpcFunctions>({
      updateTree(newTree: any) {
        setTree(newTree)
      },
      selectNode(fiberId: string) {
        setSelectedNodeId(fiberId)
        // Ensure we are on the components page
        if (location.pathname !== '/components') {
          navigate('/components')
        }
      },
      openInEditor(payload: { fileName: string, line: number, column: number }) {
        openInEditor(payload.fileName, payload.line, payload.column)
      },
      onPluginEvent(pluginId: string, eventName: string, data: any) {
        // Emit event to local listeners
        pluginEvents.emit(`${pluginId}:${eventName}`, data)
      },
    }, {
      preset: 'iframe',
    })

    // Send ready message when loaded
    window.parent.postMessage('__REACT_DEVTOOLS_CLIENT_READY__', '*')

    // Also listen for create client message from parent (handshake)
    const handleMessage = (event: MessageEvent) => {
      if (event.data === '__REACT_DEVTOOLS_CREATE_CLIENT__') {
        window.parent.postMessage('__REACT_DEVTOOLS_CLIENT_READY__', '*')
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/overview', { replace: true })
    }
  }, [location.pathname, navigate])

  return (
    <div className="h-screen w-full flex overflow-hidden bg-base text-base font-sans">
      {/* Sidebar */}
      <div className="z-50 w-12 flex flex-col items-center gap-2 border-r border-base bg-base py-4">
        <NavItem to="/overview" icon={ReactLogo} label="Overview" />
        <NavItem to="/components" icon={ComponentsIcon} label="Components" />
        <NavItem to="/scan" icon={ScanIcon} label="React Scan" />
      </div>

      {/* Main Content */}
      <div className="min-w-0 flex flex-1 flex-col overflow-hidden bg-gray-50 dark:bg-[#0b0b0b]">
        <Routes>
          <Route path="/overview" element={<OverviewPage tree={tree} />} />
          <Route
            path="/components"
            element={(
              <ComponentsPage
                tree={tree}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
              />
            )}
          />
          <Route path="/scan" element={<ScanPage />} />
        </Routes>
      </div>
    </div>
  )
}
