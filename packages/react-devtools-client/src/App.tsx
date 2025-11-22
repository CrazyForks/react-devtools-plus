import { createRpcClient, openInEditor } from '@vue/devtools-react-kit'
import { useEffect, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import ReactLogo from '~/components/assets/ReactLogo'
import { ComponentsPage } from './pages/ComponentsPage'
import { OverviewPage } from './pages/OverviewPage'

function ComponentsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" />
    </svg>
  )
}

function NavItem({ to, icon: Icon, label }: { to: string, icon: any, label: string }) {
  const location = useLocation()
  const isActive = location.pathname === to
  const navigate = useNavigate()

  return (
    <div
      className={`group relative p-2 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400'}`}
      onClick={() => navigate(to)}
    >
      <Icon className="w-6 h-6" />
      <div className="absolute left-14 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
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
    createRpcClient({
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
    }, {
      preset: 'iframe',
    })

    window.parent.postMessage('__REACT_DEVTOOLS_CLIENT_READY__', '*')
  }, [])

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/overview', { replace: true })
    }
  }, [location.pathname, navigate])

  return (
    <div className="h-screen w-full flex bg-base text-base font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-12 border-r border-base flex flex-col items-center py-4 gap-2 bg-base z-50">
        <NavItem to="/overview" icon={ReactLogo} label="Overview" />
        <NavItem to="/components" icon={ComponentsIcon} label="Components" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50 dark:bg-[#0b0b0b]">
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
        </Routes>
      </div>
    </div>
  )
}
