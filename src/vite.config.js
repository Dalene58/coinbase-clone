import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',  // ← ADD THIS LINE - ensures proper routing
  plugins: [
    react(),
    tailwindcss(),
  ],
})