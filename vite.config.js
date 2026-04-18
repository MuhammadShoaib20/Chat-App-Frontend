import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill for process.env and global (for libraries like simple-peer)
    'process.env': {},
    global: 'globalThis',
  },
  resolve: {
    alias: {
      process: 'process/browser',
      buffer: 'buffer',
    },
  },
  build: {
    // Increase chunk size warning limit to 1000 kB (adjust as needed)
    chunkSizeWarningLimit: 1000,
  },
})