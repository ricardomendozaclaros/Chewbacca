import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://3.13.156.101", // La URL de tu API
        changeOrigin: true, // Cambia el origen para evitar bloqueos
        rewrite: (path) => path.replace(/^\/api/, ""), // Elimina el prefijo '/api'
      },
    },
  },
})
