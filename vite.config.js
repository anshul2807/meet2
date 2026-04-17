import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    // proxy: {
    //   '/socket.io': {
    //     target: 'http://localhost:3001',
    //     // target: 'http://192.168.1.7:3001',
    //     ws: true,
    //   },
    // },
  },
})
