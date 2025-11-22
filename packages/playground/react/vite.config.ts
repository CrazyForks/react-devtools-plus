import react from '@vitejs/plugin-react'
import ReactDevTools from '@vue/devtools-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    ReactDevTools({
      enabledEnvironments: ['development', 'test'],
    }),
    react(),
  ],
})
