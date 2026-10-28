import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// During development /api is forwarded to the FastAPI backend, so no CORS setup is needed locally.
// Override the target with VITE_DEV_API_TARGET if the backend runs elsewhere.
const apiTarget = process.env.VITE_DEV_API_TARGET || 'http://localhost:8000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true },
      '/docs': { target: apiTarget, changeOrigin: true },
      '/openapi.json': { target: apiTarget, changeOrigin: true },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true },
      '/docs': { target: apiTarget, changeOrigin: true },
      '/openapi.json': { target: apiTarget, changeOrigin: true },
    },
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react')) return 'vendor-react'
          if (id.includes('node_modules/lucide-react')) return 'vendor-icons'
          if (id.includes('node_modules/qrcode')) return 'vendor-qr'
        },
      },
    },
  },
})
