import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    host: true, // same as --host
    port: 5173,
    watch: {
      usePolling: true, // Required if you are on Windows/macOS using Docker
    },
    hmr: {
      clientPort: 5173, // Forces HMR to use the exposed port
    },
  }});
