import react from '@vitejs/plugin-react'
import ReactDevTools from 'react-devtools'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    ReactDevTools.vite({
      enabledEnvironments: ['development', 'test'],
    }),
    react(),
  ],
})
