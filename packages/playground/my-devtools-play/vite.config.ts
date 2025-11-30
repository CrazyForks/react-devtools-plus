import react from '@vitejs/plugin-react'
import MyDevTools from 'my-devtools'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // User just uses MyDevTools, and gets the "ContextInspector" plugin for free!
    MyDevTools.vite({
      theme: {
        mode: 'dark', // auto or light or dark
        primaryColor: 'orange', // Custom primary color
      },
    }),
    react(),
  ],
})
