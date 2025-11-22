import type { ComponentTreeNode } from '@vue/devtools-react-kit'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import ReactLogo from '~/components/assets/ReactLogo'
import pkg from '../../package.json'

interface OverviewPageProps {
  tree: ComponentTreeNode | null
}

function countComponents(node: ComponentTreeNode): number {
  let count = 1
  for (const child of node.children) {
    count += countComponents(child)
  }
  return count
}

function Card({ children, className = '', to }: { children: React.ReactNode, className?: string, to?: string }) {
  const navigate = useNavigate()
  const handleClick = () => {
    if (to) {
      navigate(to)
    }
  }

  return (
    <div
      className={`${className} p-4 rounded-lg border border-base bg-base shadow-sm flex flex-col items-center justify-center gap-2 min-h-[120px] ${to ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      {children}
    </div>
  )
}

export function OverviewPage({ tree }: OverviewPageProps) {
  const componentCount = tree ? countComponents(tree) : 0
  const reactVersion = '18.3.1' // Mock version for now

  return (
    <div className="h-full w-full overflow-auto panel-grids p-8">
      <div className="flex flex-col items-center justify-center min-h-full">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="flex items-center gap-2">
            <ReactLogo className="w-16 h-16 text-[#61DAFB]" />
            <h1 className="text-5xl font-bold m-0 bg-clip-text text-transparent bg-gradient-to-r from-[#61DAFB] to-[#00b7ff]">
              DevTools
            </h1>
          </div>
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400">
              React DevTools v{pkg.version}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl mb-8">
          <Card className="theme-card-primary">
            <ReactLogo className="w-8 h-8 mb-1 text-#00b7ff" />
            <span className="text-xl font-bold text-#00b7ff">v{reactVersion}</span>
          </Card>
          <Card className="theme-card-primary" to="/components">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-1 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="7" x="14" y="3" rx="1" />
              <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" />
            </svg>
            <span className="flex items-center gap-1 text-primary-500">
              <span className="text-xl font-bold">{componentCount}</span>
              <span className="text-sm">Components</span>
            </span>
          </Card>
          <Card className="theme-card-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-1 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            <span className="flex items-center gap-1 text-primary-500">
              <span className="text-xl font-bold">1</span>
              <span className="text-sm">Pages</span>
            </span>
          </Card>
        </div>

        <div className="flex flex-col gap-4 text-center text-gray-500 dark:text-gray-400">
          <div className="flex gap-6 justify-center text-sm">
            <a href="https://github.com/facebook/react/tree/main/packages/react-devtools" target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 transition-colors">
              Star on GitHub
            </a>
            <a href="https://react.dev" target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 transition-colors">
              Documentation
            </a>
          </div>

          <div className="flex items-center gap-2 text-xs mt-4 bg-white dark:bg-[#1a1a1a] px-4 py-2 rounded border border-base shadow-sm">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-sans">⇧ Shift</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-sans">⌥ Option</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-sans">D</kbd>
            <span>to toggle DevTools</span>
          </div>
        </div>
      </div>
    </div>
  )
}
