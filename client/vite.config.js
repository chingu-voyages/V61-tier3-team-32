import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    hmr: {
      overlay: false,
    },
  },
  esbuild: {
    sourcemap: false,
  },
  build: {
    sourcemap: false,
  },
  optimizeDeps: {
    force: false,
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
