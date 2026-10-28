import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    target: 'esnext',
    sourcemap: false, // Skip source maps in production to reduce memory usage
    rollupOptions: {
      output: {
        // Manual chunks reduce peak memory by splitting large vendor libraries
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          if (id.includes('node_modules/jspdf')) {
            return 'vendor-pdf';
          }
          if (id.includes('node_modules/qrcode')) {
            return 'vendor-qr';
          }
          if (id.includes('node_modules/canvas-confetti')) {
            return 'vendor-canvas';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // 1MB chunks are acceptable for institutional app
  },
})
