'use client'

import { useState } from 'react'

export default function Home() {
  const [count, setCount] = useState(0)

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Next.js Playground</h1>
      
      <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '1rem' }}>
        <p>This is a Next.js application.</p>
        <p>If the React DevTools integration works, you should see the overlay and be able to toggle it.</p>
        <p>Check the &quot;Plugins&quot; tab in the DevTools panel to see the custom Next.js plugin.</p>
      </div>

      <div style={{ padding: '1rem', border: '1px solid #6366f1', borderRadius: '8px', background: '#eef2ff' }}>
        <h2 style={{ margin: '0 0 1rem 0' }}>Counter Demo</h2>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 1rem 0' }}>{count}</p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setCount(c => c - 1)}
            style={{ 
              padding: '0.5rem 1rem', 
              fontSize: '1rem',
              cursor: 'pointer',
              borderRadius: '4px',
              border: '1px solid #6366f1',
              background: 'white',
            }}
          >
            -
          </button>
          <button 
            onClick={() => setCount(c => c + 1)}
            style={{ 
              padding: '0.5rem 1rem', 
              fontSize: '1rem',
              cursor: 'pointer',
              borderRadius: '4px',
              border: 'none',
              background: '#6366f1',
              color: 'white',
            }}
          >
            +
          </button>
          <button 
            onClick={() => setCount(0)}
            style={{ 
              padding: '0.5rem 1rem', 
              fontSize: '1rem',
              cursor: 'pointer',
              borderRadius: '4px',
              border: '1px solid #ccc',
              background: '#f5f5f5',
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </main>
  )
}
