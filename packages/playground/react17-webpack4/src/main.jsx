import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './style.scss'

// Note: React Scan is now auto-injected via webpack.config.js
// 注意：React Scan 现在通过 webpack.config.js 自动注入

// React 17 uses ReactDOM.render (not createRoot which is React 18+)
// eslint-disable-next-line react-dom/no-render
ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root'),
)
