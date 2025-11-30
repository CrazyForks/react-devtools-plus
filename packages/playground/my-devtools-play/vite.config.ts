import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import MyDevTools from 'my-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // User just uses MyDevTools, and gets the "ContextInspector" plugin for free!
    MyDevTools.vite(), 
    react()
  ],
})

