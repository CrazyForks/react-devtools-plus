import React from 'react'

export default function MyPlugin(props: any) {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold">My Custom Plugin</h1>
      <div className="rounded bg-white p-4 shadow dark:bg-gray-800">
        <p className="mb-2">This is a custom plugin loaded from vite.config.ts!</p>
        <p className="text-sm text-gray-500">Context Data:</p>
        <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-900" style={{ maxHeight: '350px' }}>
          {JSON.stringify(props, null, 2)}
        </pre>
      </div>
    </div>
  )
}
