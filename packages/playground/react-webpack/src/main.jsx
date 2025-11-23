import { ThemeProvider } from '@react-devtools/ui'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import '@react-devtools/ui/style.css'
import './style.css'

// Note: React Scan is now auto-injected via webpack.config.js
// 注意：React Scan 现在通过 webpack.config.js 自动注入

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider config={{ primaryColor: 'react', mode: 'auto' }}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)
