import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, //make the app run on port 3000, if available (my laptop defualts to port 5173 for some reason).
    proxy: {
      '/api': 'http://localhost:5000',
    },
  }
})
